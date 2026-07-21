package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.entity.ActivityLog;
import com.carbontrack.carbontrack.entity.Badge;
import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.entity.UserBadge;
import com.carbontrack.carbontrack.event.ActivityLoggedEvent;
import com.carbontrack.carbontrack.repository.ActivityRepository;
import com.carbontrack.carbontrack.repository.BadgeRepository;
import com.carbontrack.carbontrack.repository.UserBadgeRepository;
import com.carbontrack.carbontrack.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BadgeServiceTest {

    @Mock
    private BadgeRepository badgeRepository;

    @Mock
    private UserBadgeRepository userBadgeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ActivityRepository activityRepository;

    @InjectMocks
    private BadgeService badgeService;

    private User mockUser;
    private Badge mockBadgeFirstLog;
    private Badge mockBadge10kg;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .build();

        mockBadgeFirstLog = new Badge();
        mockBadgeFirstLog.setId(10L);
        mockBadgeFirstLog.setBadgeName("First Activity Logged");
        mockBadgeFirstLog.setRequiredValue(BigDecimal.ZERO);

        mockBadge10kg = new Badge();
        mockBadge10kg.setId(11L);
        mockBadge10kg.setBadgeName("10 kg Saved");
        mockBadge10kg.setRequiredValue(new BigDecimal("10.0"));
    }

    @Test
    void testHandleActivityLoggedEvent_AwardsBadges() {
        ActivityLog log = new ActivityLog();
        log.setUser(mockUser);
        ActivityLoggedEvent event = new ActivityLoggedEvent(this, log);

        when(badgeRepository.findAll()).thenReturn(Arrays.asList(mockBadgeFirstLog, mockBadge10kg));
        when(userBadgeRepository.findByUserId(1L)).thenReturn(new ArrayList<>());
        
        when(activityRepository.countByUserId(1L)).thenReturn(1L); // 1 activity logged
        when(activityRepository.calculateTotalEmissions(1L)).thenReturn(new BigDecimal("15.0")); // Total 15kg > 10kg

        badgeService.handleActivityLoggedEvent(event);

        // It should award BOTH badges
        verify(userBadgeRepository, times(2)).save(any(UserBadge.class));
    }
    
    @Test
    void testHandleActivityLoggedEvent_DoesNotDuplicateBadges() {
        ActivityLog log = new ActivityLog();
        log.setUser(mockUser);
        ActivityLoggedEvent event = new ActivityLoggedEvent(this, log);

        when(badgeRepository.findAll()).thenReturn(Arrays.asList(mockBadgeFirstLog, mockBadge10kg));
        
        // Mock user already has First Activity badge
        UserBadge existingUserBadge = new UserBadge();
        existingUserBadge.setBadge(mockBadgeFirstLog);
        when(userBadgeRepository.findByUserId(1L)).thenReturn(Arrays.asList(existingUserBadge));
        
        when(activityRepository.countByUserId(1L)).thenReturn(2L); 
        when(activityRepository.calculateTotalEmissions(1L)).thenReturn(new BigDecimal("5.0")); // < 10kg

        badgeService.handleActivityLoggedEvent(event);

        // It should award ZERO badges because First log is already owned, and they haven't hit 10kg
        verify(userBadgeRepository, times(0)).save(any(UserBadge.class));
    }
}
