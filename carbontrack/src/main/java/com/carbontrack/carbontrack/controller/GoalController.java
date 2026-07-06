package com.carbontrack.carbontrack.controller;

import com.carbontrack.carbontrack.entity.Goal;
import com.carbontrack.carbontrack.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    public ResponseEntity<List<Goal>> getUserGoals(Authentication authentication) {
        return ResponseEntity.ok(goalService.getUserGoals(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<Goal> createGoal(
            @RequestBody Goal goalRequest,
            Authentication authentication
    ) {
        return ResponseEntity.ok(goalService.createGoal(authentication.getName(), goalRequest));
    }
}
