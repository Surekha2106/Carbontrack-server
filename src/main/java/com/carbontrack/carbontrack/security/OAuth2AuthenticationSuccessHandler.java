package com.carbontrack.carbontrack.security;

import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        // Extract email and name from OAuth2User
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        
        if (email == null) {
            String login = oAuth2User.getAttribute("login");
            if (login != null) {
                email = login + "@github.com";
            } else {
                email = UUID.randomUUID().toString() + "@oauth.com";
            }
        }
        
        if (name == null) {
            name = email.split("@")[0];
        }

        final String finalEmail = email;
        final String finalName = name;

        // Check if user exists, if not, create a new user
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(finalEmail)
                    .name(finalName)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Random password for OAuth users
                    .build();
            return userRepository.save(newUser);
        });

        // Generate JWT Token
        String token = jwtService.generateToken(userDetailsService.loadUserByUsername(user.getEmail()));
        
        // Create a JSON string with user data for the frontend to store
        String userJson = String.format("{\"id\":\"%d\",\"email\":\"%s\",\"name\":\"%s\"}", user.getId(), user.getEmail(), user.getName());
        String encodedUser = URLEncoder.encode(userJson, StandardCharsets.UTF_8);

        // Redirect to frontend
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth2/redirect")
                .queryParam("token", token)
                .queryParam("user", encodedUser)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
