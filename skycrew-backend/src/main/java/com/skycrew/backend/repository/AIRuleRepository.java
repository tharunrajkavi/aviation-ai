package com.skycrew.backend.repository;

import com.skycrew.backend.model.AIRule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AIRuleRepository extends JpaRepository<AIRule, Long> {
    Optional<AIRule> findByRuleName(String ruleName);
}
