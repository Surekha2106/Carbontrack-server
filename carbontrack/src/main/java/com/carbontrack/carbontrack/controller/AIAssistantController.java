package com.carbontrack.carbontrack.controller;

import com.carbontrack.carbontrack.dto.AIChatRequest;
import com.carbontrack.carbontrack.service.AIAssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIAssistantController {

    private final AIAssistantService aiAssistantService;

    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestBody AIChatRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Please login to use the AI Assistant.");
        }
        
        String email = authentication.getName(); // Extract email from the authenticated user
        String response = aiAssistantService.getAIResponse(email, request.getMessage());
        
        return ResponseEntity.ok(response);
    }
}
