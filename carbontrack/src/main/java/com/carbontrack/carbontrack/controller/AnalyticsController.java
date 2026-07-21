package com.carbontrack.carbontrack.controller;

import com.carbontrack.carbontrack.repository.ActivityRepository;
import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final com.carbontrack.carbontrack.service.AnalyticsService analyticsService;

    @GetMapping("/summary")
    // @Cacheable(value = "analyticsCache", key = "#authentication.name")
    public ResponseEntity<Map<String, Object>> getAnalyticsSummary(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        java.math.BigDecimal totalEmissions = activityRepository.calculateTotalEmissions(user.getId());
        List<Object[]> categoryEmissions = activityRepository.getEmissionsByCategory(user.getId());

        System.out.println("DEBUG - User ID: " + user.getId() + " - Email: " + user.getEmail());
        System.out.println("DEBUG - DB totalEmissions: " + totalEmissions);
        System.out.println("DEBUG - DB categoryEmissions size: " + categoryEmissions.size());

        Map<String, Object> response = new HashMap<>();
        response.put("totalEmissions", totalEmissions == null ? 0.0 : totalEmissions.doubleValue());

        Map<String, Double> byCategory = new HashMap<>();
        // Initialize defaults expected by Dashboard frontend
        byCategory.put("Transport", 0.0);
        byCategory.put("Electricity", 0.0);
        byCategory.put("Food", 0.0);
        byCategory.put("Shopping", 0.0);

        for (Object[] row : categoryEmissions) {
            String rawCat = (String) row[0];
            java.math.BigDecimal em = (java.math.BigDecimal) row[1];
            double val = em == null ? 0.0 : em.doubleValue();
            
            System.out.println("DEBUG - Category: " + rawCat + " Emission: " + val);

            String normCat = normalizeCategory(rawCat);
            byCategory.put(normCat, byCategory.getOrDefault(normCat, 0.0) + val);
        }

        response.put("byCategory", byCategory);
        System.out.println("DEBUG - Final Response: " + response);

        return ResponseEntity.ok(response);
    }

    private String normalizeCategory(String cat) {
        if (cat == null) return "Shopping";
        String lower = cat.trim().toLowerCase();
        if (lower.contains("transport") || lower.contains("travel") || lower.contains("car") || lower.contains("bus") || lower.contains("commute")) return "Transport";
        if (lower.contains("electric") || lower.contains("energy") || lower.contains("power") || lower.contains("utility") || lower.contains("home energy")) return "Electricity";
        if (lower.contains("food") || lower.contains("diet") || lower.contains("meal") || lower.contains("biryani") || lower.contains("dosa") || lower.contains("tiffin") || lower.contains("pizza") || lower.contains("burger")) return "Food";
        if (lower.contains("shop") || lower.contains("purchase") || lower.contains("item")) return "Shopping";
        return cat.substring(0, 1).toUpperCase() + cat.substring(1).toLowerCase();
    }

    @GetMapping("/daily")
    public ResponseEntity<List<Map<String, Object>>> getDailyFootprint(Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getDailyFootprint(authentication.getName()));
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<Map<String, Object>>> getWeeklyFootprint(Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getWeeklyFootprint(authentication.getName()));
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyFootprint(Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getMonthlyFootprint(authentication.getName()));
    }

    @GetMapping("/category")
    public ResponseEntity<Map<String, Double>> getCategoryFootprint(Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getCategoryFootprint(authentication.getName()));
    }
}
