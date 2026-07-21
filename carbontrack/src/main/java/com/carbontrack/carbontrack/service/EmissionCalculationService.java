package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.entity.EmissionFactor;
import com.carbontrack.carbontrack.repository.EmissionFactorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmissionCalculationService {

    private final EmissionFactorRepository emissionFactorRepository;

    public BigDecimal calculateEmission(String activityType, BigDecimal quantity) {
        if (quantity == null) return BigDecimal.ZERO;
        
        Optional<EmissionFactor> factorOpt = emissionFactorRepository.findByActivityType(activityType);
        if (factorOpt.isPresent()) {
            return quantity.multiply(factorOpt.get().getEmissionFactor()).setScale(2, RoundingMode.HALF_UP);
        }
        
        // Fallback default calculation factors aligned with GHG Protocol
        double factor = getFallbackFactor(activityType);
        return quantity.multiply(BigDecimal.valueOf(factor)).setScale(2, RoundingMode.HALF_UP);
    }

    public String determineScope(String category, String activityType) {
        if (category == null) category = "";
        if (activityType == null) activityType = "";

        String catLower = category.toLowerCase();
        String typeLower = activityType.toLowerCase();

        // Scope 1: Direct emissions (company fuels, generators, company vehicles, LPG, gas)
        if (catLower.contains("fuel") || catLower.contains("generator") || catLower.contains("direct") 
            || typeLower.contains("diesel") || typeLower.contains("petrol") || typeLower.contains("lpg") 
            || typeLower.contains("natural gas") || typeLower.contains("generator") || typeLower.contains("company vehicle")) {
            return "SCOPE_1";
        }

        // Scope 2: Indirect energy (purchased electricity, heating, steam)
        if (catLower.contains("electricity") || catLower.contains("energy") || typeLower.contains("electricity") || typeLower.contains("kwh")) {
            return "SCOPE_2";
        }

        // Scope 3: Other indirect (commute, travel, water, waste, paper, cloud, supplies)
        return "SCOPE_3";
    }

    private double getFallbackFactor(String activityType) {
        if (activityType == null) return 0.5;
        String lower = activityType.toLowerCase();

        if (lower.contains("electricity")) return 0.82; // kg CO2e / kWh
        if (lower.contains("diesel")) return 2.68; // kg CO2e / L
        if (lower.contains("petrol")) return 2.31; // kg CO2e / L
        if (lower.contains("lpg") || lower.contains("gas")) return 1.51;
        if (lower.contains("car")) return 0.21; // kg CO2e / km
        if (lower.contains("bus")) return 0.08;
        if (lower.contains("flight")) return 0.25;
        if (lower.contains("train") || lower.contains("metro")) return 0.04;
        if (lower.contains("water")) return 0.34;
        if (lower.contains("waste") || lower.contains("paper")) return 1.20;
        
        return 0.5;
    }
}
