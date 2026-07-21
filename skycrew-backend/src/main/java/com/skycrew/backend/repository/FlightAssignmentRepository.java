package com.skycrew.backend.repository;

import com.skycrew.backend.model.FlightAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FlightAssignmentRepository extends JpaRepository<FlightAssignment, Long> {
    List<FlightAssignment> findByFlightId(Long flightId);
    List<FlightAssignment> findByCrewMemberId(Long crewMemberId);
    List<FlightAssignment> findByFlightFlightNumber(String flightNumber);
}
