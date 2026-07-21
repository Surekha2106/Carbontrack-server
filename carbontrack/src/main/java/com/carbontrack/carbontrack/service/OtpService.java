package com.carbontrack.carbontrack.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class OtpService {

    // Store OTPs in high-speed memory. Key: Email, Value: OtpDetails
    private final Map<String, OtpDetails> otpCache = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    private static class OtpDetails {
        String code;
        LocalDateTime expirationTime;

        OtpDetails(String code, LocalDateTime expirationTime) {
            this.code = code;
            this.expirationTime = expirationTime;
        }
    }

    public String generateAndStoreOtp(String email) {
        // Generate a 6-digit cryptographically secure OTP
        int number = secureRandom.nextInt(999999);
        String otpCode = String.format("%06d", number);

        // Store OTP with a 5-minute expiration window
        otpCache.put(email, new OtpDetails(otpCode, LocalDateTime.now().plusMinutes(5)));
        
        log.info("Generated new OTP for {}", email);
        return otpCode;
    }

    public boolean validateOtp(String email, String inputCode) {
        OtpDetails details = otpCache.get(email);

        if (details == null) {
            log.warn("OTP validation failed: No OTP requested for {}", email);
            return false;
        }

        if (LocalDateTime.now().isAfter(details.expirationTime)) {
            log.warn("OTP validation failed: Code expired for {}", email);
            otpCache.remove(email); // Clean up
            return false;
        }

        if (details.code.equals(inputCode)) {
            log.info("OTP successfully validated for {}", email);
            otpCache.remove(email); // Consume the OTP so it can't be reused
            return true;
        }

        log.warn("OTP validation failed: Invalid code entered for {}", email);
        return false;
    }
}
