import React, { useState, useEffect, useRef } from 'react';
import './UrgeSurfer.css';

// Using a more reliable direct MP3 link for ocean sounds
const OCEAN_SOUND_URL = "https://actions.google.com/sounds/v1/nature/ocean_waves_large_loop.ogg";

const UrgeSurfer = ({ onComplete, onCancel }) => {
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [isActive, setIsActive] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(new Audio(OCEAN_SOUND_URL));

    useEffect(() => {
        // Start Audio
        const audio = audioRef.current;
        audio.loop = true;
        audio.volume = 0.5;

        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log("Autoplay prevented:", e);
                // We keep it muted visually if autoplay fails
                setIsMuted(true);
            });
        }

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (isMuted) {
            audio.pause();
        } else {
            audio.play().catch(e => console.error("Play failed", e));
        }
    }, [isMuted]);

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

    const toggleSound = () => {
        setIsMuted(!isMuted);
    };

    return (
        <div className="urge-surfer-overlay">
            <button className="sound-toggle" onClick={toggleSound}>
                {isMuted ? '🔇 Unmute' : '🔊 Mute'}
            </button>

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
