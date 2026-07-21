package com.skycrew.backend.controller;

import com.skycrew.backend.model.CrewMember;
import com.skycrew.backend.model.User;
import com.skycrew.backend.repository.CrewMemberRepository;
import com.skycrew.backend.repository.UserRepository;
import com.skycrew.backend.security.jwt.JwtUtils;
import com.skycrew.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    CrewMemberRepository crewMemberRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.get("username"), loginRequest.get("password")));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("id", userDetails.getId());
        response.put("username", userDetails.getUsername());
        response.put("email", userDetails.getEmail());
        response.put("role", role);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, Object> signUpRequest) {
        String username = (String) signUpRequest.get("username");
        String email = (String) signUpRequest.get("email");
        String password = (String) signUpRequest.get("password");
        String role = (String) signUpRequest.get("role"); // ROLE_ADMIN, ROLE_DISPATCHER, ROLE_PILOT, ROLE_CABIN_CREW

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(username, email, encoder.encode(password), role);
        userRepository.save(user);

        // If pilot or cabin crew, also create crew member profile
        if ("ROLE_PILOT".equals(role) || "ROLE_CABIN_CREW".equals(role)) {
            String type = "ROLE_PILOT".equals(role) ? "PILOT" : "CABIN_CREW";
            String name = (String) signUpRequest.getOrDefault("name", username);
            String licenseNumber = (String) signUpRequest.getOrDefault("licenseNumber", "L-" + System.currentTimeMillis());
            Double flyingHours = Double.valueOf(signUpRequest.getOrDefault("flyingHours", 0.0).toString());
            String qualification = (String) signUpRequest.getOrDefault("qualification", "ROLE_PILOT".equals(role) ? "FIRST_OFFICER" : "ATTENDANT");
            String certifications = (String) signUpRequest.getOrDefault("certifications", "B737");
            String currentAirport = (String) signUpRequest.getOrDefault("currentAirportCode", "JFK");
            String languages = (String) signUpRequest.getOrDefault("languages", "English");

            CrewMember crewMember = new CrewMember(user, name, type, licenseNumber, flyingHours, qualification, certifications, currentAirport, 0.0, true, languages);
            crewMemberRepository.save(crewMember);
        }

        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }
}
