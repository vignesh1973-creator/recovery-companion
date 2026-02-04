import React, { useState, useEffect, useRef } from 'react';
import './UrgeSurfer.css';

const UrgeSurfer = ({ onComplete, onCancel }) => {
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [isActive, setIsActive] = useState(true);
    const [isMuted, setIsMuted] = useState(false);

    // Web Audio API Refs
    const audioContextRef = useRef(null);
    const gainNodeRef = useRef(null);
    const noiseNodeRef = useRef(null);

    // --- PROCEDURAL AUDIO GENERATOR ---
    const startOceanSound = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            // Reuse context if exists, or create new
            let ctx = audioContextRef.current;
            if (!ctx) {
                ctx = new AudioContext();
                audioContextRef.current = ctx;
            }

            // Resume context (CRITICAL for browser autoplay policies)
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            // 1. Create Brown Noise (Deep rumbling)
            // Fix: Declare lastOut OUTSIDE the loop
            const bufferSize = 2 * ctx.sampleRate;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);

            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5; // Compensate for gain
            }

            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.loop = true;
            noiseNodeRef.current = noise;

            // 2. Filter (Cut off high screechy sounds)
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400; // Low rumble

            // 3. Gain (Volume Control for Wave Effect)
            const gainNode = ctx.createGain();
            gainNode.gain.value = 0; // Start silent
            gainNodeRef.current = gainNode;

            // Connect graph
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(ctx.destination);

            noise.start();

            // 4. Wave Modulation Loop
            modulateWaves(ctx, gainNode);

            setIsMuted(false);

        } catch (e) {
            console.error("Audio Init Failed:", e);
        }
    };

    const modulateWaves = (ctx, gainNode) => {
        // Create a gentle wave cycle (rise and fall)
        const t = ctx.currentTime;
        gainNode.gain.cancelScheduledValues(t);

        // Fade in
        gainNode.gain.linearRampToValueAtTime(0.1, t + 2); // Base noise

        const cycle = 10; // seconds

        const scheduleWave = (startTime) => {
            // Rise
            gainNode.gain.linearRampToValueAtTime(0.6, startTime + (cycle / 2));
            // Fall
            gainNode.gain.linearRampToValueAtTime(0.1, startTime + cycle);
        };

        // Schedule waves for the duration
        for (let i = 0; i < 65; i++) {
            scheduleWave(t + (i * cycle));
        }
    };

    const stopOceanSound = () => {
        if (gainNodeRef.current && audioContextRef.current) {
            // Fade out
            try {
                const t = audioContextRef.current.currentTime;
                gainNodeRef.current.gain.cancelScheduledValues(t);
                gainNodeRef.current.gain.linearRampToValueAtTime(0, t + 1);

                setTimeout(() => {
                    if (noiseNodeRef.current) {
                        noiseNodeRef.current.stop();
                        noiseNodeRef.current.disconnect();
                    }
                    // Don't close context, just stop sound to allow restart
                }, 1000);
            } catch (e) {
                console.warn("Error stopping audio:", e);
            }
        }
    };

    const toggleSound = () => {
        if (isMuted) {
            // Unmute / Start
            startOceanSound();
        } else {
            // Mute / Stop
            stopOceanSound();
            setIsMuted(true);
        }
    };

    // Auto-start check 
    useEffect(() => {
        setIsMuted(true);
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(e => console.warn(e));
            }
        };
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Success!
            setIsActive(false);
            stopOceanSound();
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
            <button className="sound-toggle" onClick={toggleSound}>
                {isMuted ? '🔇 Tap to Enable Sound' : '🔊 Mute Sound'}
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
