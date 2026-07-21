package com.skycrew.backend.repository;

import com.skycrew.backend.model.WeatherAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WeatherAlertRepository extends JpaRepository<WeatherAlert, Long> {
    List<WeatherAlert> findByAirportCode(String airportCode);
    List<WeatherAlert> findByActiveTrue();
}
