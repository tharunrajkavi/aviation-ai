package com.skycrew.backend.repository;

import com.skycrew.backend.model.DispatchReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DispatchReportRepository extends JpaRepository<DispatchReport, Long> {
    List<DispatchReport> findByReportType(String reportType);
}
