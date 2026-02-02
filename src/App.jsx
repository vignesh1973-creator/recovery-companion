import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import Countdown from './components/Countdown';
import CheckInModal from './components/CheckInModal';
import Sanctuary from './components/Sanctuary';
import PanicButton from './components/PanicButton';
import { useProgress } from './hooks/useProgress';
import MilestoneModal from './components/MilestoneModal';
import { MILESTONES } from './data/milestones';
import './App.css';
import './components/Skeleton.css';

function App() {
  const { progress, saveDay, streak, targetDate } = useProgress();
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [milestoneData, setMilestoneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'sanctuary'

  // Check Milestones
  useEffect(() => {
    if (streak > 0) {
      // Find if current streak matches a milestone
      const milestone = MILESTONES.find(m => m.day === streak);

      if (milestone) {
        // Check if already seen using LocalStorage
        const seenKey = `milestone_seen_${streak}`;
        const hasSeen = localStorage.getItem(seenKey);

        if (!hasSeen) {
          // Unlock!
          setMilestoneData(milestone);
          localStorage.setItem(seenKey, 'true');
        }
      }
    }
  }, [streak]);

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

  // Save logic helper
  const handleSaveDay = (date, status, journal) => {
    saveDay(date, status, journal);
    handleCloseModal();
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

  // Get data for selected date (if any)
  const selectedDateData = selectedDate ? progress[selectedDate.toISOString().split('T')[0]] : null;

  return (
    <div className="app-container">
      <header className="app-header">
        <PanicButton />
        <h1>Recovery Companion</h1>
        <Countdown targetDate={targetDate} />
      </header>

      <main style={{ paddingBottom: '80px' }}>
        {activeTab === 'calendar' ? (
          <Calendar
            progress={progress}
            streak={streak}
            targetDate={targetDate}
            onDateClick={handleDateClick}
          />
        ) : (
          <Sanctuary />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <span className="nav-icon">📅</span>
          <span className="nav-label">Tracker</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'sanctuary' ? 'active' : ''}`}
          onClick={() => setActiveTab('sanctuary')}
        >
          <span className="nav-icon">🎧</span>
          <span className="nav-label">Sanctuary</span>
        </button>
      </nav>

      {selectedDate && (
        <CheckInModal
          date={selectedDate}
          existingData={selectedDateData}
          onClose={handleCloseModal}
          onSave={handleSaveDay}
        />
      )}

      {milestoneData && (
        <MilestoneModal
          type={milestoneData.type}
          data={milestoneData}
          onClose={() => setMilestoneData(null)}
        />
      )}
    </div>
  );
}

export default App;

