package com.carbontrack.carbontrack.controller;

import com.carbontrack.carbontrack.dto.UserResponse;
import com.carbontrack.carbontrack.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getUserProfile(authentication.getName()));
    }

    @org.springframework.web.bind.annotation.PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(
            Authentication authentication,
            @org.springframework.web.bind.annotation.RequestBody UserResponse updateRequest) {
        return ResponseEntity.ok(userService.updateUserProfile(authentication.getName(), updateRequest));
    }

    @org.springframework.web.bind.annotation.PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @org.springframework.web.bind.annotation.RequestBody com.carbontrack.carbontrack.dto.ChangePasswordRequest request) {
        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<java.util.List<com.carbontrack.carbontrack.dto.LeaderboardDto>> getLeaderboard(Authentication authentication) {
        return ResponseEntity.ok(userService.getLeaderboard(authentication.getName()));
    }
}
