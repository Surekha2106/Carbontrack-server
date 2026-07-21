package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.repository.ActivityRepository;
import com.carbontrack.carbontrack.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AnalyticsServiceTest {

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .build();
    }

    @Test
    void testGetDailyFootprint() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        
        List<Object[]> mockData = Arrays.asList(
                new Object[]{java.sql.Date.valueOf(LocalDate.now()), 15.5},
                new Object[]{java.sql.Date.valueOf(LocalDate.now().minusDays(1)), 10.0}
        );
        when(activityRepository.getDailyEmissionsSince(eq(1L), any(LocalDate.class))).thenReturn(mockData);

        List<Map<String, Object>> result = analyticsService.getDailyFootprint("test@example.com");

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(15.5, result.get(0).get("emission"));
    }

    @Test
    void testGetCategoryFootprint() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        
        List<Object[]> mockData = Arrays.asList(
                new Object[]{"Transport", new java.math.BigDecimal("45.5")},
                new Object[]{"Food", new java.math.BigDecimal("20.0")}
        );
        when(activityRepository.getEmissionsByCategorySince(eq(1L), any(LocalDate.class))).thenReturn(mockData);

        Map<String, Double> result = analyticsService.getCategoryFootprint("test@example.com");

        assertNotNull(result);
        assertEquals(45.5, result.get("Transport"));
        assertEquals(20.0, result.get("Food"));
        assertEquals(0.0, result.get("Electricity"));
    }
}
