package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.repository.ActivityRepository;
import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    @Cacheable(value = "analyticsCache", key = "'daily_' + #email")
    public List<Map<String, Object>> getDailyFootprint(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<Object[]> data = activityRepository.getDailyEmissionsSince(user.getId(), thirtyDaysAgo);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : data) {
            Map<String, Object> map = new HashMap<>();
            map.put("date", row[0]);
            map.put("emission", row[1]);
            result.add(map);
        }
        return result;
    }

    @Cacheable(value = "analyticsCache", key = "'weekly_' + #email")
    public List<Map<String, Object>> getWeeklyFootprint(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate twelveWeeksAgo = LocalDate.now().minusWeeks(12);
        List<Object[]> data = activityRepository.getWeeklyEmissionsSince(user.getId(), twelveWeeksAgo);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : data) {
            Map<String, Object> map = new HashMap<>();
            map.put("week", row[0]);
            map.put("emission", row[1]);
            result.add(map);
        }
        return result;
    }

    @Cacheable(value = "analyticsCache", key = "'monthly_' + #email")
    public List<Map<String, Object>> getMonthlyFootprint(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate twelveMonthsAgo = LocalDate.now().minusMonths(12).withDayOfMonth(1);
        List<Object[]> data = activityRepository.getMonthlyEmissionsSince(user.getId(), twelveMonthsAgo);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : data) {
            Map<String, Object> map = new HashMap<>();
            map.put("month", row[0]);
            map.put("emission", row[1]);
            result.add(map);
        }
        return result;
    }

    @Cacheable(value = "analyticsCache", key = "'category_' + #email")
    public Map<String, Double> getCategoryFootprint(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<Object[]> categoryEmissions = activityRepository.getEmissionsByCategorySince(user.getId(), thirtyDaysAgo);

        Map<String, Double> byCategory = new HashMap<>();
        byCategory.put("Transport", 0.0);
        byCategory.put("Electricity", 0.0);
        byCategory.put("Food", 0.0);
        byCategory.put("Shopping", 0.0);

        for (Object[] row : categoryEmissions) {
            String cat = (String) row[0];
            java.math.BigDecimal em = (java.math.BigDecimal) row[1];
            byCategory.put(cat, em == null ? 0.0 : em.doubleValue());
        }

        return byCategory;
    }
}
