package com.carbontrack.carbontrack.controller;

import com.carbontrack.carbontrack.dto.AcceptInviteRequest;
import com.carbontrack.carbontrack.dto.InviteInfoResponse;
import com.carbontrack.carbontrack.dto.LoginRequest;
import com.carbontrack.carbontrack.dto.RegisterRequest;
import com.carbontrack.carbontrack.dto.JwtResponse;
import com.carbontrack.carbontrack.dto.OtpRequest;
import com.carbontrack.carbontrack.dto.OtpVerifyRequest;
import com.carbontrack.carbontrack.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/otp/send")
    public ResponseEntity<String> sendOtp(@RequestBody OtpRequest request) {
        authService.sendOtp(request.getEmail());
        return ResponseEntity.ok("OTP sent successfully to " + request.getEmail());
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<JwtResponse> verifyOtp(@RequestBody OtpVerifyRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request.getEmail(), request.getOtp()));
    }

    @PostMapping("/accept-invite")
    public ResponseEntity<JwtResponse> acceptInvite(@RequestBody AcceptInviteRequest request) {
        return ResponseEntity.ok(authService.acceptInvite(request));
    }

    @GetMapping("/invite-info")
    public ResponseEntity<InviteInfoResponse> getInviteInfo(@RequestParam String token) {
        return ResponseEntity.ok(authService.getInviteInfo(token));
    }
}
