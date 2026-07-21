package com.carbontrack.carbontrack.event;

import com.carbontrack.carbontrack.entity.Goal;
import org.springframework.context.ApplicationEvent;

public class GoalAchievedEvent extends ApplicationEvent {
    private final Goal goal;

    public GoalAchievedEvent(Object source, Goal goal) {
        super(source);
        this.goal = goal;
    }

    public Goal getGoal() {
        return goal;
    }
}
