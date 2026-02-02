import { useState, useEffect } from 'react';

const STORAGE_KEY = 'recovery_progress';

export const useProgress = () => {
    const [entries, setEntries] = useState({});

    useEffect(() => {
        // Load from local storage on mount
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setEntries(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse recovery progress", e);
            }
        }
    }, []);

    const saveEntries = (newEntries) => {
        setEntries(newEntries);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    };

    const markDay = (dateString, status, journal = '') => {
        const newEntries = {
            ...entries,
            [dateString]: {
                status, // 'success' | 'fail'
                journal,
                timestamp: new Date().toISOString()
            }
        };
        saveEntries(newEntries);
    };

    const getDayStatus = (dateString) => {
        return entries[dateString] || null;
    };

    const calculateStreak = () => {
        // Simple streak calculation: count consecutive previous days with 'success'
        // Note: This is a basic implementation. Robust streak logic might need to handle today/yesterday carefully.
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check backwards from yesterday
        let current = new Date(today);
        current.setDate(current.getDate() - 1); // Start checking from yesterday

        while (true) {
            const dateStr = current.toISOString().split('T')[0];
            const entry = entries[dateStr];
            if (entry && entry.status === 'success') {
                streak++;
                current.setDate(current.getDate() - 1);
            } else {
                // Check if "today" is already marked success, if so add 1 (if we started counting from yesterday)
                // Basic version: just count backward.
                break;
            }
        }

        // Check if *today* is successful, add to streak
        const todayStr = today.toISOString().split('T')[0];
        if (entries[todayStr]?.status === 'success') {
            streak++;
        }

        return streak;
    };

    return {
        entries,
        markDay,
        getDayStatus,
        streak: calculateStreak()
    };
};
