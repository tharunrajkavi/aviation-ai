package com.skycrew.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "flight_assignments")
public class FlightAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight;

    @ManyToOne
    @JoinColumn(name = "crew_member_id", nullable = false)
    private CrewMember crewMember;

    private String role; // COMMANDER, CO_PILOT, CABIN_LEADER, CABIN_MEMBER

    private String status; // ASSIGNED, ACCEPTED, DECLINED

    public FlightAssignment() {}

    public FlightAssignment(Flight flight, CrewMember crewMember, String role, String status) {
        this.flight = flight;
        this.crewMember = crewMember;
        this.role = role;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Flight getFlight() { return flight; }
    public void setFlight(Flight flight) { this.flight = flight; }

    public CrewMember getCrewMember() { return crewMember; }
    public void setCrewMember(CrewMember crewMember) { this.crewMember = crewMember; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
