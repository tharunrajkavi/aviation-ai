package com.skycrew.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ai_rules")
public class AIRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ruleName; // e.g. MAX_DUTY_HOURS, MIN_REST_HOURS

    @Column(nullable = false)
    private String ruleValue; // e.g. "8.0", "10.0"

    private String description;

    @Column(nullable = false)
    private Boolean active = true;

    public AIRule() {}

    public AIRule(String ruleName, String ruleValue, String description, Boolean active) {
        this.ruleName = ruleName;
        this.ruleValue = ruleValue;
        this.description = description;
        this.active = active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRuleName() { return ruleName; }
    public void setRuleName(String ruleName) { this.ruleName = ruleName; }

    public String getRuleValue() { return ruleValue; }
    public void setRuleValue(String ruleValue) { this.ruleValue = ruleValue; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
