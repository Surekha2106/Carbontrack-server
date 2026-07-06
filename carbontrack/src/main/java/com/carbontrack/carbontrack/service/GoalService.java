package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.entity.Goal;
import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.repository.GoalRepository;
import com.carbontrack.carbontrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public List<Goal> getUserGoals(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return goalRepository.findByUserId(user.getId());
    }

    public Goal createGoal(String email, Goal goalRequest) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        goalRequest.setUser(user);
        return goalRepository.save(goalRequest);
    }
}
