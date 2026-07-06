package com.carbontrack.carbontrack.controller;

import com.carbontrack.carbontrack.dto.ActivityRequest;
import com.carbontrack.carbontrack.entity.ActivityLog;
import com.carbontrack.carbontrack.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getUserActivities(Authentication authentication) {
        return ResponseEntity.ok(activityService.getUserActivities(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<ActivityLog> logActivity(
            @RequestBody ActivityRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(activityService.addActivity(authentication.getName(), request));
    }
}
