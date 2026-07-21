package com.carbontrack.carbontrack.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.repository.UserRepository;
import com.carbontrack.carbontrack.repository.ActivityRepository;

@Service
@RequiredArgsConstructor
public class AIAssistantService {

    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ai.api.url:}")
    private String apiUrl;

    @Value("${ai.api.key:}")
    private String apiKey;
    
    @Value("${ai.api.model:}")
    private String apiModel;

    public String getAIResponse(String userEmail, String message) {
        if (apiKey == null || apiKey.isBlank() || apiKey.contains("YOUR_API_KEY")) {
            return "Hello! I am your AI Assistant. Please add your OpenAI or Groq API Key to `application.properties` under `ai.api.key` and restart the server.";
        }

        try {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            String userName = user != null ? user.getName() : "Valued User";
            
            LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
            java.math.BigDecimal totalEmissions = java.math.BigDecimal.ZERO;
            String topActivity = "None recorded recently";

            if (user != null) {
                totalEmissions = activityRepository.calculateTotalEmissionsSince(user.getId(), thirtyDaysAgo);
                if (totalEmissions == null) totalEmissions = java.math.BigDecimal.ZERO;
                
                List<Object[]> topActivities = activityRepository.getTopEmissionActivitiesSince(user.getId(), thirtyDaysAgo);
                if (topActivities != null && !topActivities.isEmpty()) {
                    topActivity = (String) topActivities.get(0)[0];
                }
            }

            String systemPrompt = "You are the CarbonTrack AI Eco-Coach, an expert sustainability advisor and data analyst. Your goal is to help users understand their environmental impact, provide actionable reduction strategies, and encourage sustainable habits.\n\n"
                    + "USER CONTEXT:\n"
                    + "- Name: " + userName + "\n"
                    + "- Total Monthly Emissions: " + String.format("%.2f", totalEmissions.doubleValue()) + " kg CO2\n"
                    + "- Most Frequent Emission Source: " + topActivity + "\n\n"
                    + "CONVERSATION RULES:\n"
                    + "1. Tone: Be concise, highly encouraging, and professional.\n"
                    + "2. Personalization: Always ground your advice in the USER CONTEXT provided above. Do not give generic advice if specific data is available.\n"
                    + "3. Boundary Enforcement: If the user asks about topics completely unrelated to sustainability, gamification, or their data, politely redirect the conversation back to their environmental goals.\n"
                    + "4. Formatting: Use clean markdown (bolding for emphasis, single-level bullet points) so the response renders perfectly on the dashboard UI.";

            // Construct JSON body safely for standard OpenAI API format
            Map<String, Object> requestMap = new HashMap<>();
            requestMap.put("model", apiModel);
            
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemPrompt);
            
            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", message);
            
            requestMap.put("messages", List.of(systemMessage, userMessage));
            requestMap.put("temperature", 0.7);
            
            String requestBody = objectMapper.writeValueAsString(requestMap);

            HttpClient client = HttpClient.newBuilder()
                    .version(HttpClient.Version.HTTP_1_1)
                    .connectTimeout(java.time.Duration.ofSeconds(15))
                    .followRedirects(HttpClient.Redirect.NORMAL)
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl.trim()))
                    .timeout(java.time.Duration.ofSeconds(30))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey.trim())
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode rootNode = objectMapper.readTree(response.body());
                if (rootNode.has("choices") && rootNode.get("choices").size() > 0) {
                    JsonNode textNode = rootNode.path("choices").get(0).path("message").path("content");
                    return textNode.asText();
                } else {
                    return "Model returned an unexpected response structure: " + response.body();
                }
            } else {
                return "I encountered an error connecting to the AI model. (Status " + response.statusCode() + ")\nResponse: " + response.body();
            }

        } catch (Exception e) {
            e.printStackTrace();
            String errorMsg = e.getMessage();
            if (errorMsg == null && e.getCause() != null) {
                errorMsg = e.getCause().getMessage();
            }
            if (errorMsg == null) {
                errorMsg = e.toString();
            }
            return "Sorry, I am having trouble connecting to the AI model right now.\nDetails: " + errorMsg + "\nType: " + e.getClass().getName();
        }
    }
}

