package com.skycrew.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "aircrafts")
public class Aircraft {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String tailNumber; // e.g., N707SA

    @Column(nullable = false)
    private String model; // e.g., Boeing 737-800

    private Integer capacity;
    
    private String maintenanceStatus; // AVAILABLE, MAINTENANCE, RETIRED
    
    private Double fuelCapacity;
    
    private Double availableHours; // Flight hours left before next scheduled maintenance

    public Aircraft() {}

    public Aircraft(String tailNumber, String model, Integer capacity, String maintenanceStatus, Double fuelCapacity, Double availableHours) {
        this.tailNumber = tailNumber;
        this.model = model;
        this.capacity = capacity;
        this.maintenanceStatus = maintenanceStatus;
        this.fuelCapacity = fuelCapacity;
        this.availableHours = availableHours;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTailNumber() { return tailNumber; }
    public void setTailNumber(String tailNumber) { this.tailNumber = tailNumber; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getMaintenanceStatus() { return maintenanceStatus; }
    public void setMaintenanceStatus(String maintenanceStatus) { this.maintenanceStatus = maintenanceStatus; }

    public Double getFuelCapacity() { return fuelCapacity; }
    public void setFuelCapacity(Double fuelCapacity) { this.fuelCapacity = fuelCapacity; }

    public Double getAvailableHours() { return availableHours; }
    public void setAvailableHours(Double availableHours) { this.availableHours = availableHours; }
}
