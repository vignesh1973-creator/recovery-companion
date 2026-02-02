import React, { useState, useEffect, useRef } from 'react';
import './PanicButton.css';

const MAX_FLARES = 3;
const DISTRACTION_VIDEOS = [
    'j5a0jTc9S10', // Cute cat
    'qC5KtatMcUw', // Satisfying slime
    'S5AnWzjVtWY', // Nature relaxation
    '5Peo-ivmupE'  // Funny animals
];

const PanicButton = () => {
    const [active, setActive] = useState(false);
    const [phase, setPhase] = useState('idle'); // idle -> breathing -> distraction
    const [flaresLeft, setFlaresLeft] = useState(MAX_FLARES);
    const [breathText, setBreathText] = useState('Ready');
    const [currentVideo, setCurrentVideo] = useState(null);

    // Load Flare Count
    useEffect(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const storedMonth = localStorage.getItem('flare_month');

        // Reset if new month
        if (storedMonth && parseInt(storedMonth) !== currentMonth) {
            localStorage.setItem('flare_count', MAX_FLARES);
            localStorage.setItem('flare_month', currentMonth);
            setFlaresLeft(MAX_FLARES);
        } else {
            const storedCount = localStorage.getItem('flare_count');
            if (storedCount) setFlaresLeft(parseInt(storedCount));
            else {
                localStorage.setItem('flare_count', MAX_FLARES);
                localStorage.setItem('flare_month', currentMonth);
            }
        }
    }, []);

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8; // Slow and calming
            utterance.pitch = 0.8; // Deeper
            window.speechSynthesis.speak(utterance);
        }
    };

    const handlePanic = () => {
        if (flaresLeft <= 0) {
            alert("You have used all your Emergency Flares for this month. Stay strong.");
            return;
        }

        if (window.confirm("Use an Emergency Flare? This will force a 60s reset.")) {
            // Deduct Flare
            const newCount = flaresLeft - 1;
            setFlaresLeft(newCount);
            localStorage.setItem('flare_count', newCount);

            setActive(true);
            startBreathing();
        }
    };

    const startBreathing = () => {
        setPhase('breathing');
        let cycle = 0;

        const breathCycle = () => {
            if (cycle >= 3) { // 3 cycles of ~8 seconds = ~24s (shortened for UX)
                startDistraction();
                return;
            }

            // Inhale
            setBreathText("Breathe In...");
            speak("Breathe In");

            setTimeout(() => {
                // Hold
                setBreathText("Hold...");

                setTimeout(() => {
                    // Exhale
                    setBreathText("Breathe Out...");
                    speak("Breathe Out");

                    setTimeout(() => {
                        cycle++;
                        breathCycle();
                    }, 4000); // Exhale time
                }, 2000); // Hold time
            }, 4000); // Inhale time
        };

        breathCycle();
    };

    const startDistraction = () => {
        setPhase('distraction');
        const randomVid = DISTRACTION_VIDEOS[Math.floor(Math.random() * DISTRACTION_VIDEOS.length)];
        setCurrentVideo(randomVid);
    };

    const closePanic = () => {
        setActive(false);
        setPhase('idle');
        window.speechSynthesis.cancel();
    };

    return (
        <>
            <button className="btn-panic" onClick={handlePanic}>
                🚨 {flaresLeft}
            </button>

            {active && (
                <div className="panic-overlay">
                    {phase === 'breathing' && (
                        <div className="breath-container">
                            <div className={`breath-circle ${breathText.includes('In') ? 'expand' : 'contract'}`}></div>
                            <h2>{breathText}</h2>
                            <p>Center your mind.</p>
                        </div>
                    )}

                    {phase === 'distraction' && (
                        <div className="distraction-container">
                            <h2>Mental Reset</h2>
                            <div className="video-wrapper">
                                <iframe
                                    width="100%"
                                    height="315"
                                    src={`https://www.youtube.com/embed/${currentVideo}?autoplay=1&controls=0`}
                                    title="Distraction"
                                    frameBorder="0"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <button className="btn-primary" onClick={closePanic}>I am in control now</button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default PanicButton;
