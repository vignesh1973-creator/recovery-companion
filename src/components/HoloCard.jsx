import React, { useRef, useState } from 'react';
import './HoloCard.css';

const HoloCard = ({ image, name, stats }) => {
    const cardRef = useRef(null);
    const [transform, setTransform] = useState('');
    const [shine, setShine] = useState('');

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;

        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        const centerX = width / 2;
        const centerY = height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg
        const rotateY = ((x - centerX) / centerX) * 10;

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`);

        // Holographic Shine Calculation
        const shineX = (x / width) * 100;
        const shineY = (y / height) * 100;
        setShine(`radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.4), transparent 50%)`);
    };

    const handleMouseLeave = () => {
        setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
        setShine('');
    };

    return (
        <div
            className="holo-card-container"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className="holo-card"
                ref={cardRef}
                style={{ transform: transform }}
            >
                <div className="holo-bg" style={{ backgroundImage: `url('/assets/omnitrix.png')` }}></div>
                <img src={image} alt={name} className="holo-char" />
                <div className="holo-overlay" style={{ background: shine }}></div>
                <div className="holo-content">
                    <h3>{name}</h3>
                    <div className="holo-stats">
                        {stats && stats.map((stat, i) => (
                            <div key={i} className="stat-row">
                                <span>{stat.label}</span>
                                <div className="stat-bar">
                                    <div className="stat-fill" style={{ width: `${stat.value}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="scan-line"></div>
            </div>
        </div>
    );
};

export default HoloCard;
