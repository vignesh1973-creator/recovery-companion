import React from 'react';
import './Calendar.css';
import DayCell from './DayCell';

const MONTHS_TO_SHOW = [
    new Date(2026, 1), // Feb
    new Date(2026, 2), // Mar
    new Date(2026, 3), // Apr
    new Date(2026, 4), // May
    new Date(2026, 5), // Jun
    new Date(2026, 6), // Jul
    new Date(2026, 7), // Aug
    new Date(2026, 8), // Sep
];

const Calendar = ({ progress, streak, targetDate, onDateClick }) => {
    // ...
    // ...

    // ...

    const MonthGrid = ({ monthDate, today, progress, targetDate, onDayClick }) => {
        // ...
        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const dateStr = date.toISOString().split('T')[0];
            const statusEntry = progress[dateStr];
            const isFuture = date > today;

            // Check Target
            const targetStr = targetDate.toISOString().split('T')[0];
            const isTarget = dateStr === targetStr;

            days.push(
                <DayCell
                    key={dateStr}
                    date={date}
                    status={statusEntry?.status}
                    isFuture={isFuture}
                    isTarget={isTarget}
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
