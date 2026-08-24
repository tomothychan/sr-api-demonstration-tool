import React, { useState, useEffect } from 'react';
import ApiHeader from '../components/ApiHeader';
import CandidateApplicationStoryboard from '../scenarios/CandidateApplicationStoryboard';
import SuccessFactorsHandoffStoryboard from '../scenarios/SuccessFactorsHandoffStoryboard';
import GoogleSheetImportStoryBoard from '../scenarios/GoogleSheetImportStoryboard';
import WebhookSubscriptionStoryboard from '../scenarios/WebhookSubscriptionStoryboard';
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
    { id: 'gsheet-import', number: '03', label: 'Google Sheet Batch Sourcing' },
    { id: 'webhook-subscription', number: '04', label: 'Webhook & Automated Screening' },
    { id: 'empty-tab', number: '05', label: 'Empty Tab' }
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

        {activeTab === 'gsheet-import' && (
          <GoogleSheetImportStoryBoard key={resetKey} />
        )}

        {activeTab === 'webhook-subscription' && (
          <WebhookSubscriptionStoryboard key={resetKey} />
        )}

        {activeTab === 'empty-tab' && (
          <div className="sr-empty-state-tab">
            <h2>Empty Tab</h2>
            <p>Ready to build: A new scenario of your own!</p>
          </div>
        )}
      </main>
    </div>
  );
}