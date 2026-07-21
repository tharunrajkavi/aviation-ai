package com.skycrew.backend.repository;

import com.skycrew.backend.model.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FlightRepository extends JpaRepository<Flight, Long> {
    Optional<Flight> findByFlightNumber(String flightNumber);
}
