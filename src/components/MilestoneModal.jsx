import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import AlienScene from './AlienScene';
import './MilestoneModal.css';

const MilestoneModal = ({ type, data, onClose }) => {
    const [interacted, setInteracted] = useState(false);

    useEffect(() => {
        // Trigger Confetti on Mount
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="milestone-overlay">
            <div className={`milestone-container ${interacted ? 'expanded' : ''}`}>
                <div className="milestone-header">
                    <h2>{type === 'alien' ? 'OMNITRIX UPDATE' : 'MENTAL FORTITUDE'}</h2>
                    <p>{type === 'alien' ? 'New DNA Sequence Unlocked' : 'Discipline Protocol Loaded'}</p>
                </div>

                <div className="milestone-content">
                    {type === 'alien' && (
                        <div className="alien-showcase-interactive">
                            {/* TRUE 3D VIEWER */}
                            <div className="scene-wrapper">
                                <AlienScene
                                    image={data.img}
                                    onInteract={() => setInteracted(true)}
                                />
                            </div>

                            {/* REVEAL PANEL */}
                            <div className={`alien-reveal ${interacted ? 'visible' : ''}`}>
                                <h3>{data.name}</h3>
                                <div className="stats-panel">
                                    <div className="stat-bars">
                                        <div className="stat-row"><span>PWR</span><div className="bar"><div style={{ width: '90%' }}></div></div></div>
                                        <div className="stat-row"><span>DEF</span><div className="bar"><div style={{ width: '70%' }}></div></div></div>
                                        <div className="stat-row"><span>SPD</span><div className="bar"><div style={{ width: '60%' }}></div></div></div>
                                    </div>
                                </div>
                                <p className="alien-quote">"{data.quote}"</p>

                                <button className="btn-collect" onClick={onClose} style={{ marginTop: '20px', width: '100%' }}>
                                    INTEGRATE DNA
                                </button>
                            </div>
                        </div>
                    )}

                    {type === 'video' && (
                        <div className="video-wrapper">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${data.videoId}?autoplay=1&controls=0&modestbranding=1`}
                                title="Milestone Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
                </div>

                {type === 'video' && (
                    <button className="btn-collect" onClick={onClose}>
                        PROTOCOL COMPLETE
                    </button>
                )}
            </div>
        </div>
    );
};

export default MilestoneModal;
