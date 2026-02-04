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

            const ctx = new AudioContext();
            audioContextRef.current = ctx;

            // 1. Create Brown Noise (Deep rumbling)
            const bufferSize = 2 * ctx.sampleRate;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5; // Compensate for gain
            }
            let lastOut = 0;

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

        // Cyclic Waves
        // We can't easily loop automation, so we set an interval to 'push' new waves
        // Or just let brown noise exist for now as a constant soothe, 
        // simpler is better for stability.
        // Let's do a simple "breathing" wave

        const cycle = 10; // seconds

        const scheduleWave = (startTime) => {
            // Rise
            gainNode.gain.linearRampToValueAtTime(0.6, startTime + (cycle / 2));
            // Fall
            gainNode.gain.linearRampToValueAtTime(0.1, startTime + cycle);
        };

        // Schedule first few waves
        for (let i = 0; i < 60; i++) { // 10 minutes of waves
            scheduleWave(t + (i * cycle));
        }
    };

    const stopOceanSound = () => {
        if (gainNodeRef.current && audioContextRef.current) {
            // Fade out
            gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 1);
            setTimeout(() => {
                if (audioContextRef.current) audioContextRef.current.close();
                audioContextRef.current = null;
            }, 1000);
        }
    };

    const toggleSound = () => {
        if (isMuted || !audioContextRef.current) {
            // Unmute / Start
            startOceanSound();
        } else {
            // Mute / Stop
            stopOceanSound();
            setIsMuted(true);
        }
    };

    // Auto-start check (often blocked, but worth a try)
    useEffect(() => {
        // We default to Muted state so user MUST interact to start sound
        // This avoids the browser warning and "broken" feel.
        setIsMuted(true);

        return () => stopOceanSound();
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
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
