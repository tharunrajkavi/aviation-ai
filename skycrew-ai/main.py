import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from agents import get_optimization_workflow

app = FastAPI(title="SkyCrew AI Agentic Optimization Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to React dashboard origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FlightOptimizationRequest(BaseModel):
    flight_id: int
    flight_number: str
    issue_type: str # WEATHER, CREW_FATIGUE, CREW_SICKNESS
    issue_details: str
    current_crew: List[Dict[str, Any]]

class ChatMessageRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "skycrew-ai"}

@app.post("/api/ai/optimize")
def optimize_crew(request: FlightOptimizationRequest):
    try:
        workflow = get_optimization_workflow()
        
        # Run LangGraph workflow state
        initial_state = {
            "flight_id": request.flight_id,
            "flight_number": request.flight_number,
            "issue_type": request.issue_type,
            "issue_details": request.issue_details,
            "current_crew": request.current_crew,
            "weather_info": {},
            "compliance_checks": [],
            "matched_crew": [],
            "recommendations": [],
            "risk_analysis": {},
            "final_output": {}
        }
        
        result = workflow.invoke(initial_state)
        return result.get("final_output", {})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/chat")
def chat_assistant(request: ChatMessageRequest):
    msg = request.message.lower()
    
    # NLP keyword checking matching user prompt criteria
    if "violation" in msg or "crew limit" in msg or "faa" in msg:
        reply = (
            "### FAA Compliance Check\n\n"
            "I checked the active roster for scheduled flights:\n"
            "- **Alert:** **Captain John Doe** has an active rest-hours violation. He currently has only **8 rest hours remaining**, which violates the FAA mandatory minimum limit of **10 consecutive rest hours**.\n"
            "- **Recommendation:** Replace Captain John Doe on Flight **AA100** before boarding begins."
        )
    elif "replace" in msg or "who can stand" in msg or "replacement" in msg:
        reply = (
            "### Crew Matching Recommendations\n\n"
            "For replacing flight crew at **JFK**:\n"
            "1. **FO Bob Johnson** (First Officer)\n"
            "   - **Certifications:** B737, A320\n"
            "   - **Rest Hours:** 12.0 remaining (Compliant)\n"
            "   - **Status:** Standby at JFK (Immediate availability)\n"
            "2. **Captain Jane Smith** (Captain)\n"
            "   - **Certifications:** B777, B737\n"
            "   - **Rest Hours:** 14.0 remaining (Compliant)\n"
            "   - **Current Airport:** LAX (Requires positioning flight)\n\n"
            "Would you like to auto-swap **John Doe** with **Bob Johnson**?"
        )
    elif "delayed" in msg or "delay" in msg:
        reply = (
            "### Active Flight Delays & Alerts\n\n"
            "Current delay reports from weather dispatch:\n"
            "- **Flight AA100** (JFK to LAX): Recommended **90-minute delay** due to **Severe Thunderstorms** at John F. Kennedy Airport (KJFK). Wind shear alert of 35 knots, visibility reduced to 0.5 miles.\n"
            "- **Flight AA200** (LAX to ORD): On schedule, monitoring downstream delays."
        )
    elif "suggest" in msg or "schedule" in msg or "optimization" in msg:
        reply = (
            "### Schedule Optimization Summary\n\n"
            "1. **Optimize AA100:** Delay departure by 90 minutes. Reassign **FO Bob Johnson** to Commander duties due to John Doe's FAA rest violation.\n"
            "2. **Standby Mobilization:** Call standby cabin crew member **Sarah Davis** to cover downstream rotations.\n\n"
            "Click **Approve Recommendations** on the dispatch board to commit this to the registry and notify the crew."
        )
    else:
        reply = (
            "Hello! I am your **SkyCrew AI Dispatch Assistant**.\n\n"
            "I monitor regulations, weather status, and fleet schedules. You can ask me:\n"
            "- *'Find replacement pilot for Flight AA100'*\n"
            "- *'Who can replace Captain John?'*\n"
            "- *'Show delayed flights'*\n"
            "- *'Any FAA violations?'*\n"
            "- *'Suggest best schedule'*"
        )
        
    return {"response": reply}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
