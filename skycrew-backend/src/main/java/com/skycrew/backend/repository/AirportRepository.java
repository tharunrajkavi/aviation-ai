package com.skycrew.backend.repository;

import com.skycrew.backend.model.Airport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AirportRepository extends JpaRepository<Airport, Long> {
    Optional<Airport> findByIcaoCode(String icaoCode);
    Optional<Airport> findByIataCode(String iataCode);
}
