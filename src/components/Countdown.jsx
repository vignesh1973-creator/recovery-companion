import React, { useState, useEffect } from 'react';
import './Countdown.css';

const GOALS = [
    "become a new person",
    "total freedom",
    "break the chains",
    "master your mind",
    "reclaim your potential",
    "unshakeable discipline",
    "a life of purpose",
    "become unbreakable"
];

const Countdown = ({ targetDate }) => {
    const [daysLeft, setDaysLeft] = useState(0);
    const [goalText, setGoalText] = useState(GOALS[0]);

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        // Calculate difference
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        setDaysLeft(diffDays > 0 ? diffDays : 0);

        // Pick a random goal text
        const randomGoal = GOALS[Math.floor(Math.random() * GOALS.length)];
        setGoalText(randomGoal);
    }, [targetDate]);

    return (
        <div className="countdown-container">
            <div className="countdown-number">{daysLeft}</div>
            <div className="countdown-label">
                DAYS TO <span className="dynamic-goal">{goalText}</span>
            </div>
        </div>
    );
};

export default Countdown;
