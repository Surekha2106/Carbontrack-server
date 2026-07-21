package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.entity.Goal;
import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.repository.GoalRepository;
import com.carbontrack.carbontrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final com.carbontrack.carbontrack.repository.ActivityRepository activityRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public List<Goal> getUserGoals(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Goal> goals = goalRepository.findByUserId(user.getId());
        
        java.time.LocalDate now = java.time.LocalDate.now();
        for (Goal goal : goals) {
            java.time.LocalDate startDate = goal.getStartDate();
            java.time.LocalDate endDate = goal.getEndDate();
            if (startDate == null || endDate == null) continue;

            long daysPassed = java.time.temporal.ChronoUnit.DAYS.between(startDate, now);
            long totalDays = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
            
            if (totalDays <= 0) totalDays = 1;
            if (daysPassed < 0) daysPassed = 0;
            if (daysPassed > totalDays) daysPassed = totalDays;
            
            double currentEmissions = goal.getCurrentValue() != null ? goal.getCurrentValue().doubleValue() : 0.0;
            double targetEmissions = goal.getTargetValue() != null ? goal.getTargetValue().doubleValue() : 0.0;
            
            double progress = targetEmissions > 0 ? (currentEmissions / targetEmissions) * 100 : 0.0;
            goal.setProgressPercentage(Math.min(100.0, Math.max(0.0, progress)));
            
            // Expected progress calculation (linear)
            double expectedProgressPct = ((double) daysPassed / totalDays) * 100;
            
            if (goal.getProgressPercentage() <= expectedProgressPct) {
                goal.setTrackingStatus("On Track");
                goal.setAlertMessage("Excellent! You are on track with your goal.");
            } else {
                goal.setTrackingStatus("Behind Schedule");
                double overage = currentEmissions - (targetEmissions * (expectedProgressPct / 100.0));
                // Suggest reducing the overage over the next 7 days
                goal.setAlertMessage(String.format("Warning! You need to reduce %.1f %s this week to get back on track.", overage, goal.getUnit()));
            }
        }
        return goals;
    }

    public Goal createGoal(String email, Goal goalRequest) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        goalRequest.setUser(user);
        if (goalRequest.getStartDate() == null) goalRequest.setStartDate(java.time.LocalDate.now());
        
        if (goalRequest.getPeriodDays() != null) {
            goalRequest.setEndDate(goalRequest.getStartDate().plusDays(goalRequest.getPeriodDays()));
        } else if (goalRequest.getEndDate() == null) {
            goalRequest.setEndDate(java.time.LocalDate.now().plusDays(30));
            goalRequest.setPeriodDays(30);
        } else {
            goalRequest.setPeriodDays((int) java.time.temporal.ChronoUnit.DAYS.between(goalRequest.getStartDate(), goalRequest.getEndDate()));
        }
        
        // Calculate Baseline emissions from the previous 30 days
        java.time.LocalDate baselineStart = goalRequest.getStartDate().minusDays(30);
        java.math.BigDecimal baseline = activityRepository.calculateTotalEmissionsBetween(user.getId(), baselineStart, goalRequest.getStartDate());
        double baselineDaily = baseline.doubleValue() / 30.0;
        
        if (goalRequest.getTargetReductionPct() != null) {
            double targetDaily = baselineDaily * (1.0 - (goalRequest.getTargetReductionPct().doubleValue() / 100.0));
            goalRequest.setTargetValue(java.math.BigDecimal.valueOf(targetDaily * goalRequest.getPeriodDays()));
        }
        
        if (goalRequest.getCurrentValue() == null) goalRequest.setCurrentValue(java.math.BigDecimal.ZERO);
        goalRequest.setStatus("ACTIVE");
        return goalRepository.save(goalRequest);
    }

    public java.util.Map<String, Object> getGoalProgress(Long goalId, String email) {
        Goal goal = goalRepository.findById(goalId).orElseThrow(() -> new RuntimeException("Goal not found"));
        if (!goal.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        java.time.LocalDate now = java.time.LocalDate.now();
        java.time.LocalDate startDate = goal.getStartDate();
        java.time.LocalDate endDate = goal.getEndDate();
        
        long daysPassed = java.time.temporal.ChronoUnit.DAYS.between(startDate, now);
        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        
        if (totalDays <= 0) totalDays = 1;
        if (daysPassed < 0) daysPassed = 0;
        if (daysPassed > totalDays) daysPassed = totalDays;
        
        double currentEmissions = activityRepository.calculateTotalEmissionsBetween(goal.getUser().getId(), startDate, now.plusDays(1)).doubleValue();
        double targetEmissions = goal.getTargetValue().doubleValue();
        
        // 7-day trend
        java.time.LocalDate sevenDaysAgo = now.minusDays(7);
        if (sevenDaysAgo.isBefore(startDate)) sevenDaysAgo = startDate;
        long trendDays = java.time.temporal.ChronoUnit.DAYS.between(sevenDaysAgo, now);
        if (trendDays <= 0) trendDays = 1;
        double recentEmissions = activityRepository.calculateTotalEmissionsBetween(goal.getUser().getId(), sevenDaysAgo, now.plusDays(1)).doubleValue();
        double dailyTrend = recentEmissions / trendDays;
        
        double projectedTotal = currentEmissions + (dailyTrend * (totalDays - daysPassed));
        
        double remainingEmissions = targetEmissions - currentEmissions;
        long remainingDays = totalDays - daysPassed;
        double requiredDaily = remainingDays > 0 ? (remainingEmissions > 0 ? remainingEmissions / remainingDays : 0.0) : 0.0;
        
        String alert = "On Track";
        if (projectedTotal > targetEmissions) {
            alert = "Falling Behind";
        }
        
        if (daysPassed >= totalDays) {
            if (currentEmissions <= targetEmissions && !"ACHIEVED".equals(goal.getStatus())) {
                goal.setStatus("ACHIEVED");
                goalRepository.save(goal);
                eventPublisher.publishEvent(new com.carbontrack.carbontrack.event.GoalAchievedEvent(this, goal));
            } else if (currentEmissions > targetEmissions && !"MISSED".equals(goal.getStatus())) {
                goal.setStatus("MISSED");
                goalRepository.save(goal);
            }
        }
        
        List<Object[]> dailyHistory = activityRepository.getDailyEmissionsSince(goal.getUser().getId(), startDate);
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("currentEmissions", currentEmissions);
        response.put("targetEmissions", targetEmissions);
        response.put("projectedTotal", projectedTotal);
        response.put("requiredDaily", requiredDaily);
        response.put("currentDailyTrend", dailyTrend);
        response.put("daysPassed", daysPassed);
        response.put("totalDays", totalDays);
        response.put("alert", alert);
        response.put("status", goal.getStatus());
        
        // build timeline chart data
        List<java.util.Map<String, Object>> chartData = new java.util.ArrayList<>();
        double cumulative = 0.0;
        java.time.LocalDate indexDate = startDate;
        while (!indexDate.isAfter(now) && !indexDate.isAfter(endDate)) {
            final java.time.LocalDate currentDate = indexDate;
            double dayEmission = dailyHistory.stream()
                .filter(row -> {
                    Object dateObj = row[0];
                    if (dateObj instanceof java.sql.Date) {
                        return ((java.sql.Date) dateObj).toLocalDate().equals(currentDate);
                    } else if (dateObj instanceof java.sql.Timestamp) {
                        return ((java.sql.Timestamp) dateObj).toLocalDateTime().toLocalDate().equals(currentDate);
                    }
                    return false;
                })
                .map(row -> ((java.math.BigDecimal) row[1]).doubleValue())
                .findFirst().orElse(0.0);
            cumulative += dayEmission;
            
            java.util.Map<String, Object> point = new java.util.HashMap<>();
            point.put("date", currentDate.toString());
            point.put("actual", cumulative);
            
            // Expected target line (linear)
            double expectedPoint = (targetEmissions / totalDays) * (java.time.temporal.ChronoUnit.DAYS.between(startDate, currentDate) + 1);
            point.put("target", expectedPoint);
            
            chartData.add(point);
            indexDate = indexDate.plusDays(1);
        }
        
        // Add projected future data points up to endDate if falling behind or on track
        if (indexDate.isBefore(endDate.plusDays(1)) && !indexDate.isAfter(now.plusDays(1))) {
           double projectedCumulative = cumulative;
           while (!indexDate.isAfter(endDate)) {
               projectedCumulative += dailyTrend;
               java.util.Map<String, Object> point = new java.util.HashMap<>();
               point.put("date", indexDate.toString());
               point.put("projected", projectedCumulative);
               double expectedPoint = (targetEmissions / totalDays) * (java.time.temporal.ChronoUnit.DAYS.between(startDate, indexDate) + 1);
               point.put("target", expectedPoint);
               chartData.add(point);
               indexDate = indexDate.plusDays(1);
           }
        }

        response.put("chartData", chartData);
        
        return response;
    }

    @org.springframework.context.event.EventListener
    public void handleActivityLoggedEvent(com.carbontrack.carbontrack.event.ActivityLoggedEvent event) {
        com.carbontrack.carbontrack.entity.ActivityLog log = event.getActivityLog();
        User user = log.getUser();
        List<Goal> activeGoals = goalRepository.findByUserId(user.getId()).stream()
            .filter(g -> "IN_PROGRESS".equals(g.getStatus()))
            .collect(java.util.stream.Collectors.toList());

        for (Goal goal : activeGoals) {
            boolean match = false;
            String gName = goal.getGoalName().toLowerCase();
            String cat = log.getCategory() != null ? log.getCategory().toLowerCase() : "";
            String type = log.getActivityType() != null ? log.getActivityType().toLowerCase() : "";
            
            if (gName.contains(cat) || gName.contains(type) ||
               (gName.contains("electricity") && cat.contains("electricity")) ||
               (gName.contains("transport") && cat.contains("transport")) ||
               (gName.contains("bicycle") && type.contains("bicycle")) ||
               (gName.contains("co2") || gName.contains("carbon") || gName.contains("emission"))) {
                match = true;
            }

            if (match) {
                java.math.BigDecimal amountToAdd = (gName.contains("co2") || gName.contains("carbon")) ? log.getEmission() : log.getQuantity();
                java.math.BigDecimal current = goal.getCurrentValue() != null ? goal.getCurrentValue() : java.math.BigDecimal.ZERO;
                goal.setCurrentValue(current.add(amountToAdd));
                
                if (goal.getCurrentValue().compareTo(goal.getTargetValue()) >= 0) {
                    goal.setStatus("ACHIEVED");
                    eventPublisher.publishEvent(new com.carbontrack.carbontrack.event.GoalAchievedEvent(this, goal));
                }
                goalRepository.save(goal);
            }
        }
    }

    public Goal updateGoal(Long goalId, String email, Goal updatedGoal) {
        Goal existingGoal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!existingGoal.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        if (updatedGoal.getGoalName() != null) {
            existingGoal.setGoalName(updatedGoal.getGoalName());
        }
        if (updatedGoal.getTargetValue() != null) {
            existingGoal.setTargetValue(updatedGoal.getTargetValue());
        }
        if (updatedGoal.getCurrentValue() != null) {
            existingGoal.setCurrentValue(updatedGoal.getCurrentValue());
        }
        if (updatedGoal.getUnit() != null) {
            existingGoal.setUnit(updatedGoal.getUnit());
        }
        if (updatedGoal.getStartDate() != null) {
            existingGoal.setStartDate(updatedGoal.getStartDate());
        }
        if (updatedGoal.getEndDate() != null) {
            existingGoal.setEndDate(updatedGoal.getEndDate());
        }
        if (updatedGoal.getStatus() != null) {
            existingGoal.setStatus(updatedGoal.getStatus());
        }

        return goalRepository.save(existingGoal);
    }

    public void deleteGoal(Long goalId, String email) {
        Goal existingGoal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!existingGoal.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        goalRepository.delete(existingGoal);
    }
}
