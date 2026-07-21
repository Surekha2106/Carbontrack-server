package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.entity.Badge;
import com.carbontrack.carbontrack.entity.UserBadge;
import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.repository.ActivityRepository;
import com.carbontrack.carbontrack.repository.BadgeRepository;
import com.carbontrack.carbontrack.repository.UserBadgeRepository;
import com.carbontrack.carbontrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.context.event.EventListener;
import com.carbontrack.carbontrack.event.ActivityLoggedEvent;
@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;

    private final ActivityRepository activityRepository;

    public List<Badge> getUserBadges(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        checkAndAwardBadges(user);

        return userBadgeRepository.findByUserId(user.getId()).stream()
                .map(UserBadge::getBadge)
                .collect(Collectors.toList());
    }

    @EventListener
    public void handleActivityLoggedEvent(ActivityLoggedEvent event) {
        User user = event.getActivityLog().getUser();
        checkAndAwardBadges(user);
    }

    @EventListener
    public void handleGoalAchievedEvent(com.carbontrack.carbontrack.event.GoalAchievedEvent event) {
        User user = event.getGoal().getUser();
        checkAndAwardBadges(user);
    }

    private void checkAndAwardBadges(User user) {
        List<Badge> allBadges = badgeRepository.findAll();
        List<Long> earnedBadgeIds = userBadgeRepository.findByUserId(user.getId())
                .stream()
                .map(ub -> ub.getBadge().getId())
                .collect(Collectors.toList());

        java.math.BigDecimal totalEmissions = activityRepository.calculateTotalEmissions(user.getId());
        double total = totalEmissions != null ? totalEmissions.doubleValue() : 0.0;
        long activityCount = activityRepository.countByUserId(user.getId());

        for (Badge badge : allBadges) {
            if (!earnedBadgeIds.contains(badge.getId())) {
                double req = badge.getRequiredValue() != null ? badge.getRequiredValue().doubleValue() : 0.0;
                String name = badge.getBadgeName();

                boolean shouldAward = false;
                if (activityCount >= 1 && (name.contains("First") || req == 0)) {
                    shouldAward = true;
                } else if (req > 0 && total >= req) {
                    shouldAward = true;
                }

                if (shouldAward) {
                    awardBadge(user, badge);
                }
            }
        }
    }

    private void awardBadge(User user, Badge badge) {
        UserBadge userBadge = UserBadge.builder()
                .user(user)
                .badge(badge)
                .build();
        try {
            userBadgeRepository.save(userBadge);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Ignore duplicate key violation if badge was awarded concurrently
        }
    }
}
