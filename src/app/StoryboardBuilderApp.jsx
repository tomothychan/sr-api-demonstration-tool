import React, { useState, useEffect } from 'react';
import ApiHeader from '../components/ApiHeader';
import { Upload, Download } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import '../index.css';

export default function StoryboardBuilderApp() {
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
    { id: 'home', number: '', label: 'Home' },
    { id: 'edit', number: '01', label: 'Edit Scenario' },
    { id: 'browse', number: '02', label: 'Browse Saved Scenarios' },
  ];

  // import and export function
  const handleImport = () => {
    
  }
  const handleExport = () => {
    const data = "hello";
  };

  return (
    <div className="sr-app-container">
      <ApiHeader
        theme={theme}
        toggleTheme={toggleTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={TABS}
        onImport={handleImport}
        onExport={handleExport}
      />

      {/* Dynamic Storyboard Content Loader */}
      <main className="sr-content-area">
        {/* Go back to the Home Page */}
        {activeTab === 'home' && (
          <Navigate to="/" replace />
        )}

        {activeTab === 'edit' && (
          <h1>Edit App</h1>
        )}

        {activeTab === 'browse' && (
          <div className="sr-empty-state-tab">
            <h2>Empty Tab</h2>
            <p>Ready to build: A new scenario of your own!</p>
          </div>
        )}
      </main>
    </div>
  );
}