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
import java.util.ArrayList;
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
public class BenchmarkServiceTest {

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BenchmarkService benchmarkService;

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
    void testGetPeerBenchmark_WithOtherUsers() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        
        // Mock 4 users. User 1 has 50kg, User 2 has 100kg, User 3 has 20kg, User 4 has 80kg
        // User 1 (our user) is better than User 2 and User 4. So better than 2 out of 3 others.
        // Percentile = 2 / 3 = 66.6%
        List<Object[]> allEmissions = new ArrayList<>();
        allEmissions.add(new Object[]{1L, 50.0});
        allEmissions.add(new Object[]{2L, 100.0});
        allEmissions.add(new Object[]{3L, 20.0});
        allEmissions.add(new Object[]{4L, 80.0});
        when(activityRepository.getAllUsersEmissionsSince(any(LocalDate.class))).thenReturn(allEmissions);
        when(activityRepository.getEmissionsByCategorySince(eq(1L), any(LocalDate.class))).thenReturn(new ArrayList<>());

        Map<String, Object> result = benchmarkService.getPeerBenchmark("test@example.com");

        assertNotNull(result);
        assertEquals(50.0, result.get("userEmission"));
        
        // Platform average = (50+100+20+80)/4 = 62.5
        assertEquals(62.5, result.get("platformAverage"));
        
        // Percentile = 2/3 * 100 = 66.6666...
        double expectedPercentile = (2.0 / 3.0) * 100;
        assertEquals(expectedPercentile, (Double) result.get("percentile"), 0.01);
    }

    @Test
    void testGetPeerBenchmark_OnlyUser() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        
        List<Object[]> allEmissions = new ArrayList<>();
        allEmissions.add(new Object[]{1L, 50.0});
        when(activityRepository.getAllUsersEmissionsSince(any(LocalDate.class))).thenReturn(allEmissions);
        when(activityRepository.getEmissionsByCategorySince(eq(1L), any(LocalDate.class))).thenReturn(new ArrayList<>());

        Map<String, Object> result = benchmarkService.getPeerBenchmark("test@example.com");

        assertNotNull(result);
        assertEquals(50.0, result.get("userEmission"));
        assertEquals(50.0, result.get("platformAverage"));
        assertEquals(100.0, result.get("percentile"));
    }
}
