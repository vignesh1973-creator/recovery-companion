import React, { useState, useEffect } from 'react';
import './PanicButton.css';
import UrgeSurfer from './UrgeSurfer';

const PanicButton = ({ flares, onPanic, reasons = [], urgeSurfs, onIncrementSurf, onOpenWallet }) => {
    const [active, setActive] = useState(false);
    const [phase, setPhase] = useState('idle'); // idle -> wallet -> breathing -> distraction
    const [breathText, setBreathText] = useState('Ready');
    const [currentVideo, setCurrentVideo] = useState(null);
    const [walletIndex, setWalletIndex] = useState(0);
    const [showSurfer, setShowSurfer] = useState(false);

    const DISTRACTION_VIDEOS = [
        'q2n3pD8F9_A', // Tamil Love Melodies
        'Nswk922_c9U', // Soothing & Feel-Good
        's3e2v2Q0_E0', // Feel Good Songs
        'q8z1t0pW1Y0', // Tamil Melody Songs
        'UnYa3Rc2WvA', // AR Rahman Hits
        'PRw4XPKoaDE'  // Ilayaraja Melodies
    ];

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8; // Slow and calming
            utterance.pitch = 0.8; // Deeper
            window.speechSynthesis.speak(utterance);
        }
    };

    const handlePanicClick = () => {
        if (flares <= 0) {
            alert("You have used all your Emergency Flares for this month. Stay strong.");
            return;
        }

        // Logic: If reasons exist, show wallet FIRST
        if (reasons && reasons.length > 0) {
            setActive(true);
            setPhase('wallet');
            setWalletIndex(0);
        } else {
            // No reasons? Go straight to confirm
            confirmPanic();
        }
    };

    const confirmPanic = () => {
        if (window.confirm("Use an Emergency Flare? This will force a 60s reset.")) {
            onPanic(); // Deduct flare
            setActive(true); // Ensure active is true if coming from confirm directly
            startBreathing();
        } else {
            closePanic();
        }
    };

    const nextWalletCard = () => {
        if (walletIndex < reasons.length - 1) {
            setWalletIndex(walletIndex + 1);
        } else {
            // End of wallet, ask for panic
            confirmPanic();
        }
    };

    const startBreathing = () => {
        setPhase('breathing');
        let cycle = 0;

        const breathCycle = () => {
            if (cycle >= 3) {
                startDistraction();
                return;
            }

            setBreathText("Breathe In...");
            speak("Breathe In");

            setTimeout(() => {
                setBreathText("Hold...");
                setTimeout(() => {
                    setBreathText("Breathe Out...");
                    speak("Breathe Out");
                    setTimeout(() => {
                        cycle++;
                        breathCycle();
                    }, 4000);
                }, 2000);
            }, 4000);
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

    const handleSurfComplete = () => {
        onIncrementSurf();
        alert("🌊 Wave Surfed! You rode out the urge. Well done.");
        setShowSurfer(false);
    };

    return (
        <>
            <div className="panic-controls">
                {/* Wallet Button - Moved here */}
                <button className="btn-wallet-ctrl" onClick={onOpenWallet} title="Reason Wallet">
                    ❤️
                </button>

                {/* Surf Button */}
                <button className="btn-surf" onClick={() => setShowSurfer(true)}>
                    🌊
                </button>

                {/* Panic Button */}
                <button className="btn-panic" onClick={handlePanicClick}>
                    🚨 {flares}
                </button>
            </div>

            {/* URGE SURFER OVERLAY */}
            {showSurfer && (
                <UrgeSurfer
                    onComplete={handleSurfComplete}
                    onCancel={() => setShowSurfer(false)}
                />
            )}

            {/* PANIC OVERLAY */}
            {active && (
                <div className="panic-overlay">

                    {/* WALLET PHASE */}
                    {phase === 'wallet' && (
                        <div className="wallet-flash-container">
                            <h2>Remember Why.</h2>
                            <div className="flash-card">
                                "{reasons[walletIndex]}"
                            </div>
                            <div className="flash-actions">
                                <button className="btn-secondary" onClick={closePanic}>I'm Good Now</button>
                                <button className="btn-primary" onClick={nextWalletCard}>
                                    {walletIndex < reasons.length - 1 ? 'Next Reason' : 'I Still Need Help'}
                                </button>
                            </div>
                        </div>
                    )}

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
