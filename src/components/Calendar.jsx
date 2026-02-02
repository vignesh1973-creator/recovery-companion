import React, { useState } from 'react';
import './Calendar.css';
import DayCell from './DayCell';
import CheckInModal from './CheckInModal';
import { useProgress } from '../hooks/useProgress';

const MONTHS_TO_SHOW = [
    new Date(2026, 1), // Feb
    new Date(2026, 2), // Mar
    new Date(2026, 3), // Apr
    new Date(2026, 4), // May
    new Date(2026, 5), // Jun
    new Date(2026, 6), // Jul
    new Date(2026, 7), // Aug
    new Date(2026, 8), // Sep (Added Sep as per user mention "aug 1 or sep")
];

const Calendar = () => {
    const { entries, markDay, getDayStatus, streak } = useProgress();
    const [selectedDate, setSelectedDate] = useState(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const handleDayClick = (date) => {
        // Prevent clicking future days
        if (date > today) return;

        // Open modal
        setSelectedDate(date);
    };

    const handleSaveEntry = (date, status, journal) => {
        const dateStr = date.toISOString().split('T')[0];
        markDay(dateStr, status, journal);
        setSelectedDate(null);
    };

    return (
        <div className="calendar-container">
            {/* Streak Header */}
            <div className="streak-banner">
                <h2>Current Streak</h2>
                <div className="streak-count">{streak} <span className="days-label">DAYS</span></div>
            </div>

            <div className="months-grid">
                {MONTHS_TO_SHOW.map((monthDate) => (
                    <MonthGrid
                        key={monthDate.getTime()}
                        monthDate={monthDate}
                        today={today}
                        getDayStatus={getDayStatus}
                        onDayClick={handleDayClick}
                    />
                ))}
            </div>

            {selectedDate && (
                <CheckInModal
                    date={selectedDate}
                    onClose={() => setSelectedDate(null)}
                    onSave={handleSaveEntry}
                />
            )}
        </div>
    );
};

const MonthGrid = ({ monthDate, today, getDayStatus, onDayClick }) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun

    const days = [];
    // Empty slots for start of month
    for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(<div key={`empty-${i}`} className="empty-slot"></div>);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dateStr = date.toISOString().split('T')[0];
        const statusEntry = getDayStatus(dateStr);
        const isFuture = date > today;

        days.push(
            <DayCell
                key={dateStr}
                date={date}
                status={statusEntry?.status}
                isFuture={isFuture}
                onClick={() => onDayClick(date)}
            />
        );
    }

    const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="month-card">
            <h3 className="month-title">{monthName}</h3>
            <div className="weekdays-row">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            <div className="days-grid">
                {days}
            </div>
        </div>
    );
};

export default Calendar;
