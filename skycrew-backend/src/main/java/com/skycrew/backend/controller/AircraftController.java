package com.skycrew.backend.controller;

import com.skycrew.backend.model.Aircraft;
import com.skycrew.backend.repository.AircraftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aircraft")
public class AircraftController {
    @Autowired
    AircraftRepository aircraftRepository;

    @GetMapping
    public List<Aircraft> getAllAircrafts() {
        return aircraftRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Aircraft> getAircraftById(@PathVariable Long id) {
        return aircraftRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Aircraft createAircraft(@RequestBody Aircraft aircraft) {
        return aircraftRepository.save(aircraft);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Aircraft> updateAircraft(@PathVariable Long id, @RequestBody Aircraft details) {
        return aircraftRepository.findById(id).map(aircraft -> {
            aircraft.setTailNumber(details.getTailNumber());
            aircraft.setModel(details.getModel());
            aircraft.setCapacity(details.getCapacity());
            aircraft.setMaintenanceStatus(details.getMaintenanceStatus());
            aircraft.setFuelCapacity(details.getFuelCapacity());
            aircraft.setAvailableHours(details.getAvailableHours());
            return ResponseEntity.ok(aircraftRepository.save(aircraft));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAircraft(@PathVariable Long id) {
        return aircraftRepository.findById(id).map(aircraft -> {
            aircraftRepository.delete(aircraft);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
