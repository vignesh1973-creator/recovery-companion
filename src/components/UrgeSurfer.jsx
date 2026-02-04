import React, { useState, useEffect, useRef } from 'react';
import './UrgeSurfer.css';

// Using Google Actions Nature Sounds (Reliable CDN)
const OCEAN_SOUND_URL = "https://actions.google.com/sounds/v1/nature/ocean_waves_large_loop.ogg";

const UrgeSurfer = ({ onComplete, onCancel }) => {
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [isActive, setIsActive] = useState(true);
    const [isMuted, setIsMuted] = useState(false); // Default to false, but might need interaction
    const audioRef = useRef(null);

    useEffect(() => {
        // Attempt Autoplay on mount
        const audio = audioRef.current;
        if (audio) {
            audio.volume = 0.6;
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Autoplay prevented. User interaction required.");
                    setIsMuted(true); // Reflect state
                });
            }
        }

        return () => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        };
    }, []);

    const toggleSound = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isMuted) {
            // Unmute -> Try to play
            audio.play().then(() => {
                setIsMuted(false);
            }).catch(e => console.error("Play error:", e));
        } else {
            // Mute -> Pause
            audio.pause();
            setIsMuted(true);
        }
    };

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Success!
            setIsActive(false);
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
            {/* Audio Element */}
            <audio ref={audioRef} src={OCEAN_SOUND_URL} loop preload="auto" />

            <button className="sound-toggle" onClick={toggleSound}>
                {isMuted ? '🔇 Unmute Sound' : '🔊 Mute Sound'}
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
