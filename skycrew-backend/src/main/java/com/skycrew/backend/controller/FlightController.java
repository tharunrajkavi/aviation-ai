package com.skycrew.backend.controller;

import com.skycrew.backend.model.*;
import com.skycrew.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/flights")
public class FlightController {
    @Autowired
    FlightRepository flightRepository;

    @Autowired
    FlightAssignmentRepository flightAssignmentRepository;

    @Autowired
    CrewMemberRepository crewMemberRepository;

    @Autowired
    AircraftRepository aircraftRepository;

    @Autowired
    AirportRepository airportRepository;

    @GetMapping
    public List<Flight> getAllFlights() {
        return flightRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Flight> getFlightById(@PathVariable Long id) {
        return flightRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('DISPATCHER') or hasRole('ADMIN')")
    public ResponseEntity<?> createFlight(@RequestBody Map<String, Object> flightDto) {
        try {
            String flightNumber = (String) flightDto.get("flightNumber");
            String airline = (String) flightDto.get("airline");
            Long aircraftId = Long.valueOf(flightDto.get("aircraftId").toString());
            Long sourceAirportId = Long.valueOf(flightDto.get("sourceAirportId").toString());
            Long destinationAirportId = Long.valueOf(flightDto.get("destinationAirportId").toString());
            java.time.LocalDateTime departureTime = java.time.LocalDateTime.parse(flightDto.get("departureTime").toString());
            java.time.LocalDateTime arrivalTime = java.time.LocalDateTime.parse(flightDto.get("arrivalTime").toString());
            String status = (String) flightDto.getOrDefault("status", "SCHEDULED");

            Aircraft aircraft = aircraftRepository.findById(aircraftId)
                    .orElseThrow(() -> new RuntimeException("Aircraft not found"));
            Airport source = airportRepository.findById(sourceAirportId)
                    .orElseThrow(() -> new RuntimeException("Source airport not found"));
            Airport dest = airportRepository.findById(destinationAirportId)
                    .orElseThrow(() -> new RuntimeException("Destination airport not found"));

            Flight flight = new Flight(flightNumber, airline, aircraft, source, dest, departureTime, arrivalTime, status);
            return ResponseEntity.ok(flightRepository.save(flight));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error creating flight: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DISPATCHER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateFlight(@PathVariable Long id, @RequestBody Map<String, Object> flightDto) {
        return flightRepository.findById(id).map(flight -> {
            try {
                if (flightDto.containsKey("flightNumber")) flight.setFlightNumber((String) flightDto.get("flightNumber"));
                if (flightDto.containsKey("airline")) flight.setAirline((String) flightDto.get("airline"));
                if (flightDto.containsKey("status")) flight.setStatus((String) flightDto.get("status"));
                if (flightDto.containsKey("departureTime")) flight.setDepartureTime(java.time.LocalDateTime.parse(flightDto.get("departureTime").toString()));
                if (flightDto.containsKey("arrivalTime")) flight.setArrivalTime(java.time.LocalDateTime.parse(flightDto.get("arrivalTime").toString()));
                
                if (flightDto.containsKey("aircraftId")) {
                    Aircraft aircraft = aircraftRepository.findById(Long.valueOf(flightDto.get("aircraftId").toString()))
                            .orElseThrow(() -> new RuntimeException("Aircraft not found"));
                    flight.setAircraft(aircraft);
                }
                if (flightDto.containsKey("sourceAirportId")) {
                    Airport source = airportRepository.findById(Long.valueOf(flightDto.get("sourceAirportId").toString()))
                            .orElseThrow(() -> new RuntimeException("Source airport not found"));
                    flight.setSourceAirport(source);
                }
                if (flightDto.containsKey("destinationAirportId")) {
                    Airport dest = airportRepository.findById(Long.valueOf(flightDto.get("destinationAirportId").toString()))
                            .orElseThrow(() -> new RuntimeException("Destination airport not found"));
                    flight.setDestinationAirport(dest);
                }
                return ResponseEntity.ok(flightRepository.save(flight));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error updating flight: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DISPATCHER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteFlight(@PathVariable Long id) {
        return flightRepository.findById(id).map(flight -> {
            flightRepository.delete(flight);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/assignments")
    public List<FlightAssignment> getFlightAssignments(@PathVariable Long id) {
        return flightAssignmentRepository.findByFlightId(id);
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('DISPATCHER') or hasRole('ADMIN')")
    public ResponseEntity<?> assignCrew(@PathVariable Long id, @RequestBody Map<String, Object> assignDto) {
        return flightRepository.findById(id).map(flight -> {
            try {
                Long crewMemberId = Long.valueOf(assignDto.get("crewMemberId").toString());
                String role = (String) assignDto.get("role"); // COMMANDER, CO_PILOT, CABIN_LEADER, CABIN_MEMBER
                String status = (String) assignDto.getOrDefault("status", "ASSIGNED");

                CrewMember crewMember = crewMemberRepository.findById(crewMemberId)
                        .orElseThrow(() -> new RuntimeException("Crew member not found"));

                FlightAssignment assignment = new FlightAssignment(flight, crewMember, role, status);
                return ResponseEntity.ok(flightAssignmentRepository.save(assignment));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error assigning crew: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}
