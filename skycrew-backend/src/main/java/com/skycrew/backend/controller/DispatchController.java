package com.skycrew.backend.controller;

import com.skycrew.backend.model.DispatchReport;
import com.skycrew.backend.repository.DispatchReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.skycrew.backend.service.S3Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dispatch")
public class DispatchController {
    @Autowired
    DispatchReportRepository dispatchReportRepository;

    @Autowired
    S3Service s3Service;

    @GetMapping("/reports")
    public List<DispatchReport> getReports() {
        return dispatchReportRepository.findAll();
    }

    @PostMapping("/reports")
    @PreAuthorize("hasRole('DISPATCHER') or hasRole('ADMIN')")
    public DispatchReport createReport(@RequestBody Map<String, Object> reportDto) {
        String title = (String) reportDto.get("title");
        String reportType = (String) reportDto.get("reportType"); // CREW_UTILIZATION, DELAY_ANALYSIS, AUDIT_LOG
        String content = (String) reportDto.getOrDefault("content", "{}");

        String fileName = reportType.toLowerCase() + "-" + System.currentTimeMillis() + ".json";
        String s3Url = s3Service.uploadReport(fileName, content);

        DispatchReport report = new DispatchReport(title, reportType, content, s3Url, LocalDateTime.now());
        return dispatchReportRepository.save(report);
    }
}
