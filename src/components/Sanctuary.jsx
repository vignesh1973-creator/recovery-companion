import React, { useState } from 'react';
import './Sanctuary.css';
import { audioLibrary } from '../data/audio';

const Sanctuary = () => {
  const [activeCategory, setActiveCategory] = useState(audioLibrary[0].category);
  const categoryData = audioLibrary.find(c => c.category === activeCategory);

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

      <div className="spotify-grid">
        {categoryData && categoryData.playlists.map((item) => (
          <div key={item.id} className="spotify-card">
            <h3>{item.title}</h3>

            {/* Spotify Embed */}
            <iframe
              style={{ borderRadius: '12px' }}
              src={item.embedUrl}
              width="100%"
              height="152"
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>

            {/* Deep Link Button (For Pocket Mode) */}
            <a href={item.deepLink} className="btn-spotify">
              Open App (For Pocket Mode) ↗
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sanctuary;
