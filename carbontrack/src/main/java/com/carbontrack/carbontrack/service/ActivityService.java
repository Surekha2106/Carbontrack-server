package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.dto.ActivityRequest;
import com.carbontrack.carbontrack.entity.ActivityLog;
import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.repository.ActivityRepository;
import com.carbontrack.carbontrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.context.ApplicationEventPublisher;
import com.carbontrack.carbontrack.event.ActivityLoggedEvent;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final EmissionCalculationService emissionService;
    private final ApplicationEventPublisher eventPublisher;

    @org.springframework.cache.annotation.CacheEvict(value = "analyticsCache", allEntries = true)
    public ActivityLog addActivity(String email, ActivityRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BigDecimal emission = emissionService.calculateEmission(request.getActivityType(), request.getQuantity());
        String scope = emissionService.determineScope(request.getCategory(), request.getActivityType());

        ActivityLog log = ActivityLog.builder()
                .user(user)
                .organisation(user.getOrganisation())
                .branch(user.getBranch())
                .department(user.getDepartmentRef())
                .category(request.getCategory())
                .activityType(request.getActivityType())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .emission(emission)
                .scope(scope)
                .logDate(request.getLogDate() != null ? request.getLogDate() : java.time.LocalDate.now())
                .build();

        ActivityLog savedLog = activityRepository.save(log);
        eventPublisher.publishEvent(new ActivityLoggedEvent(this, savedLog));
        return savedLog;
    }

    public List<ActivityLog> getUserActivities(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return activityRepository.findByUserIdOrderByLogDateDesc(user.getId());
    }
}
