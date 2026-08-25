import React, { useState, useEffect } from 'react';
import ApiHeader from '../components/ApiHeader';
import { Navigate } from 'react-router-dom';
import CandidateApplicationStoryboard from '../scenarios/CandidateApplicationStoryboard';
import SuccessFactorsHandoffStoryboard from '../scenarios/SuccessFactorsHandoffStoryboard';
import GoogleSheetImportStoryBoard from '../scenarios/GoogleSheetImportStoryboard';
import WebhookSubscriptionStoryboard from '../scenarios/WebhookSubscriptionStoryboard';
import { storageService } from '../builder/StorageService';
import '../index.css';

export default function ApiStoryboardApp({ startingTab = 'candidate-app' }) {
  // Theme state  
  const [theme, setTheme] = useState(() => localStorage.getItem('sr-theme') || 'dark');
  
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState(startingTab);
  
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

  const checkStartTabExist = () => { // update logic later
    const validTabs = ['candidate-app', 'hired-webhook', 'gsheet-import', 'webhook-subscription', 'empty-tab'];
    return validTabs.includes(startingTab);
  };

  if (!checkStartTabExist()) {
    return (
      <Navigate to="/builder" replace />
    );
  }

  return (
    <div className="sr-app-container">
      <ApiHeader
        theme={theme}
        toggleTheme={toggleTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={TABS}
      />

      {/* Dynamic Storyboard Content Loader */}
      <main className="sr-content-area">
        {activeTab === 'candidate-app' && (
          <CandidateApplicationStoryboard key={resetKey} onReset={handleReset} />
        )}

        {activeTab === 'hired-webhook' && (
          <SuccessFactorsHandoffStoryboard key={resetKey} onReset={handleReset} />
        )}

        {activeTab === 'gsheet-import' && (
          <GoogleSheetImportStoryBoard key={resetKey} onReset={handleReset} />
        )}

        {activeTab === 'webhook-subscription' && (
          <WebhookSubscriptionStoryboard key={resetKey} onReset={handleReset} />
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