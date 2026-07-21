package com.skycrew.backend.controller;

import com.skycrew.backend.model.CrewMember;
import com.skycrew.backend.model.User;
import com.skycrew.backend.model.FlightAssignment;
import com.skycrew.backend.repository.CrewMemberRepository;
import com.skycrew.backend.repository.FlightAssignmentRepository;
import com.skycrew.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/crew")
public class CrewController {
    @Autowired
    CrewMemberRepository crewMemberRepository;

    @Autowired
    FlightAssignmentRepository flightAssignmentRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @GetMapping
    public List<CrewMember> getAllCrew() {
        return crewMemberRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CrewMember> getCrewById(@PathVariable Long id) {
        return crewMemberRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<CrewMember> getCrewByUsername(@PathVariable String username) {
        return crewMemberRepository.findByUserUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/available")
    public List<CrewMember> getAvailableCrew() {
        return crewMemberRepository.findByAvailableTrue();
    }

    @GetMapping("/roster/{username}")
    public List<FlightAssignment> getRosterForCrew(@PathVariable String username) {
        return crewMemberRepository.findByUserUsername(username)
                .map(crew -> flightAssignmentRepository.findByCrewMemberId(crew.getId()))
                .orElse(List.of());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CrewMember> updateCrew(@PathVariable Long id, @RequestBody CrewMember details) {
        return crewMemberRepository.findById(id).map(crew -> {
            crew.setName(details.getName());
            crew.setType(details.getType());
            if (details.getLicenseNumber() != null) crew.setLicenseNumber(details.getLicenseNumber());
            if (details.getTotalFlyingHours() != null) crew.setTotalFlyingHours(details.getTotalFlyingHours());
            if (details.getQualification() != null) crew.setQualification(details.getQualification());
            if (details.getCertifications() != null) crew.setCertifications(details.getCertifications());
            if (details.getCurrentAirportCode() != null) crew.setCurrentAirportCode(details.getCurrentAirportCode());
            if (details.getRestHoursRemaining() != null) crew.setRestHoursRemaining(details.getRestHoursRemaining());
            if (details.getAvailable() != null) crew.setAvailable(details.getAvailable());
            if (details.getLanguages() != null) crew.setLanguages(details.getLanguages());
            return ResponseEntity.ok(crewMemberRepository.save(crew));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/roster/assignment/{assignmentId}/status")
    public ResponseEntity<?> updateAssignmentStatus(@PathVariable Long assignmentId, @RequestParam String status) {
        return flightAssignmentRepository.findById(assignmentId).map(assignment -> {
            assignment.setStatus(status);
            flightAssignmentRepository.save(assignment);
            return ResponseEntity.ok(Map.of("message", "Assignment status updated successfully!"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('DISPATCHER')")
    public ResponseEntity<?> createCrew(@RequestBody Map<String, Object> payload) {
        try {
            String username = (String) payload.get("username");
            String email = (String) payload.get("email");
            String password = (String) payload.getOrDefault("password", "password");
            String role = (String) payload.get("role"); // ROLE_PILOT, ROLE_CABIN_CREW, ROLE_OPERATIONS_MANAGER
            String name = (String) payload.get("name");
            String licenseNumber = (String) payload.get("licenseNumber");
            Double flyingHours = Double.valueOf(payload.getOrDefault("totalFlyingHours", 0.0).toString());
            String qualification = (String) payload.get("qualification");
            String certifications = (String) payload.get("certifications");
            String currentAirportCode = (String) payload.getOrDefault("currentAirportCode", "JFK");
            String languages = (String) payload.getOrDefault("languages", "English");

            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: Username is already taken!"));
            }

            User user = new User(username, email, encoder.encode(password), role);
            userRepository.save(user);

            String type = "ROLE_PILOT".equals(role) ? "PILOT" : "CABIN_CREW";
            CrewMember crewMember = new CrewMember(user, name, type, licenseNumber, flyingHours, qualification, certifications, currentAirportCode, 10.0, true, languages);
            return ResponseEntity.ok(crewMemberRepository.save(crewMember));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error creating crew: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCrew(@PathVariable Long id) {
        return crewMemberRepository.findById(id).map(crew -> {
            // Delete assignments first
            List<FlightAssignment> assignments = flightAssignmentRepository.findByCrewMemberId(id);
            flightAssignmentRepository.deleteAll(assignments);
            
            // Delete crew member profile
            crewMemberRepository.delete(crew);
            
            // Delete linked user account
            if (crew.getUser() != null) {
                userRepository.delete(crew.getUser());
            }
            return ResponseEntity.ok(Map.of("message", "Crew member deleted successfully!"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
// Wait, Map.of needs an import java.util.Map or use ResponseEntity.ok(java.util.Collections.singletonMap("message", "..."))
