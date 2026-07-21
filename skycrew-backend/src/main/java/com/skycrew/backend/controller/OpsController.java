package com.skycrew.backend.controller;

import com.skycrew.backend.model.*;
import com.skycrew.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ops")
public class OpsController {
    @Autowired
    DutyHourRepository dutyHourRepository;

    @Autowired
    RestHourRepository restHourRepository;

    @Autowired
    WeatherAlertRepository weatherAlertRepository;

    @Autowired
    AIRuleRepository aiRuleRepository;

    @Autowired
    AuditLogRepository auditLogRepository;

    @Autowired
    CrewMemberRepository crewMemberRepository;

    // --- Duty Hours ---
    @GetMapping("/duty-hours")
    public List<DutyHour> getAllDutyHours() {
        return dutyHourRepository.findAll();
    }

    @PostMapping("/duty-hours")
    public ResponseEntity<?> logDutyHours(@RequestBody Map<String, Object> payload) {
        try {
            Long crewId = Long.valueOf(payload.get("crewMemberId").toString());
            LocalDate date = LocalDate.parse(payload.get("date").toString());
            Double hours = Double.valueOf(payload.get("hoursLogged").toString());
            String desc = (String) payload.getOrDefault("description", "Routine flight duty");

            CrewMember crew = crewMemberRepository.findById(crewId)
                    .orElseThrow(() -> new RuntimeException("Crew Member not found"));

            DutyHour dh = new DutyHour(crew, date, hours, desc);
            return ResponseEntity.ok(dutyHourRepository.save(dh));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error logging duty hours: " + e.getMessage()));
        }
    }

    // --- Rest Hours ---
    @GetMapping("/rest-hours")
    public List<RestHour> getAllRestHours() {
        return restHourRepository.findAll();
    }

    @PostMapping("/rest-hours")
    public ResponseEntity<?> logRestHours(@RequestBody Map<String, Object> payload) {
        try {
            Long crewId = Long.valueOf(payload.get("crewMemberId").toString());
            LocalDateTime start = LocalDateTime.parse(payload.get("startTime").toString());
            LocalDateTime end = LocalDateTime.parse(payload.get("endTime").toString());
            Double hours = Double.valueOf(payload.get("hoursLogged").toString());
            String status = (String) payload.getOrDefault("status", "COMPLIANT");

            CrewMember crew = crewMemberRepository.findById(crewId)
                    .orElseThrow(() -> new RuntimeException("Crew Member not found"));

            RestHour rh = new RestHour(crew, start, end, hours, status);
            return ResponseEntity.ok(restHourRepository.save(rh));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error logging rest hours: " + e.getMessage()));
        }
    }

    // --- Weather Alerts ---
    @GetMapping("/weather-alerts")
    public List<WeatherAlert> getWeatherAlerts(@RequestParam(required = false) Boolean active) {
        if (active != null && active) {
            return weatherAlertRepository.findByActiveTrue();
        }
        return weatherAlertRepository.findAll();
    }

    @PostMapping("/weather-alerts")
    public ResponseEntity<?> createWeatherAlert(@RequestBody Map<String, Object> payload) {
        try {
            String airport = (String) payload.get("airportCode");
            String severity = (String) payload.get("severity");
            String weatherType = (String) payload.get("weatherType");
            String message = (String) payload.get("message");
            Boolean active = (Boolean) payload.getOrDefault("active", true);

            WeatherAlert wa = new WeatherAlert(airport, severity, weatherType, message, LocalDateTime.now(), active);
            return ResponseEntity.ok(weatherAlertRepository.save(wa));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error creating weather alert: " + e.getMessage()));
        }
    }

    @PutMapping("/weather-alerts/{id}/deactivate")
    public ResponseEntity<?> deactivateWeatherAlert(@PathVariable Long id) {
        return weatherAlertRepository.findById(id).map(wa -> {
            wa.setActive(false);
            wa.setSeverity("CLEAR");
            wa.setMessage("Cleared: Weather system dispersed");
            return ResponseEntity.ok(weatherAlertRepository.save(wa));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- AI Rules ---
    @GetMapping("/ai-rules")
    public List<AIRule> getAllAIRules() {
        return aiRuleRepository.findAll();
    }

    @PutMapping("/ai-rules/{id}")
    public ResponseEntity<?> updateAIRule(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return aiRuleRepository.findById(id).map(rule -> {
            if (payload.containsKey("ruleValue")) rule.setRuleValue((String) payload.get("ruleValue"));
            if (payload.containsKey("description")) rule.setDescription((String) payload.get("description"));
            if (payload.containsKey("active")) rule.setActive((Boolean) payload.get("active"));
            return ResponseEntity.ok(aiRuleRepository.save(rule));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Audit Logs ---
    @GetMapping("/audit-logs")
    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    @PostMapping("/audit-logs")
    public AuditLog createAuditLog(@RequestBody Map<String, String> payload) {
        String user = payload.getOrDefault("username", "system");
        String action = payload.get("action");
        String details = payload.get("details");
        AuditLog log = new AuditLog(user, action, details, LocalDateTime.now());
        return auditLogRepository.save(log);
    }
}
