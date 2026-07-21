package com.skycrew.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "crew_members")
public class CrewMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private String name;

    @Column(nullable = false)
    private String type; // PILOT, CABIN_CREW

    private String licenseNumber;
    
    private Double totalFlyingHours;
    
    private String qualification; // CAPTAIN, FIRST_OFFICER, PURSER, ATTENDANT
    
    private String certifications; // e.g., B737, A320
    
    private String currentAirportCode; // IATA/ICAO code of current location
    
    private Double restHoursRemaining; // Hours of rest required before next duty
    
    private Boolean available = true;
    
    private String languages;

    public CrewMember() {}

    public CrewMember(User user, String name, String type, String licenseNumber, Double totalFlyingHours, String qualification, String certifications, String currentAirportCode, Double restHoursRemaining, Boolean available, String languages) {
        this.user = user;
        this.name = name;
        this.type = type;
        this.licenseNumber = licenseNumber;
        this.totalFlyingHours = totalFlyingHours;
        this.qualification = qualification;
        this.certifications = certifications;
        this.currentAirportCode = currentAirportCode;
        this.restHoursRemaining = restHoursRemaining;
        this.available = available;
        this.languages = languages;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public Double getTotalFlyingHours() { return totalFlyingHours; }
    public void setTotalFlyingHours(Double totalFlyingHours) { this.totalFlyingHours = totalFlyingHours; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getCertifications() { return certifications; }
    public void setCertifications(String certifications) { this.certifications = certifications; }

    public String getCurrentAirportCode() { return currentAirportCode; }
    public void setCurrentAirportCode(String currentAirportCode) { this.currentAirportCode = currentAirportCode; }

    public Double getRestHoursRemaining() { return restHoursRemaining; }
    public void setRestHoursRemaining(Double restHoursRemaining) { this.restHoursRemaining = restHoursRemaining; }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }

    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }
}
