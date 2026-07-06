package com.carbontrack.carbontrack.controller;

import com.carbontrack.carbontrack.entity.Badge;
import com.carbontrack.carbontrack.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    @GetMapping
    public ResponseEntity<List<Badge>> getUserBadges(Authentication authentication) {
        return ResponseEntity.ok(badgeService.getUserBadges(authentication.getName()));
    }
}
