import { useState, useEffect } from 'react';

const STORAGE_KEY = 'recovery_progress';
const TARGET_DATE_KEY = 'recovery_target_date';
const SYNC_API = '/api/sync';

export const useProgress = () => {
    // 1. Load Progress (Optimistic UI: Load Local first, then BG Sync)
    const [progress, setProgress] = useState(() => {
        try {
            const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
            // Filter out any dates BEFORE the official start (e.g. Feb 1 auto-fails)
            const clean = {};
            const start = new Date('2026-02-02T00:00:00');
            Object.keys(raw).forEach(key => {
                const d = new Date(key);
                if (d >= start) {
                    clean[key] = raw[key];
                }
            });
            return clean;
        } catch { return {}; }
    });

    const [targetDate, setTargetDate] = useState(() => {
        const saved = localStorage.getItem(TARGET_DATE_KEY);
        return saved ? new Date(saved) : new Date('2026-08-01T00:00:00');
    });

    // 1.5 Load Flares (Optimistic)
    const [flares, setFlares] = useState(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('recovery_flares'));
            const currentMonth = new Date().getMonth();

            // Default State
            const defaultState = { count: 3, month: currentMonth };

            if (stored) {
                // Check if month changed since last save
                if (stored.month !== currentMonth) {
                    return defaultState; // Reset to 3
                }
                return stored;
            }
            return defaultState;
        } catch { return { count: 3, month: new Date().getMonth() }; }
    });

    // 2. Initial Cloud Sync (On Mount)
    useEffect(() => {
        const syncFromCloud = async () => {
            try {
                const response = await fetch(SYNC_API);
                if (response.ok) {
                    const cloudData = await response.json();

                    if (cloudData && cloudData.progress) {
                        console.log("☁️ Cloud Data Received");
                        // Merge or Overwrite? For now, Cloud wins if it has data.
                        setProgress(cloudData.progress);
                        if (cloudData.targetDate) {
                            setTargetDate(new Date(cloudData.targetDate));
                        }
                        if (cloudData.reasons) setReasons(cloudData.reasons);
                        if (cloudData.urgeSurfs) setUrgeSurfs(cloudData.urgeSurfs);

                        if (cloudData.flares) {
                            // Check month validity on cloud data too
                            const currentMonth = new Date().getMonth();
                            if (cloudData.flares.month !== currentMonth) {
                                setFlares({ count: 3, month: currentMonth });
                            } else {
                                setFlares(cloudData.flares);
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Sync failed:", e);
            }
        };

        syncFromCloud();
    }, []);

    // 3. Persist Changes (Local + Cloud)
    // We defer the Cloud Sync to avoid spamming the database on every keystroke
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }, [progress]);

    useEffect(() => {
        localStorage.setItem(TARGET_DATE_KEY, targetDate.toISOString());
    }, [targetDate]);

    useEffect(() => {
        localStorage.setItem('recovery_flares', JSON.stringify(flares));
    }, [flares]);

    useEffect(() => {
        localStorage.setItem('recovery_reasons', JSON.stringify(reasons));
    }, [reasons]);

    useEffect(() => {
        localStorage.setItem('recovery_surfs', urgeSurfs.toString());
    }, [urgeSurfs]);

    // Debounced Cloud Save
    useEffect(() => {
        const timer = setTimeout(() => {
            const payload = {
                progress,
                targetDate: targetDate.toISOString(),
                flares,
                reasons,
                urgeSurfs
            };

            fetch(SYNC_API, {
                method: 'POST',
                body: JSON.stringify(payload)
            }).then(r => {
                if (r.ok) console.log("☁️ Saved to Cloud");
            }).catch(e => console.error("Cloud Save Failed", e));

        }, 2000); // Wait 2s after last change before saving

        return () => clearTimeout(timer);
    }, [progress, targetDate, flares, reasons, urgeSurfs]);


    // 4. Extend Target Helper
    const extendTargetDate = (days) => {
        setTargetDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + days);
            return newDate;
        });
    };

    // Helper: Use Flare
    const decrementFlare = () => {
        setFlares(prev => ({
            ...prev,
            count: Math.max(0, prev.count - 1)
        }));
    };

    // 5. Auto-Fail Missed Days (On Mount)
    useEffect(() => {
        const checkMissed = () => {
            const start = new Date('2026-02-02T00:00:00');
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

        // Only run if we actually have some progress loaded (to avoid overwriting empty state)
        if (Object.keys(progress).length > 0) {
            checkMissed();
        }
    }, []);

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
            const currentStreak = calculateStreak();
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
        targetDate,
        flares,
        decrementFlare,
        reasons,
        addReason,
        deleteReason,
        urgeSurfs,
        incrementSurf
    };
};
