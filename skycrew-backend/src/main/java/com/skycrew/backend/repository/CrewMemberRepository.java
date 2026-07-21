package com.skycrew.backend.repository;

import com.skycrew.backend.model.CrewMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CrewMemberRepository extends JpaRepository<CrewMember, Long> {
    Optional<CrewMember> findByUserUsername(String username);
    Optional<CrewMember> findByUserId(Long userId);
    List<CrewMember> findByType(String type);
    List<CrewMember> findByAvailableTrue();
}
