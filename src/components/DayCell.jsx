import React from 'react';
import './DayCell.css';

const DayCell = ({ date, status, onClick, isFuture }) => {
    const dayNumber = date.getDate();

    let className = `day-cell ${status || 'empty'}`;
    if (isFuture) className += ' future';

    return (
        <div
            className={className}
            onClick={!isFuture && !status ? onClick : undefined}
            title={status ? status : isFuture ? "Future" : "Log today"}
        >
            <span className="day-number">{dayNumber}</span>
            {status === 'success' && <span className="mark">✓</span>}
            {status === 'fail' && <span className="mark">✕</span>}
        </div>
    );
};

export default DayCell;
