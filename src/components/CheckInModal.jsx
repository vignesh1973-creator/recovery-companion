import React, { useState, useEffect } from 'react';
import './CheckInModal.css';
import { fetchReward } from '../services/api';
import { motivationalVideos } from '../data/videos';
import confetti from 'canvas-confetti';

const CheckInModal = ({ date, onClose, onSave }) => {
    const [journal, setJournal] = useState('');
    const [step, setStep] = useState('loading'); // loading -> locked -> question -> journal -> reward -> video
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hoursLeft, setHoursLeft] = useState(0);

    useEffect(() => {
        checkTimeAndLoad();
    }, [date]);

    const checkTimeAndLoad = async () => {
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const currentHour = now.getHours();
        const targetHour = 21; // 9 PM

        // If it's today and before 9 PM, show Locked state + Daily Armor
        if (isToday && currentHour < targetHour) {
            setHoursLeft(targetHour - currentHour);
            await loadDailyArmor();
            setStep('locked');
        } else {
            // It's past 9 PM or a past date -> Allow check-in
            setStep('question');
        }
    };

    const loadDailyArmor = async () => {
        try {
            // Fetch a quote for motivation (Daily Armor)
            const type = Math.random() > 0.5 ? 'bible' : 'motivational';
            const quote = await fetchReward(type);
            setSelectedQuote(quote);
        } catch (e) {
            console.error(e);
        }
    };

    const handleResponse = (success) => {
        if (success) {
            setStep('journal');
        } else {
            // Don't save yet, encourage them first
            setStep('fail_confirm');
        }
    };

    const confirmFail = () => {
        onSave(date, 'fail', 'Relapsed.');
        onClose();
    };

    const handleSubmitJournal = async () => {
        setLoading(true);
        try {
            // Trigger confetti
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#fbbf24', '#ffffff', '#22c55e']
            });

            const type = Math.random() > 0.5 ? 'bible' : 'motivational';
            const quote = await fetchReward(type);
            setSelectedQuote(quote);

            onSave(date, 'success', journal);
            setStep('reward');
        } catch (e) {
            console.error(e);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleWatchVideo = () => {
        const randomVideo = motivationalVideos[Math.floor(Math.random() * motivationalVideos.length)];
        setCurrentVideo(randomVideo);
        setStep('video');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}>&times;</button>

                {step === 'loading' && <p>Loading...</p>}

                {step === 'fail_confirm' && (
                    <div className="step-fail">
                        <h2>Don't Give Up.</h2>
                        <p className="subtext">A slip is not the end. It's a lesson.</p>
                        <div className="quote-card fail-card">
                            <p className="quote-text">"Failure is simply the opportunity to begin again, this time more intelligently."</p>
                        </div>
                        <button className="btn-fail" onClick={confirmFail}>Mark Day as Failed</button>
                        <button className="btn-secondary" onClick={() => setStep('question')}>Wait, I want to rethink</button>
                    </div>
                )}

                {step === 'locked' && (
                    <div className="step-locked">
                        <h2>⚔️ Daily Armor ⚔️</h2>
                        <p className="locked-sub">The battlefield isn't ready. Hold the line until 9 PM.</p>

                        {selectedQuote && (
                            <div className="quote-card armor-card">
                                <p className="quote-text">"{selectedQuote.text}"</p>
                                <p className="quote-author">- {selectedQuote.author}</p>
                            </div>
                        )}

                        <div className="countdown-box">
                            <span className="scary-text">RETURN IN</span>
                            <span className="big-number">{hoursLeft}</span>
                            <span className="scary-text">HOURS TO REPORT NO CLAP</span>
                        </div>

                        <button className="btn-primary" onClick={onClose}>I Will Hold The Line</button>
                    </div>
                )}

                {step === 'question' && (
                    <div className="step-question">
                        <h2>Day Check-In</h2>
                        <p>{new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <p className="question-text">Did you hold the line today?</p>
                        <div className="actions">
                            <button className="btn-success" onClick={() => handleResponse(true)}>Yes, I did.</button>
                            <button className="btn-fail" onClick={() => handleResponse(false)}>No, I slipped.</button>
                        </div>
                    </div>
                )}

                {step === 'journal' && (
                    <div className="step-journal">
                        <h2>Journal</h2>
                        <p className="subtext">Briefly, what worked for you today?</p>
                        <textarea
                            autoFocus
                            value={journal}
                            onChange={(e) => setJournal(e.target.value)}
                            placeholder="I stayed busy, I prayed, I avoided triggers..."
                        />
                        <button
                            className="btn-primary"
                            onClick={handleSubmitJournal}
                            disabled={loading}
                        >
                            {loading ? 'Receiving...' : 'Complete Day'}
                        </button>
                    </div>
                )}

                {step === 'reward' && (
                    <div className="step-reward">
                        <h2>Day Complete</h2>
                        <div className="quote-card">
                            <p className="quote-text">"{selectedQuote.text}"</p>
                            <p className="quote-author">- {selectedQuote.author}</p>
                        </div>
                        <div className="reward-actions">
                            <button className="btn-secondary" onClick={handleWatchVideo}>Watch Motivation</button>
                            <button className="btn-primary" onClick={onClose}>Done</button>
                        </div>
                    </div>
                )}

                {step === 'video' && (
                    <div className="step-video">
                        <h2>Motivation Boost</h2>
                        <div className="video-wrapper">
                            <iframe
                                width="100%"
                                height="315"
                                src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&rel=0`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <button className="btn-primary" onClick={onClose}>Done</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckInModal;
