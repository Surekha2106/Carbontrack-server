package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.entity.EmissionFactor;
import com.carbontrack.carbontrack.repository.EmissionFactorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EmissionCalculationServiceTest {

    @Mock
    private EmissionFactorRepository emissionFactorRepository;

    @InjectMocks
    private EmissionCalculationService emissionCalculationService;

    @BeforeEach
    void setUp() {
        lenient().when(emissionFactorRepository.findByActivityType("car")).thenReturn(
                Optional.of(EmissionFactor.builder().activityType("car").emissionFactor(new BigDecimal("0.192")).build())
        );
        lenient().when(emissionFactorRepository.findByActivityType("beef")).thenReturn(
                Optional.of(EmissionFactor.builder().activityType("beef").emissionFactor(new BigDecimal("27.0")).build())
        );
        lenient().when(emissionFactorRepository.findByActivityType("electricity")).thenReturn(
                Optional.of(EmissionFactor.builder().activityType("electricity").emissionFactor(new BigDecimal("0.85")).build())
        );
        // "unknown" will naturally return empty
    }

    @ParameterizedTest
    @CsvSource({
            "car, 10.0, 1.920",
            "car, 0.0, 0.000",
            "beef, 2.5, 67.50",
            "electricity, 100.0, 85.00"
    })
    void calculateEmission_withValidInputs_returnsExpectedResult(String activityType, String quantity, String expectedResult) {
        BigDecimal result = emissionCalculationService.calculateEmission(activityType, new BigDecimal(quantity));
        assertEquals(0, new BigDecimal(expectedResult).compareTo(result), "The calculated emission should match expected");
    }

    @Test
    void calculateEmission_withUnknownActivity_returnsFallback() {
        when(emissionFactorRepository.findByActivityType("unknown")).thenReturn(Optional.empty());
        BigDecimal result = emissionCalculationService.calculateEmission("unknown", new BigDecimal("100.0"));
        // 100.0 * 0.5 (fallback) = 50.00
        assertEquals(new BigDecimal("50.00"), result);
    }

    @Test
    void calculateEmission_withBoundaryValues_handlesCorrectly() {
        BigDecimal maxQuantity = new BigDecimal("999999999.99");
        BigDecimal result = emissionCalculationService.calculateEmission("car", maxQuantity);
        // 999999999.99 * 0.192 = 191999999.99808, rounded HALF_UP to 2 places is 192000000.00
        assertEquals(new BigDecimal("192000000.00"), result);
    }
}
