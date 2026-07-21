package com.skycrew.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "weather_alerts")
public class WeatherAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String airportCode; // e.g., KJFK

    @Column(nullable = false)
    private String severity; // SEVERE, WARNING, CLEAR

    @Column(nullable = false)
    private String weatherType; // STORM, HEAVY_RAIN, FOG, SNOW, HIGH_WINDS, THUNDERSTORM

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Boolean active = true;

    public WeatherAlert() {}

    public WeatherAlert(String airportCode, String severity, String weatherType, String message, LocalDateTime createdAt, Boolean active) {
        this.airportCode = airportCode;
        this.severity = severity;
        this.weatherType = weatherType;
        this.message = message;
        this.createdAt = createdAt;
        this.active = active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAirportCode() { return airportCode; }
    public void setAirportCode(String airportCode) { this.airportCode = airportCode; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getWeatherType() { return weatherType; }
    public void setWeatherType(String weatherType) { this.weatherType = weatherType; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
