import React, { useState, useEffect, useRef } from 'react';
import './PanicButton.css';

const MAX_FLARES = 3;
const DISTRACTION_VIDEOS = [
    'q2n3pD8F9_A', // Tamil Love Melodies
    'Nswk922_c9U', // Soothing & Feel-Good
    's3e2v2Q0_E0', // Feel Good Songs
    'q8z1t0pW1Y0', // Tamil Melody Songs
    'UnYa3Rc2WvA', // AR Rahman Hits
    'PRw4XPKoaDE'  // Ilayaraja Melodies
];

const PanicButton = ({ flares, onPanic }) => {
    const [active, setActive] = useState(false);
    const [phase, setPhase] = useState('idle'); // idle -> breathing -> distraction
    const [breathText, setBreathText] = useState('Ready');
    const [currentVideo, setCurrentVideo] = useState(null);

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8; // Slow and calming
            utterance.pitch = 0.8; // Deeper
            window.speechSynthesis.speak(utterance);
        }
    };

    const handlePanic = () => {
        if (flares <= 0) {
            alert("You have used all your Emergency Flares for this month. Stay strong.");
            return;
        }

        if (window.confirm("Use an Emergency Flare? This will force a 60s reset.")) {
            // Deduct Flare via Prop
            onPanic();

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
                🚨 {flares}
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
