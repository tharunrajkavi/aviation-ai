package com.skycrew.backend.repository;

import com.skycrew.backend.model.Aircraft;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AircraftRepository extends JpaRepository<Aircraft, Long> {
    Optional<Aircraft> findByTailNumber(String tailNumber);
}
