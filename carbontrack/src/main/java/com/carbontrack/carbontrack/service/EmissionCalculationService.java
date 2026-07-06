package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.entity.EmissionFactor;
import com.carbontrack.carbontrack.repository.EmissionFactorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmissionCalculationService {

    private final EmissionFactorRepository emissionFactorRepository;

    public BigDecimal calculateEmission(String activityType, BigDecimal quantity) {
        Optional<EmissionFactor> factorOpt = emissionFactorRepository.findByActivityType(activityType);
        if (factorOpt.isPresent()) {
            return quantity.multiply(factorOpt.get().getEmissionFactor());
        }
        return BigDecimal.ZERO;
    }
}
