package com.skycrew.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "airports")
public class Airport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String icaoCode; // e.g., KJFK

    @Column(nullable = false, unique = true)
    private String iataCode; // e.g., JFK

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String country;

    private Integer runways;
    private Integer gates;
    private String timeZone;
    private String weatherRegion;

    public Airport() {}

    public Airport(String icaoCode, String iataCode, String name, String country, Integer runways, Integer gates, String timeZone, String weatherRegion) {
        this.icaoCode = icaoCode;
        this.iataCode = iataCode;
        this.name = name;
        this.country = country;
        this.runways = runways;
        this.gates = gates;
        this.timeZone = timeZone;
        this.weatherRegion = weatherRegion;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIcaoCode() { return icaoCode; }
    public void setIcaoCode(String icaoCode) { this.icaoCode = icaoCode; }

    public String getIataCode() { return iataCode; }
    public void setIataCode(String iataCode) { this.iataCode = iataCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public Integer getRunways() { return runways; }
    public void setRunways(Integer runways) { this.runways = runways; }

    public Integer getGates() { return gates; }
    public void setGates(Integer gates) { this.gates = gates; }

    public String getTimeZone() { return timeZone; }
    public void setTimeZone(String timeZone) { this.timeZone = timeZone; }

    public String getWeatherRegion() { return weatherRegion; }
    public void setWeatherRegion(String weatherRegion) { this.weatherRegion = weatherRegion; }
}
