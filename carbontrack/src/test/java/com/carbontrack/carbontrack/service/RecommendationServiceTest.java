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
public class RecommendationServiceTest {

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RecommendationService recommendationService;

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
    void testGetPersonalisedRecommendations_WithData() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        
        List<Object[]> mockData = Arrays.asList(
                new Object[]{"Car", 150.5},
                new Object[]{"Flight", 500.0},
                new Object[]{"Beef", 50.0},
                new Object[]{"Train", 10.0} // 4th element should be ignored
        );
        when(activityRepository.getTopEmissionActivitiesSince(eq(1L), any(LocalDate.class))).thenReturn(mockData);

        List<Map<String, String>> result = recommendationService.getPersonalisedRecommendations("test@example.com");

        assertNotNull(result);
        assertEquals(3, result.size());
        
        assertEquals("Car", result.get(0).get("activity"));
        assertEquals("Your car trips are generating high emissions. Consider carpooling or taking public transit twice a week.", result.get(0).get("tip"));
        
        assertEquals("Flight", result.get(1).get("activity"));
        assertEquals("Beef", result.get(2).get("activity"));
    }

    @Test
    void testGetPersonalisedRecommendations_EmptyData() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        
        List<Object[]> emptyData = Arrays.asList();
        when(activityRepository.getTopEmissionActivitiesSince(eq(1L), any(LocalDate.class))).thenReturn(emptyData);

        List<Map<String, String>> result = recommendationService.getPersonalisedRecommendations("test@example.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("General", result.get(0).get("activity"));
        assertEquals("Great job! Keep logging your activities to get personalised tips.", result.get(0).get("tip"));
    }
}
