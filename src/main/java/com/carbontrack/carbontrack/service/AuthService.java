package com.carbontrack.carbontrack.service;


import com.carbontrack.carbontrack.dto.LoginRequest;
import com.carbontrack.carbontrack.dto.RegisterRequest;
import com.carbontrack.carbontrack.dto.JwtResponse;
import com.carbontrack.carbontrack.dto.UserResponse;
import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.repository.UserRepository;
import com.carbontrack.carbontrack.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public JwtResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Email is already taken!");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), new ArrayList<>()
        );
        String jwtToken = jwtService.generateToken(userDetails);
        
        return JwtResponse.builder()
                .token(jwtToken)
                .user(new UserResponse(user.getId(), user.getName(), user.getEmail()))
                .build();
    }

    public JwtResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), new ArrayList<>()
        );
        String jwtToken = jwtService.generateToken(userDetails);

        return JwtResponse.builder()
                .token(jwtToken)
                .user(new UserResponse(user.getId(), user.getName(), user.getEmail()))
                .build();
    }
}
