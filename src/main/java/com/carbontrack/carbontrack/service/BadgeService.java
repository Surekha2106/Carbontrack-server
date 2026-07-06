package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.entity.Badge;
import com.carbontrack.carbontrack.entity.UserBadge;
import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.repository.BadgeRepository;
import com.carbontrack.carbontrack.repository.UserBadgeRepository;
import com.carbontrack.carbontrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;

    public List<Badge> getUserBadges(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userBadgeRepository.findByUserId(user.getId()).stream()
                .map(UserBadge::getBadge)
                .collect(Collectors.toList());
    }
}
