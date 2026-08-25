import React, { useState, useEffect, useRef } from 'react';
import ApiHeader from '../components/ApiHeader';
import { useNavigate } from 'react-router-dom';
import CandidateApplicationStoryboard from '../scenarios/CandidateApplicationStoryboard';
import SuccessFactorsHandoffStoryboard from '../scenarios/SuccessFactorsHandoffStoryboard';
import GoogleSheetImportStoryBoard from '../scenarios/GoogleSheetImportStoryboard';
import WebhookSubscriptionStoryboard from '../scenarios/WebhookSubscriptionStoryboard';
import SimulationTab from '../builder/SimulationTab';
import { storageService } from '../builder/StorageService';
import '../index.css';

// Built-in JSX Scenario definitions
const DEFAULT_JSX_SCENARIOS = [
  { 
    id: 'candidate-app', 
    label: 'Candidate Application',
    aliases: ['candidate-app']
  },
  { 
    id: 'hired-webhook', 
    label: 'SuccessFactors Handoff',
    aliases: ['hired-webhook', 'successfactors', 'successfactors-handoff']
  },
  { 
    id: 'gsheet-import', 
    label: 'Google Sheet Batch Sourcing',
    aliases: ['gsheet-import', 'google-sheets', 'google-sheets-sourcing']
  },
  { 
    id: 'webhook-subscription', 
    label: 'Webhook & Automated Screening',
    aliases: ['webhook-subscription', 'webhook-sub']
  }
];

// Inline Dropdown component for overflow tabs
function OverflowDropdown({ overflowTabs, activeTab, onSelectTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeOverflowItem = overflowTabs.find((t) => t.id === activeTab);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      ref={dropdownRef} 
      onClick={(e) => e.stopPropagation()} 
      onMouseDown={(e) => e.stopPropagation()}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <div 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          cursor: 'pointer',
          fontWeight: activeOverflowItem ? 600 : 500,
          color: activeOverflowItem ? 'var(--sr-color-primary, #3b82f6)' : 'inherit'
        }}
      >
        <span style={{ whiteSpace: 'nowrap' }}>
          {activeOverflowItem ? (activeOverflowItem.labelRaw || activeOverflowItem.label) : `More (${overflowTabs.length})`}
        </span>
        <span style={{ fontSize: '0.7rem' }}>▼</span>
      </div>

      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '120%',
            right: 0,
            backgroundColor: 'var(--sr-color-bg-surface, #1e293b)',
            border: '1px solid var(--sr-color-border, #334155)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 1000,
            minWidth: '200px',
            overflow: 'hidden',
            padding: '0.35rem 0'
          }}
        >
          {overflowTabs.map((t) => {
            const isActive = t.id === activeTab;
            return (
              <div
                key={t.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectTab(t.id);
                  setIsOpen(false);
                }}
                style={{
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--sr-color-primary-light, rgba(59,130,246,0.15))' : 'transparent',
                  color: isActive ? 'var(--sr-color-primary, #3b82f6)' : 'var(--sr-color-text-main, #f8fafc)',
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: 'nowrap'
                }}
              >
                {t.labelRaw || t.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ApiStoryboardApp({ startingTab = 'candidate-app' }) {
  const navigate = useNavigate();

  // Theme state  
  const [theme, setTheme] = useState(() => localStorage.getItem('sr-theme') || 'dark');
  
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState(startingTab);
  const [resetKey, setResetKey] = useState(0);

  // Dynamic Tab State
  const [showcaseTabs, setShowcaseTabs] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Responsive window width tracking for overflow calculation
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sr-theme', theme);
  }, [theme]);

  // Load scenarios from storageService and construct dynamic tab list
  useEffect(() => {
    const loadDynamicTabs = async () => {
      setIsLoaded(false);
      const showcaseIds = await storageService.getShowcasePanelScenarios();
      const allCustomScenarios = await storageService.getAllScenarios();

      const constructedTabs = [];
      let count = 1;

      // 1. Check Built-in JSX Scenarios
      DEFAULT_JSX_SCENARIOS.forEach((builtIn) => {
        const isSelected = showcaseIds.some((id) => builtIn.aliases.includes(id));
        if (isSelected) {
          constructedTabs.push({
            id: builtIn.id,
            number: String(count).padStart(2, '0'),
            labelRaw: builtIn.label,
            isCustom: false
          });
          count++;
        }
      });

      // 2. Check Custom JSON Scenarios
      allCustomScenarios.forEach((sc) => {
        if (showcaseIds.includes(sc.id)) {
          constructedTabs.push({
            id: sc.id,
            number: String(count).padStart(2, '0'),
            labelRaw: sc.name || 'Custom Scenario',
            isCustom: true
          });
          count++;
        }
      });

      setShowcaseTabs(constructedTabs);

      // Tab selection fallback logic
      if (constructedTabs.length > 0) {
        const exists = constructedTabs.some((t) => t.id === activeTab);
        if (!exists) {
          const firstTabId = constructedTabs[0].id;
          setActiveTab(firstTabId);
          storageService.setActiveSimulatingScenarioId(firstTabId);
        }
      } else {
        setActiveTab('no-scenarios');
      }

      setIsLoaded(true);
    };

    loadDynamicTabs();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleReset = () => {
    setResetKey((prev) => prev + 1);
  };

  const handleSelectTab = (tabId) => {
    if (!tabId || tabId === '__overflow_menu__') return;
    setActiveTab(tabId);
    storageService.setActiveSimulatingScenarioId(tabId);
  };

  // Calculate visible tabs vs. overflow tabs
  const maxVisibleCount = Math.max(1, Math.floor((windowWidth - 320) / 210));
  
  let formattedTabs = [];
  if (showcaseTabs.length === 0) {
    formattedTabs = [];
  } else if (showcaseTabs.length <= maxVisibleCount) {
    formattedTabs = showcaseTabs.map((t) => ({
      ...t,
      label: (
        <span style={{ flexShrink: 0, whiteSpace: 'nowrap', display: 'inline-block' }}>
          {t.labelRaw}
        </span>
      )
    }));
  } else {
    const visiblePart = showcaseTabs.slice(0, maxVisibleCount);
    const overflowPart = showcaseTabs.slice(maxVisibleCount);

    const isOverflowActive = overflowPart.some((t) => t.id === activeTab);

    const overflowTabItem = {
      id: isOverflowActive ? activeTab : '__overflow_menu__',
      number: '...',
      label: (
        <OverflowDropdown
          overflowTabs={overflowPart}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
        />
      )
    };

    formattedTabs = [
      ...visiblePart.map((t) => ({
        ...t,
        label: (
          <span style={{ flexShrink: 0, whiteSpace: 'nowrap', display: 'inline-block' }}>
            {t.labelRaw}
          </span>
        )
      })),
      overflowTabItem
    ];
  }

  const activeCustomScenario = showcaseTabs.find((t) => t.id === activeTab && t.isCustom);

  return (
    <div className="sr-app-container">
      <ApiHeader
        theme={theme}
        toggleTheme={toggleTheme}
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        tabs={formattedTabs}
        goToBuilder={true}
      />

      {/* Dynamic Storyboard Content Loader */}
      <main className="sr-content-area">
        {!isLoaded ? (
          <div className="sr-empty-state-tab">
            <p>Loading scenarios...</p>
          </div>
        ) : showcaseTabs.length === 0 || activeTab === 'no-scenarios' ? (
          <div className="sr-empty-state-tab" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--sr-color-text-main)' }}>
              Want to create your own scenarios, go to our Scenario Editor!
            </h2>
            <button 
              className="sr-btn sr-btn-primary" 
              onClick={() => navigate('/builder')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
            >
              <span>Go to Scenario Editor</span>
            </button>
          </div>
        ) : activeCustomScenario ? (
          <SimulationTab 
            key={activeTab + resetKey} 
            onNavigateToBrowser={() => navigate('/browser')} 
            handleCreateNewAndLoad={() => navigate('/builder')}
          />
        ) : (
          <>
            {activeTab === 'candidate-app' && (
              <CandidateApplicationStoryboard key={resetKey} onReset={handleReset} />
            )}

            {(activeTab === 'hired-webhook' || activeTab === 'successfactors' || activeTab === 'successfactors-handoff') && (
              <SuccessFactorsHandoffStoryboard key={resetKey} onReset={handleReset} />
            )}

            {(activeTab === 'gsheet-import' || activeTab === 'google-sheets' || activeTab === 'google-sheets-sourcing') && (
              <GoogleSheetImportStoryBoard key={resetKey} onReset={handleReset} />
            )}

            {(activeTab === 'webhook-subscription' || activeTab === 'webhook-sub') && (
              <WebhookSubscriptionStoryboard key={resetKey} onReset={handleReset} />
            )}
          </>
        )}
      </main>
    </div>
  );
}