import React, { useState, useEffect } from 'react';
import ApiHeader from './ApiHeader';
import CandidateApplicationStoryboard from '../scenarios/CandidateApplicationStoryboard';
import SuccessFactorsHandoffStoryboard from '../scenarios/SuccessFactorsHandoffStoryboard';
import '../index.css';

export default function ApiStoryboardApp() {
  // Theme state  
  const [theme, setTheme] = useState(() => localStorage.getItem('sr-theme') || 'dark');
  
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState('candidate-app');
  
  // Reset trigger key (changing key forces child component to remount/reset)
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sr-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleReset = () => {
    setResetKey((prev) => prev + 1);
  };

  // List of story board tabs you plan to build
  const TABS = [
    { id: 'candidate-app', number: '01', label: 'Candidate Application' },
    { id: 'hired-webhook', number: '02', label: 'SuccessFactors Handoff' },
    { id: 'self-scheduling', number: '03', label: 'Auto Self-Scheduling' }
  ];

  return (
    <div className="sr-app-container">
      <ApiHeader
        theme={theme}
        toggleTheme={toggleTheme}
        onReset={handleReset}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={TABS}
      />

      {/* Dynamic Storyboard Content Loader */}
      <main className="sr-content-area">
        {activeTab === 'candidate-app' && (
          <CandidateApplicationStoryboard key={resetKey} />
        )}

        {activeTab === 'hired-webhook' && (
          <SuccessFactorsHandoffStoryboard key={resetKey} />
        )}

        {activeTab === 'self-scheduling' && (
          <div className="sr-empty-state-tab">
            <h2>Auto Self-Scheduling Scenario</h2>
            <p>Ready to build: Real-time calendar availability lookup & booking API workflow.</p>
          </div>
        )}
      </main>
    </div>
  );
}