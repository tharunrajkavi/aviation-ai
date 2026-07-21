package com.skycrew.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dispatch_reports")
public class DispatchReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    private String reportType; // CREW_UTILIZATION, DELAY_ANALYSIS, AUDIT_LOG, VIOLATION_REPORT
    
    @Lob
    private String content; // JSON summary of findings
    
    private String s3Url; // Link to the PDF stored in S3
    
    private LocalDateTime generatedAt;

    public DispatchReport() {}

    public DispatchReport(String title, String reportType, String content, String s3Url, LocalDateTime generatedAt) {
        this.title = title;
        this.reportType = reportType;
        this.content = content;
        this.s3Url = s3Url;
        this.generatedAt = generatedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getS3Url() { return s3Url; }
    public void setS3Url(String s3Url) { this.s3Url = s3Url; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
