package com.skycrew.backend.controller;

import com.skycrew.backend.model.Airport;
import com.skycrew.backend.repository.AirportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/airports")
public class AirportController {
    @Autowired
    AirportRepository airportRepository;

    @GetMapping
    public List<Airport> getAllAirports() {
        return airportRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Airport> getAirportById(@PathVariable Long id) {
        return airportRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Airport createAirport(@RequestBody Airport airport) {
        return airportRepository.save(airport);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Airport> updateAirport(@PathVariable Long id, @RequestBody Airport airportDetails) {
        return airportRepository.findById(id).map(airport -> {
            airport.setName(airportDetails.getName());
            airport.setIcaoCode(airportDetails.getIcaoCode());
            airport.setIataCode(airportDetails.getIataCode());
            airport.setCountry(airportDetails.getCountry());
            airport.setRunways(airportDetails.getRunways());
            airport.setGates(airportDetails.getGates());
            airport.setTimeZone(airportDetails.getTimeZone());
            airport.setWeatherRegion(airportDetails.getWeatherRegion());
            return ResponseEntity.ok(airportRepository.save(airport));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAirport(@PathVariable Long id) {
        return airportRepository.findById(id).map(airport -> {
            airportRepository.delete(airport);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
