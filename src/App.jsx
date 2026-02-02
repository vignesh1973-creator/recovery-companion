import React from 'react';
import Calendar from './components/Calendar';
import Countdown from './components/Countdown';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Recovery Companion</h1>
        <Countdown />
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

