package com.skycrew.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "duty_hours")
public class DutyHour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "crew_member_id", nullable = false)
    private CrewMember crewMember;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Double hoursLogged;

    private String description;

    public DutyHour() {}

    public DutyHour(CrewMember crewMember, LocalDate date, Double hoursLogged, String description) {
        this.crewMember = crewMember;
        this.date = date;
        this.hoursLogged = hoursLogged;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CrewMember getCrewMember() { return crewMember; }
    public void setCrewMember(CrewMember crewMember) { this.crewMember = crewMember; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Double getHoursLogged() { return hoursLogged; }
    public void setHoursLogged(Double hoursLogged) { this.hoursLogged = hoursLogged; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
