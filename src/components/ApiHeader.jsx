import React from 'react';
import { Sun, Moon, RefreshCw, Upload, Download } from 'lucide-react'; 
import sapLogo from '../assets/sap-logo.png';

export default function ApiHeader({ 
  theme, 
  toggleTheme, 
  activeTab, 
  setActiveTab, 
  tabs,
}) {

  const isFunctionEmpty = (fn) => {
    if (typeof fn !== 'function') return true;
    
    // Strip whitespace, arrow functions, and braces to check for executable code
    const body = fn
      .toString()
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // Remove comments
      .replace(/\s/g, '');                     // Remove whitespace

    return body.includes('{}') || body.endsWith('=>{}');
  };

  return (
    <header className="sr-header-wrapper">
      {/* Top Bar: Title & Global Actions */}
      <div className="sr-header">
        <div className="sr-header-brand">
          <img src={sapLogo} alt="SAP logo" className="sr-icon" style={{ objectFit: 'cover', width: '100px', height: '50px' }} />
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