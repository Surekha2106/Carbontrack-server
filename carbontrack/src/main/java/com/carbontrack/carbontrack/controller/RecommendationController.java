package com.carbontrack.carbontrack.controller;

import com.carbontrack.carbontrack.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<List<String>> getRecommendations(Authentication authentication) {
        return ResponseEntity.ok(recommendationService.getPersonalisedRecommendations(authentication.getName()));
    }

    @GetMapping("/org")
    public ResponseEntity<List<String>> getOrganisationRecommendations(Authentication authentication) {
        return ResponseEntity.ok(recommendationService.getOrganisationRecommendations(authentication.getName()));
    }
}
