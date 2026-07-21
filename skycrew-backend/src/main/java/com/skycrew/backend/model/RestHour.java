package com.skycrew.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rest_hours")
public class RestHour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "crew_member_id", nullable = false)
    private CrewMember crewMember;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private Double hoursLogged;

    @Column(nullable = false)
    private String status; // COMPLIANT, VIOLATION

    public RestHour() {}

    public RestHour(CrewMember crewMember, LocalDateTime startTime, LocalDateTime endTime, Double hoursLogged, String status) {
        this.crewMember = crewMember;
        this.startTime = startTime;
        this.endTime = endTime;
        this.hoursLogged = hoursLogged;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CrewMember getCrewMember() { return crewMember; }
    public void setCrewMember(CrewMember crewMember) { this.crewMember = crewMember; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Double getHoursLogged() { return hoursLogged; }
    public void setHoursLogged(Double hoursLogged) { this.hoursLogged = hoursLogged; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
