import { useState, useEffect } from 'react';

const STORAGE_KEY = 'recovery_progress';
const TARGET_DATE_KEY = 'recovery_target_date';

export const useProgress = () => {
    // 1. Load Progress
    const [progress, setProgress] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch { return {}; }
    });

    // 2. Load Target Date (Default: Aug 1, 2026)
    const [targetDate, setTargetDate] = useState(() => {
        const saved = localStorage.getItem(TARGET_DATE_KEY);
        return saved ? new Date(saved) : new Date('2026-08-01T00:00:00');
    });

    // 3. Persist Changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }, [progress]);

    useEffect(() => {
        localStorage.setItem(TARGET_DATE_KEY, targetDate.toISOString());
    }, [targetDate]);

    // 4. Extend Target Helper
    const extendTargetDate = (days) => {
        setTargetDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + days);
            return newDate;
        });
    };

    // 5. Auto-Fail Missed Days (On Mount)
    useEffect(() => {
        const checkMissed = () => {
            const start = new Date('2026-02-01T00:00:00');
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let tempProgress = { ...progress };
            let penaltyDays = 0;
            let hasChanges = false;

            // Loop: Start -> Yesterday
            for (let d = new Date(start); d < today; d.setDate(d.getDate() + 1)) {
                const dateKey = d.toISOString().split('T')[0];
                if (!tempProgress[dateKey]) {
                    // MISSING ENTRY -> Mark as Fail -> +1 Penalty
                    tempProgress[dateKey] = { status: 'fail', journal: 'Missed Check-in (Auto-penalty)' };
                    penaltyDays += 1;
                    hasChanges = true;
                }
            }

            if (hasChanges) {
                // If we found 5 missed days, target moves 5 days
                setProgress(tempProgress);
                if (penaltyDays > 0) {
                    extendTargetDate(penaltyDays);
                }
            }
        };

        checkMissed();
    }, []); // Run once on mount

    // 6. Calculate Streak
    const calculateStreak = () => {
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if today is successful
        const todayKey = today.toISOString().split('T')[0];
        if (progress[todayKey]?.status === 'success') {
            streak++;
        }

        // Count backwards from yesterday
        let d = new Date(today);
        d.setDate(d.getDate() - 1);

        while (true) {
            const key = d.toISOString().split('T')[0];
            if (progress[key]?.status === 'success') {
                streak++;
                d.setDate(d.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    };

    // 7. Save Day (Check-in) with Relapse Penalty
    const saveDay = (date, status, journal) => {
        const key = date.toISOString().split('T')[0];

        if (status === 'fail') {
            // RELAPSE LOGIC:
            // "if he fails ... add streak days on later months"
            const currentStreak = calculateStreak();

            // If current streak is 5, add 5 days. 
            // If it's 0 (maybe just missed yesterday?), add 1 day or 0? 
            // User implies penalty is proportional to "wasted" days.
            // If streak is 0, he hasn't "wasted" a streak, but a fail is bad.
            // Let's ensure at least 1 day penalty for a fail.
            const penalty = currentStreak > 0 ? currentStreak : 1;

            extendTargetDate(penalty);
        }

        setProgress(prev => ({
            ...prev,
            [key]: { status, journal, timestamp: new Date().toISOString() }
        }));
    };

    return {
        progress,
        saveDay,
        streak: calculateStreak(),
        targetDate
    };
};
