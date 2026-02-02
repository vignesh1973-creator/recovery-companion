import React from 'react';
import './DayCell.css';

const DayCell = ({ date, status, onClick, isFuture, isTarget }) => {
    const dayNumber = date.getDate();

    let className = 'day-cell';
    if (status === 'success') className += ' success';
    else if (status === 'fail') className += ' fail';
    else if (!status) className += ' empty'; // Add empty class if no status
    if (isFuture) className += ' future';
    if (isTarget) className += ' target-day';

    return (
        <div
            className={className}
            onClick={!isFuture && !isTarget ? onClick : undefined} // Only allow click if not future and not target
            title={status ? status : isFuture ? "Future" : isTarget ? "Target Day" : "Log today"}
        >
            <span className="day-number">{dayNumber}</span>
            {status === 'success' && <span className="mark">✓</span>}
            {status === 'fail' && <span className="mark">✕</span>}
            {isTarget && <span className="target-icon">🏁</span>}
        </div>
    );
};

export default DayCell;
