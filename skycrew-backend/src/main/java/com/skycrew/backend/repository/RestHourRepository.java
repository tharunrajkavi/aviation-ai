package com.skycrew.backend.repository;

import com.skycrew.backend.model.RestHour;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RestHourRepository extends JpaRepository<RestHour, Long> {
    List<RestHour> findByCrewMemberId(Long crewMemberId);
}
