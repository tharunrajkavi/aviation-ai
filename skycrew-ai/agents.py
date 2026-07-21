import os
import random
from typing import Dict, List, Any, TypedDict
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END

# Define state structure
class WorkflowState(TypedDict):
    flight_id: int
    flight_number: str
    issue_type: str # WEATHER, CREW_FATIGUE, CREW_SICKNESS
    issue_details: str
    current_crew: List[Dict[str, Any]]
    weather_info: Dict[str, Any]
    compliance_checks: List[Dict[str, Any]]
    matched_crew: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    risk_analysis: Dict[str, Any]
    final_output: Dict[str, Any]

# API Key check
openai_key = os.getenv("OPENAI_API_KEY", "")
llm = ChatOpenAI(temperature=0, openai_api_key=openai_key) if openai_key else None

# 1. WEATHER AGENT
def run_weather_agent(state: WorkflowState) -> Dict[str, Any]:
    print("[Agent] Weather Agent checking weather...")
    # Mock weather or call LLM
    details = state.get("issue_details", "")
    weather_region = "US-EAST"
    
    if "storm" in details.lower() or "rain" in details.lower() or "fog" in details.lower():
        weather_info = {
            "status": "ALERT",
            "condition": "Severe Thunderstorm",
            "visibility": "0.5 miles",
            "wind": "35 knots",
            "delay_recommended_mins": 90,
            "trigger_ai": True
        }
    else:
        weather_info = {
            "status": "CLEAR",
            "condition": "VFR Clear Sky",
            "visibility": "10 miles",
            "wind": "8 knots",
            "delay_recommended_mins": 0,
            "trigger_ai": False
        }
    
    return {"weather_info": weather_info}

# 2. CREW COMPLIANCE AGENT
def run_compliance_agent(state: WorkflowState) -> Dict[str, Any]:
    print("[Agent] Crew Compliance Agent checking FAA/EASA limits...")
    current_crew = state.get("current_crew", [])
    checks = []
    
    for member in current_crew:
        rest = member.get("restHoursRemaining", 12.0)
        hours = member.get("totalFlyingHours", 0.0)
        qualification = member.get("qualification", "")
        
        # Rule 1: Min rest hours is 10 hours (FAA Rule)
        rest_status = "PASS"
        rest_msg = "Adequate rest hours"
        if rest < 10.0:
            rest_status = "FAIL"
            rest_msg = f"Insufficient rest hours: {rest} hrs remaining. FAA requires minimum 10 hrs."
            
        # Rule 2: Max daily flying hours (FAA max 8 hours single duty, we mock monthly/weekly checks)
        flying_status = "PASS"
        flying_msg = "Within monthly limits"
        if hours > 1000.0:
            flying_status = "WARNING"
            flying_msg = f"High cumulative flying hours: {hours} hrs."

        checks.append({
            "crew_id": member.get("id"),
            "name": member.get("name"),
            "qualification": qualification,
            "rest_hours": rest,
            "checks": {
                "rest_hours_check": {"status": rest_status, "message": rest_msg},
                "flying_hours_check": {"status": flying_status, "message": flying_msg}
            },
            "compliant": (rest_status == "PASS")
        })

    return {"compliance_checks": checks}

# 3. CREW MATCHING AGENT
def run_crew_matching_agent(state: WorkflowState) -> Dict[str, Any]:
    print("[Agent] Crew Matching Agent finding qualified crew...")
    # In a real environment, we'd query the DB for available crew members
    # Here we mock candidates who are qualified and at the correct airport
    matched = [
        {
            "id": 3,
            "name": "FO Bob Johnson",
            "type": "PILOT",
            "qualification": "FIRST_OFFICER",
            "certifications": "B737, A320",
            "currentAirportCode": "JFK",
            "restHoursRemaining": 12.0,
            "available": True,
            "flyingHours": 1200.0,
            "seniority_years": 4
        },
        {
            "id": 2,
            "name": "Captain Jane Smith",
            "type": "PILOT",
            "qualification": "CAPTAIN",
            "certifications": "B777, B737",
            "currentAirportCode": "LAX",
            "restHoursRemaining": 14.0,
            "available": True,
            "flyingHours": 6800.0,
            "seniority_years": 10
        },
        {
            "id": 6,
            "name": "Attendant Sarah Davis",
            "type": "CABIN_CREW",
            "qualification": "ATTENDANT",
            "certifications": "B737, B777",
            "currentAirportCode": "LAX",
            "restHoursRemaining": 10.0,
            "available": True,
            "flyingHours": 1400.0,
            "seniority_years": 2
        }
    ]
    return {"matched_crew": matched}

# 4. OPTIMIZATION AGENT
def run_optimization_agent(state: WorkflowState) -> Dict[str, Any]:
    print("[Agent] Optimization Agent building scheduling reallocations...")
    matched = state.get("matched_crew", [])
    checks = state.get("compliance_checks", [])
    weather = state.get("weather_info", {})
    
    recommendations = []
    
    # Analyze who is failing compliance or needs replacement
    failures = [c for c in checks if not c["compliant"]]
    
    # 1. If weather delay recommended, suggest postponing
    if weather.get("delay_recommended_mins", 0) > 0:
        recommendations.append({
            "action": "FLIGHT_DELAY",
            "details": f"Delay departure by {weather.get('delay_recommended_mins')} minutes due to {weather.get('condition')}.",
            "reason": "Ensure weather clearance and flight path safety."
        })
        
    # 2. Swap crew members who are non-compliant
    for fail in failures:
        # Find replacement with matching role
        replacement = None
        for candidate in matched:
            if candidate["type"] == ("PILOT" if "captain" in fail["name"].lower() or "fo" in fail["name"].lower() else "CABIN_CREW"):
                if candidate["restHoursRemaining"] >= 10.0:
                    replacement = candidate
                    break
        
        if replacement:
            recommendations.append({
                "action": "CREW_SWAP",
                "replace_member": fail["name"],
                "with_member": replacement["name"],
                "reason": f"FAA compliance violation alert: {fail['name']} failed rest rules. {replacement['name']} is available at {replacement['currentAirportCode']} and fully rested ({replacement['restHoursRemaining']} hours rest)."
            })
        else:
            recommendations.append({
                "action": "EMERGENCY_STANDBY",
                "replace_member": fail["name"],
                "details": "Assign standby reserve pilot from dispatch base.",
                "reason": f"No immediate qualified crew found locally for {fail['name']} who meets FAA flight limit requirements."
            })
            
    if not recommendations:
        recommendations.append({
            "action": "SCHEDULE_MAINTAIN",
            "details": "Current assignment is compliant and schedules are clean.",
            "reason": "No regulatory or environmental violations found."
        })

    return {"recommendations": recommendations}

# 5. RISK ANALYSIS AGENT
def run_risk_agent(state: WorkflowState) -> Dict[str, Any]:
    print("[Agent] Risk Analysis Agent predicting delays and fatigue...")
    weather = state.get("weather_info", {})
    recs = state.get("recommendations", [])
    
    # Base risk settings
    fatigue_risk = "LOW"
    congestion_risk = "LOW"
    propagation_risk = "LOW"
    overall_score = 15.0
    
    if weather.get("status") == "ALERT":
        congestion_risk = "HIGH"
        propagation_risk = "MEDIUM"
        overall_score += 40.0
        
    has_swap = any(r["action"] == "CREW_SWAP" for r in recs)
    if has_swap:
        fatigue_risk = "MEDIUM"
        overall_score += 20.0
        
    risk_analysis = {
        "fatigue_risk": fatigue_risk,
        "airport_congestion_risk": congestion_risk,
        "delay_propagation_risk": propagation_risk,
        "risk_score": min(overall_score, 100.0),
        "explanation": f"Risk Score of {overall_score}% is driven by: " + 
                       ("Airport weather alert causing potential local traffic congestion. " if congestion_risk == "HIGH" else "") +
                       ("Crew replacement swap introduces minor adaptation fatigue risk. " if has_swap else "Stable operations.")
    }

    return {"risk_analysis": risk_analysis}

# Helper to merge step results
def build_final_output(state: WorkflowState) -> Dict[str, Any]:
    print("[Agent] Gathering final decision output...")
    return {
        "final_output": {
            "flight_number": state.get("flight_number"),
            "weather": state.get("weather_info"),
            "compliance": state.get("compliance_checks"),
            "suggestions": state.get("recommendations"),
            "risk": state.get("risk_analysis")
        }
    }

# Build LangGraph workflow
def get_optimization_workflow():
    workflow = StateGraph(WorkflowState)
    
    # Add nodes
    workflow.add_node("weather", run_weather_agent)
    workflow.add_node("compliance", run_compliance_agent)
    workflow.add_node("matching", run_crew_matching_agent)
    workflow.add_node("optimization", run_optimization_agent)
    workflow.add_node("risk", run_risk_agent)
    workflow.add_node("gather", build_final_output)
    
    # Set entry point
    workflow.set_entry_point("weather")
    
    # Connect edges
    workflow.add_edge("weather", "compliance")
    workflow.add_edge("compliance", "matching")
    workflow.add_edge("matching", "optimization")
    workflow.add_edge("optimization", "risk")
    workflow.add_edge("risk", "gather")
    workflow.add_edge("gather", END)
    
    return workflow.compile()
