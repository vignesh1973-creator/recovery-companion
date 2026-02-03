import React, { useState, useEffect, useRef } from 'react';
import './UrgeSurfer.css';

const UrgeSurfer = ({ onComplete, onCancel }) => {
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [isActive, setIsActive] = useState(true);
    const audioRef = useRef(new Audio('https://cdn.pixabay.com/download/audio/2021/08/09/audio_88447e769f.mp3?filename=ocean-waves-112906.mp3'));

    useEffect(() => {
        // Start Audio
        const audio = audioRef.current;
        audio.loop = true;
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play failed (user interaction needed first)", e));

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, []);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Success!
            setIsActive(false);
            audioRef.current.pause();
            onComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, onComplete]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="urge-surfer-overlay">
            <div className="wave-bg">
                <div className="wave wave1"></div>
                <div className="wave wave2"></div>
                <div className="wave wave3"></div>
            </div>

            <div className="surfer-content">
                <h2>Ride The Wave</h2>
                <p>Cravings are like waves. They rise, peak, and fall.</p>

                <div className="timer-display">
                    {formatTime(timeLeft)}
                </div>

                <p className="instruction">Just breathe and wait for it to pass.</p>

                <button className="btn-secondary btn-cancel-surf" onClick={onCancel}>
                    I'm feeling stronger now (Exit)
                </button>
            </div>
        </div>
    );
};

export default UrgeSurfer;
