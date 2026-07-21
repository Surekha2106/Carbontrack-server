package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.repository.ActivityRepository;
import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    public List<java.util.Map<String, String>> getPersonalisedRecommendations(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Analyze last 30 days
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        
        List<Object[]> topActivities = activityRepository.getTopEmissionActivitiesSince(user.getId(), thirtyDaysAgo);
        
        List<java.util.Map<String, String>> recommendations = new ArrayList<>();
        
        // Take top 3 activities and map them to tips
        int count = 0;
        for (Object[] row : topActivities) {
            if (count >= 3) break;
            
            String activityType = (String) row[0];
            Double totalEmissions = ((Number) row[1]).doubleValue();
            
            if (totalEmissions > 0) {
                java.util.Map<String, String> rec = new java.util.HashMap<>();
                rec.put("activity", activityType);
                rec.put("tip", mapActivityToTip(activityType));
                recommendations.add(rec);
                count++;
            }
        }
        
        if (recommendations.isEmpty()) {
            java.util.Map<String, String> defaultRec = new java.util.HashMap<>();
            defaultRec.put("activity", "General");
            defaultRec.put("tip", "Great job! Keep logging your activities to get personalised tips.");
            recommendations.add(defaultRec);
        }
        
        return recommendations;
    }
    
    private String mapActivityToTip(String activityType) {
        return switch (activityType.toLowerCase()) {
            case "car" -> "Your car trips are generating high emissions. Consider carpooling or taking public transit twice a week.";
            case "flight" -> "Flights are your highest contributor. Consider offsetting your carbon footprint for recent flights.";
            case "beef" -> "Beef has a very high carbon footprint. Try swapping one beef meal a week for a plant-based alternative.";
            case "electricity" -> "Your electricity consumption is high. Switching to LED bulbs and turning off standby appliances can help.";
            default -> "Consider reducing your frequency or finding greener alternatives for: " + activityType + ".";
        };
    }
    public List<String> getOrganisationRecommendations(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOrganisation() == null) {
            return getPersonalisedRecommendations(email);
        }

        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<Object[]> categoryEmissions = activityRepository.getOrgEmissionsByCategorySince(user.getOrganisation().getId(), thirtyDaysAgo);
        
        List<String> recommendations = new ArrayList<>();
        
        // Sort by highest emission
        categoryEmissions.sort((a, b) -> Double.compare(((Number) b[1]).doubleValue(), ((Number) a[1]).doubleValue()));

        int count = 0;
        for (Object[] row : categoryEmissions) {
            if (count >= 3) break;
            
            String category = (String) row[0];
            Double totalEmissions = ((Number) row[1]).doubleValue();
            
            if (totalEmissions > 0) {
                recommendations.add(mapOrgCategoryToTip(category));
                count++;
            }
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("Your organization is on track. Continue monitoring emissions to maintain efficiency.");
        }
        
        return recommendations;
    }

    private String mapOrgCategoryToTip(String category) {
        return switch (category.toLowerCase()) {
            case "transport", "logistics" -> "Logistics and transport contribute the highest emissions. Encourage carpooling, remote work, or fleet electrification.";
            case "electricity", "energy" -> "Electricity consumption is high. Switching to LED lighting and optimizing HVAC systems could reduce emissions significantly.";
            case "food" -> "Catering and food supply chain have a high footprint. Consider partnering with local, plant-based or sustainable food vendors.";
            case "shopping", "procurement" -> "Procurement emissions are elevated. Audit your supply chain to prioritize eco-friendly and low-emission suppliers.";
            default -> "Review operations in " + category + " to identify potential efficiency improvements.";
        };
    }
}
