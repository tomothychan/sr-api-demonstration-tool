import React, { useState, useEffect } from 'react';
import { Sun, Moon, RefreshCw, Upload, Download, Eye, EyeOff, Layers } from 'lucide-react'; 
import sapLogo from '../assets/sap-logo.png';

export default function ApiHeader({ 
  theme, 
  toggleTheme, 
  activeTab, 
  setActiveTab, 
  tabs,
  goToShowcase,
  goToBuilder
}) {
  // LocalStorage state for White-Label / Branding Mode
  const [isWhiteLabeled, setIsWhiteLabeled] = useState(() => {
    return localStorage.getItem('sr-white-label') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sr-white-label', isWhiteLabeled);
  }, [isWhiteLabeled]);

  const toggleWhiteLabel = () => {
    setIsWhiteLabeled((prev) => !prev);
  };

  return (
    <header className="sr-header-wrapper">
      {/* Top Bar: Title & Global Actions */}
      <div className="sr-header">
        <div className="sr-header-brand">
          {!isWhiteLabeled ? (
            <img 
              src={sapLogo} 
              alt="SAP logo" 
              className="sr-icon" 
              style={{ objectFit: 'cover', width: '100px', height: '50px' }} 
            />
          ) : (
            <div 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '8px', 
                backgroundColor: 'var(--sr-color-primary-light, rgba(11, 102, 228, 0.15))', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--sr-color-primary, #0b66e4)'
              }}
            >
              <Layers size={22} />
            </div>
          )}

          <div>
            <h1 className="sr-header-title">
              {isWhiteLabeled ? 'Enterprise API Storyboard' : 'SmartRecruiters API Storyboard'}
            </h1>
            <p className="sr-header-subtitle">
              {isWhiteLabeled ? 'Integration Demonstration Portal' : 'Executive Demonstration Portal'}
            </p>
          </div>
        </div>

        <div className="sr-header-actions">
          {/* White-Label Toggle Button */}
          <button 
            onClick={toggleWhiteLabel} 
            className="sr-btn sr-btn-secondary"
            title="Toggle Branding / White-Label Mode"
          >
            {isWhiteLabeled ? (
              <>
                <Eye className="sr-icon-sm" />
                <span>Show Branding</span>
              </>
            ) : (
              <>
                <EyeOff className="sr-icon-sm" />
                <span>White-Label</span>
              </>
            )}
          </button>

          {/* Theme Switcher Button */}
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

          {goToShowcase && (
            <button 
              type="button"
              onClick={() => {
                const baseUrl = import.meta.env.BASE_URL || '/';
                const targetUrl = new URL(baseUrl, window.location.origin).href;
                window.location.href = targetUrl;
              }}
              className="sr-btn sr-btn-primary"
              title="Go to Showcase"
            >
              <Upload className="sr-icon-sm" />
              <span>Showcase your Scenarios!</span>
            </button>
          )}

          {goToBuilder && (
            <button 
              type="button"
              onClick={() => {
                const baseUrl = import.meta.env.BASE_URL || '/';
                const targetUrl = new URL(`${baseUrl}builder`.replace(/\/+/g, '/'), window.location.origin).href;
                window.location.href = targetUrl;
              }}
              className="sr-btn sr-btn-primary"
              title="Go to Builder"
            >
              <Download className="sr-icon-sm" />
              <span>Build your Scenarios!</span>
            </button>
          )}
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