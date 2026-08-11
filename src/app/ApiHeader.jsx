import React from 'react';
import { Code2, Sun, Moon, RefreshCw } from 'lucide-react'; 

export default function ApiHeader({ 
  theme, 
  toggleTheme, 
  onReset, 
  activeTab, 
  setActiveTab, 
  tabs 
}) {
  return (
    <header className="sr-header-wrapper">
      {/* Top Bar: Title & Global Actions */}
      <div className="sr-header">
        <div className="sr-header-brand">
          <div className="sr-icon-wrapper-primary">
            <Code2 className="sr-icon" />
          </div>
          <div>
            <h1 className="sr-header-title">SmartRecruiters API Storyboard</h1>
            <p className="sr-header-subtitle">Executive Demonstration Portal</p>
          </div>
        </div>

        <div className="sr-header-actions">
          <button 
            onClick={toggleTheme} 
            className="sr-btn sr-btn-secondary"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'light' ? (
              <>
                <Moon className="sr-icon-sm" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="sr-icon-sm" />
                <span>Light Mode</span>
              </>
            )}
          </button>

          <button onClick={onReset} className="sr-btn sr-btn-secondary">
            <RefreshCw className="sr-icon-sm" />
            <span>Reset Scenario</span>
          </button>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <nav className="sr-tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`sr-tab-btn ${activeTab === tab.id ? 'sr-tab-active' : ''}`}
          >
            <span className="sr-tab-num">{tab.number}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}