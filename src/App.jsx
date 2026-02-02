import React, { useState } from 'react';
import Calendar from './components/Calendar';
import Countdown from './components/Countdown';
import useProgress from './hooks/useProgress'; // Assuming useProgress is in this path
import './App.css';

function App() {
  const { progress, saveDay, streak, targetDate } = useProgress();
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
  };

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

