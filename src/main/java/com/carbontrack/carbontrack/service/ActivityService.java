package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.dto.ActivityRequest;
import com.carbontrack.carbontrack.entity.ActivityLog;
import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.repository.ActivityRepository;
import com.carbontrack.carbontrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final EmissionCalculationService emissionService;

    public ActivityLog addActivity(String email, ActivityRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BigDecimal emission = emissionService.calculateEmission(request.getActivityType(), request.getQuantity());

        ActivityLog log = ActivityLog.builder()
                .user(user)
                .category(request.getCategory())
                .activityType(request.getActivityType())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .emission(emission)
                .logDate(request.getLogDate())
                .build();

        return activityRepository.save(log);
    }

    public List<ActivityLog> getUserActivities(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return activityRepository.findByUserIdOrderByLogDateDesc(user.getId());
    }
}
