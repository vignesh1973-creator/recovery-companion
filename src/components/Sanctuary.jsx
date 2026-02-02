import React, { useState, useRef, useEffect } from 'react';
import './Sanctuary.css';
import { audioLibrary } from '../data/audio';

const Sanctuary = () => {
    const [activeCategory, setActiveCategory] = useState(audioLibrary[0].category);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(new Audio());

    const categoryData = audioLibrary.find(c => c.category === activeCategory);

    useEffect(() => {
        // Setup audio listeners
        const audio = audioRef.current;

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
            audio.pause(); // Cleanup on unmount
        };
    }, []);

    const playTrack = (track) => {
        if (currentTrack?.id === track.id) {
            togglePlay();
            return;
        }

        const audio = audioRef.current;
        audio.src = track.src;
        audio.play().then(() => {
            setIsPlaying(true);
            setCurrentTrack(track);

            // Media Session API for Lock Screen Controls
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: track.title,
                    artist: track.artist,
                    album: activeCategory,
                    artwork: [{ src: '/favicon.svg', sizes: '96x96', type: 'image/svg+xml' }]
                });

                navigator.mediaSession.setActionHandler('play', () => { audio.play(); setIsPlaying(true); });
                navigator.mediaSession.setActionHandler('pause', () => { audio.pause(); setIsPlaying(false); });
            }

        }).catch(e => console.error("Playback failed", e));
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e) => {
        const audio = audioRef.current;
        const seekTime = (e.target.value / 100) * audio.duration;
        audio.currentTime = seekTime;
        setProgress(e.target.value);
    };

    return (
        <div className="sanctuary-container">
            <div className="category-scroll">
                {audioLibrary.map((cat) => (
                    <button
                        key={cat.category}
                        className={`cat-pill ${activeCategory === cat.category ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.category)}
                    >
                        {cat.category}
                    </button>
                ))}
            </div>

            <div className="track-list">
                {categoryData.tracks.map((track) => (
                    <div
                        key={track.id}
                        className={`track-item ${currentTrack?.id === track.id ? 'playing' : ''}`}
                        onClick={() => playTrack(track)}
                    >
                        <div className="track-icon">
                            {currentTrack?.id === track.id && isPlaying ? '⏸' : '▶'}
                        </div>
                        <div className="track-info">
                            <h3>{track.title}</h3>
                            <p>{track.artist}</p>
                        </div>
                    </div>
                ))}
            </div>

            {currentTrack && (
                <div className="player-bar">
                    <div className="player-info">
                        <h4>{currentTrack.title}</h4>
                        <p>{currentTrack.artist}</p>
                    </div>
                    <div className="player-controls">
                        <button className="play-btn" onClick={togglePlay}>
                            {isPlaying ? '⏸' : '▶'}
                        </button>
                    </div>
                    <input
                        type="range"
                        className="seek-slider"
                        value={progress}
                        onChange={handleSeek}
                        min="0"
                        max="100"
                    />
                </div>
            )}
        </div>
    );
};

export default Sanctuary;
