package com.skycrew.backend.repository;

import com.skycrew.backend.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUsername(String username);
    List<AuditLog> findAllByOrderByTimestampDesc();
}
