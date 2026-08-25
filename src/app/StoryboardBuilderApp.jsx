import React, { useState, useEffect } from 'react';
import { storageService } from '../builder/StorageService';
import ApiHeader from '../components/ApiHeader';
import { Upload, Download } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import BrowserTab from '../builder/BrowserTab';
import EditorTab from '../builder/EditorTab';
import SimulationTab from '../builder/SimulationTab';
import '../index.css';

export default function StoryboardBuilderApp({ startingTab = 'catalog' }) {
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

  const checkStartTabExist = () => {
    const validTabs = ['home', 'catalog', 'edit', 'simulation'];
    return validTabs.includes(startingTab);
  };

  // List of story board tabs you plan to build
  const TABS = [
    { id: 'home', number: '', label: 'Home' },
    { id: 'catalog', number: '01', label: 'Scenario Catalog' },
    { id: 'edit', number: '02', label: 'Edit Scenario' },
    { id: 'simulation', number: '03', label: 'Simulate Scenario' }
  ];
  
  const onSimulateScenario = async (scenarioId, newTab = true) => {
    // Store the selection before opening the page so the new tab can load it.
    storageService.setActiveSimulatingScenarioId(scenarioId);
    if (newTab) {
      const simulationUrl = new URL(
        'builder/simulation',
        `${window.location.origin}${import.meta.env.BASE_URL}`
      ).href;
      window.open(simulationUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    setActiveTab('simulation');
  };

  if (!checkStartTabExist()) {
    return (
      <Navigate to="/" replace />
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
        {/* Go back to the Home Page */}

        {activeTab === 'home' && (
          <Navigate to="/" replace />
        )}

        {activeTab === 'edit' && (
          <EditorTab onNavigateToBrowser={() => setActiveTab('catalog')} onSimulateScenario={onSimulateScenario} />
        )}

        {activeTab === 'catalog' && (
          <BrowserTab onEditScenario={async () => setActiveTab('edit')} onSimulateScenario={onSimulateScenario}/>
        )}

        {activeTab === 'simulation' && (
          <SimulationTab onNavigateToBrowser={() => setActiveTab('catalog')} />
        )}
      </main>
    </div>
  );
}