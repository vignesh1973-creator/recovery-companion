import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import Countdown from './components/Countdown';
import useProgress from './hooks/useProgress';
import './App.css';
import './components/Skeleton.css';

function App() {
  const { progress, saveDay, streak, targetDate } = useProgress();
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate premium "boot up" time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
  };

  if (loading) {
    return (
      <div className="app-container">
        <header className="app-header">
          <div className="skeleton skeleton-header"></div>
        </header>
        <main>
          <div className="skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton skeleton-month"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Recovery Companion</h1>
        <Countdown targetDate={targetDate} />
      </header>

      <main>
        <Calendar />
      </main>

      <footer className="app-footer">
        <p>Built for a friend. Feb 1 - Aug 1 Challenge.</p>
      </footer>
    </div>
  );
}

export default App;

