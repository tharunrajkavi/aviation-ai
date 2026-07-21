package com.skycrew.backend.repository;

import com.skycrew.backend.model.DutyHour;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DutyHourRepository extends JpaRepository<DutyHour, Long> {
    List<DutyHour> findByCrewMemberId(Long crewMemberId);
}
