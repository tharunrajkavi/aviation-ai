package com.skycrew.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "flights")
public class Flight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String flightNumber; // e.g., AI302

    private String airline;

    @ManyToOne
    @JoinColumn(name = "aircraft_id")
    private Aircraft aircraft;

    @ManyToOne
    @JoinColumn(name = "source_airport_id")
    private Airport sourceAirport;

    @ManyToOne
    @JoinColumn(name = "destination_airport_id")
    private Airport destinationAirport;

    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;

    private String status; // SCHEDULED, BOARDING, DELAYED, CANCELLED, DEPARTED, ARRIVED

    public Flight() {}

    public Flight(String flightNumber, String airline, Aircraft aircraft, Airport sourceAirport, Airport destinationAirport, LocalDateTime departureTime, LocalDateTime arrivalTime, String status) {
        this.flightNumber = flightNumber;
        this.airline = airline;
        this.aircraft = aircraft;
        this.sourceAirport = sourceAirport;
        this.destinationAirport = destinationAirport;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFlightNumber() { return flightNumber; }
    public void setFlightNumber(String flightNumber) { this.flightNumber = flightNumber; }

    public String getAirline() { return airline; }
    public void setAirline(String airline) { this.airline = airline; }

    public Aircraft getAircraft() { return aircraft; }
    public void setAircraft(Aircraft aircraft) { this.aircraft = aircraft; }

    public Airport getSourceAirport() { return sourceAirport; }
    public void setSourceAirport(Airport sourceAirport) { this.sourceAirport = sourceAirport; }

    public Airport getDestinationAirport() { return destinationAirport; }
    public void setDestinationAirport(Airport destinationAirport) { this.destinationAirport = destinationAirport; }

    public LocalDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }

    public LocalDateTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalDateTime arrivalTime) { this.arrivalTime = arrivalTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
