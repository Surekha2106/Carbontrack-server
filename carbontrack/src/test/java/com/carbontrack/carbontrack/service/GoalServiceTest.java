package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.entity.Goal;
import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.repository.ActivityRepository;
import com.carbontrack.carbontrack.repository.GoalRepository;
import com.carbontrack.carbontrack.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GoalServiceTest {

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private GoalService goalService;

    private User mockUser;
    private Goal mockGoal;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .build();

        mockGoal = new Goal();
        mockGoal.setId(100L);
        mockGoal.setGoalName("Reduce Emissions");
        mockGoal.setStartDate(LocalDate.now().minusDays(5));
        mockGoal.setEndDate(LocalDate.now().plusDays(5));
        mockGoal.setTargetValue(new BigDecimal("100.0"));
        mockGoal.setCurrentValue(new BigDecimal("20.0"));
        mockGoal.setUser(mockUser);
    }

    @Test
    void testGetUserGoalsOnTrack() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(goalRepository.findByUserId(1L)).thenReturn(Arrays.asList(mockGoal));

        List<Goal> result = goalService.getUserGoals("test@example.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        
        Goal updatedGoal = result.get(0);
        assertEquals("On Track", updatedGoal.getTrackingStatus());
        assertEquals("Excellent! You are on track with your goal.", updatedGoal.getAlertMessage());
        assertEquals(20.0, updatedGoal.getProgressPercentage());
    }

    @Test
    void testCreateGoal() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(activityRepository.calculateTotalEmissionsBetween(eq(1L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(new BigDecimal("300.0")); // 10 kg daily average over 30 days
        
        Goal newGoal = new Goal();
        newGoal.setTargetReductionPct(new BigDecimal("20.0")); // 20% reduction target

        when(goalRepository.save(any(Goal.class))).thenAnswer(i -> {
            Goal saved = (Goal) i.getArguments()[0];
            saved.setId(101L);
            return saved;
        });

        Goal savedGoal = goalService.createGoal("test@example.com", newGoal);

        assertNotNull(savedGoal);
        assertNotNull(savedGoal.getStartDate());
        assertNotNull(savedGoal.getEndDate());
        assertEquals("ACTIVE", savedGoal.getStatus());
        // 10kg/day * 20% reduction = 8kg/day * 30 days = 240kg
        assertEquals(240.0, savedGoal.getTargetValue().doubleValue());
    }

    @Test
    void testDeleteGoal() {
        when(goalRepository.findById(100L)).thenReturn(Optional.of(mockGoal));

        goalService.deleteGoal(100L, "test@example.com");

        verify(goalRepository, times(1)).delete(mockGoal);
    }
}
