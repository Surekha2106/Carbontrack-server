package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.dto.LeaderboardDto;
import com.carbontrack.carbontrack.dto.UserResponse;
import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.repository.ActivityRepository;
import com.carbontrack.carbontrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;

    @Transactional
    public UserResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate today = LocalDate.now();
        if (user.getLastActiveDate() == null) {
            user.setLastActiveDate(today);
            user.setCurrentStreak(1);
            if (user.getHighestStreak() < 1) user.setHighestStreak(1);
        } else if (user.getLastActiveDate().isBefore(today)) {
            if (user.getLastActiveDate().equals(today.minusDays(1))) {
                user.setCurrentStreak(user.getCurrentStreak() + 1);
                if (user.getCurrentStreak() > user.getHighestStreak()) {
                    user.setHighestStreak(user.getCurrentStreak());
                }
            } else {
                user.setCurrentStreak(1);
            }
            user.setLastActiveDate(today);
        }
        userRepository.save(user);

        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .department(user.getDepartment())
                .currentStreak(user.getCurrentStreak())
                .highestStreak(user.getHighestStreak());

        if (user.getOrganisation() != null) {
            builder.orgId(user.getOrganisation().getId())
                   .organisationName(user.getOrganisation().getName())
                   .logoUrl(user.getOrganisation().getLogoUrl())
                   .primaryColor(user.getOrganisation().getPrimaryColor());
        }

        return builder.build();
    }

    public List<LeaderboardDto> getLeaderboard(String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail).orElse(null);
        List<Object[]> rawBoard;

        if (user != null && user.getOrganisation() != null) {
            // Tenant Isolated Company Leaderboard
            rawBoard = activityRepository.getLeaderboardByOrganisation(user.getOrganisation().getId());
        } else {
            // Public Global Leaderboard (personal users only)
            rawBoard = activityRepository.getGlobalLeaderboard();
        }

        List<LeaderboardDto> board = new ArrayList<>();
        int rank = 1;
        for (Object[] row : rawBoard) {
            String name = (String) row[0];
            String email = (String) row[1];
            java.math.BigDecimal score = (java.math.BigDecimal) row[2];
            board.add(LeaderboardDto.builder()
                    .rank(rank++)
                    .name(name)
                    .email(email)
                    .score(score)
                    .isUser(email.equals(currentUserEmail))
                    .build());
        }
        return board;
    }
}
