package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.repository.ActivityRepository;
import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BenchmarkService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getPeerBenchmark(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Analyze last 30 days
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        
        List<Object[]> allEmissions = activityRepository.getAllUsersEmissionsSince(thirtyDaysAgo);
        
        double platformTotal = 0;
        double userEmission = 0;
        int betterThanCount = 0;
        
        for (Object[] row : allEmissions) {
            Long rowUserId = (Long) row[0];
            double emission = ((Number) row[1]).doubleValue();
            
            platformTotal += emission;
            
            if (rowUserId.equals(user.getId())) {
                userEmission = emission;
            }
        }
        
        for (Object[] row : allEmissions) {
            double emission = ((Number) row[1]).doubleValue();
            if (emission > userEmission) {
                betterThanCount++; // User is better (has less emissions) than these users
            }
        }
        
        int totalUsers = allEmissions.size();
        double platformAverage = totalUsers > 0 ? platformTotal / totalUsers : 0;
        double percentile = totalUsers > 1 ? ((double) betterThanCount / (totalUsers - 1)) * 100 : 100;
        
        // Category comparison (mocking this slightly by taking the user's category vs a simplified global average)
        List<Object[]> userCategories = activityRepository.getEmissionsByCategorySince(user.getId(), thirtyDaysAgo);
        Map<String, Double> categoryComparison = new HashMap<>();
        double globalCategoryAvg = platformAverage / 4.0; // rough average per category

        for (Object[] row : userCategories) {
            String cat = (String) row[0];
            Double catEmission = ((Number) row[1]).doubleValue();
            
            // Percentage diff from the hypothetical global category average
            double diff = globalCategoryAvg > 0 ? ((catEmission - globalCategoryAvg) / globalCategoryAvg) * 100 : 0;
            categoryComparison.put(cat, diff);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("userEmission", userEmission);
        result.put("platformAverage", platformAverage);
        result.put("percentile", percentile);
        result.put("categoryComparison", categoryComparison);
        result.put("message", String.format("You're in the Top %.0f%% of eco-friendly users.", 100 - percentile));
        
        return result;
    }
}
