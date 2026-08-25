import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Download, 
  Upload, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Search,
  Plus
} from 'lucide-react';

import { storageService } from './StorageService';
import { ScenarioModel } from './ScenarioModels';
import NotificationBanner from '../components/NotificationBanner';

// 4 Built-In Static Scenarios (JSX-based)
const BUILT_IN_SCENARIOS = [
  {
    id: 'candidate-app',
    name: 'Candidate Application Portal',
    description: 'Simulates candidate form intake, OpenAPI mapping, and email deduplication.',
    type: 'jsx',
    isBuiltIn: true
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets Batch Sourcing',
    description: 'ETL worker streaming rows from Google Sheets into OpenAPI POST payloads.',
    type: 'jsx',
    isBuiltIn: true
  },
  {
    id: 'successfactors',
    name: 'SAP SuccessFactors Handoff',
    description: 'Recruiter hire events converted to SuccessFactors OData API records.',
    type: 'jsx',
    isBuiltIn: true
  },
  {
    id: 'webhook-sub',
    name: 'Webhook & Automated Screening',
    description: 'Bidirectional webhook subscriptions with downstream DB and screening triggers.',
    type: 'jsx',
    isBuiltIn: true
  }
];

export default function BrowserTab({ onSimulateScenario, onEditScenario }) {
  const [scenarios, setScenarios] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadAllScenarios();
  }, []);

  // Load Built-In and IndexedDB Custom Scenarios + Showcase Panel IDs
  const loadAllScenarios = async () => {
    const customList = await storageService.getAllScenarios();
    const showcaseIds = await storageService.getShowcasePanelScenarios();

    const builtInWithShowcase = BUILT_IN_SCENARIOS.map((item) => ({
      ...item,
      showcaseEnabled: showcaseIds.includes(item.id)
    }));
    
    const normalizedCustom = customList.map((item) => ({
      ...item,
      type: item.type || 'json',
      isBuiltIn: false,
      showcaseEnabled: showcaseIds.includes(item.id)
    }));

    setScenarios([...builtInWithShowcase, ...normalizedCustom]);
  };

  const handleCreateNewScenario = async () => {
    const newScenario = await storageService.handleCreateNewScenario();
    await loadAllScenarios();
    if (onEditScenario) {
      onEditScenario(newScenario.id);
    }
  };

  const handleEditScenario = async (scId) => {
    await storageService.setActiveEditingScenarioId(scId);
    if (onEditScenario) {
      onEditScenario(scId);
    }
  };

  // Inline Rename Handlers
  const handleStartRename = (sc) => {
    setEditingId(sc.id);
    setEditingName(sc.name);
  };

  const handleSaveRename = async (sc) => {
    if (!editingName.trim()) return;

    if (sc.isBuiltIn) {
      setScenarios((prev) =>
        prev.map((item) => (item.id === sc.id ? { ...item, name: editingName } : item))
      );
    } else {
      const updated = { ...sc, name: editingName };
      await storageService.saveScenario(updated);
      await loadAllScenarios();
    }

    setEditingId(null);
    setNotification({ type: 'success', message: `Renamed scenario to "${editingName}"` });
  };

  // Showcase Checkbox Handler
  const handleToggleShowcase = async (sc) => {
    const newStatus = !sc.showcaseEnabled;

    if (newStatus) {
      await storageService.addShowcasePanelScenario(sc.id);
    } else {
      await storageService.removeShowcasePanelScenario(sc.id);
    }

    setScenarios((prev) =>
      prev.map((item) => (item.id === sc.id ? { ...item, showcaseEnabled: newStatus } : item))
    );
  };

  // Delete Custom Scenario & Remove from Showcase Panel
  const handleDeleteScenario = async (scId) => {
    await storageService.deleteScenario(scId);
    await storageService.removeShowcasePanelScenario(scId);
    
    // Clear active editing ID if deleted scenario was active
    const activeEditingId = await storageService.getActiveEditingScenarioId();
    if (activeEditingId === scId) {
      await storageService.setActiveEditingScenarioId(null);
    }

    await loadAllScenarios();
    setNotification({ type: 'info', message: 'Custom scenario deleted from browser storage.' });
  };

  // Export JSON File
  const handleExportJson = (sc) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sc, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${sc.id || 'scenario'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Scenario File
  const handleImportJson = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.name) throw new Error('Missing scenario name');

        const newScenario = {
          ...parsed,
          id: `custom_${Date.now()}`,
          type: 'json',
          isBuiltIn: false
        };

        await storageService.saveScenario(newScenario);
        await storageService.addShowcasePanelScenario(newScenario.id);
        await loadAllScenarios();
        setNotification({ type: 'success', message: `Imported scenario: "${newScenario.name}"` });
      } catch (err) {
        setNotification({ type: 'error', message: 'Failed to import invalid scenario JSON file.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredScenarios = scenarios.filter((sc) =>
    sc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sr-panel" style={{ flex: 1, padding: '2rem' }}>
      
      <NotificationBanner 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />

      <div className="sr-panel-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header & Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <span className="sr-badge sr-badge-blue">Scenario Manager</span>
            <h2 className="sr-title">Browser Scenario Repository</h2>
            <p className="sr-subtitle">Manage built-in scenarios, custom JSON entries, imports, and exports.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Create New Scenario Button */}
            <button 
              className="sr-btn sr-btn-primary" 
              style={{ gap: '0.5rem' }}
              onClick={handleCreateNewScenario}
            >
              <Plus size={15} />
              <span>Create New Scenario</span>
            </button>

            {/* JSON File Import Button */}
            <label className="sr-btn sr-btn-secondary" style={{ cursor: 'pointer', gap: '0.5rem' }}>
              <Upload size={15} />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportJson} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--sr-color-text-subtle)' }} />
          <input 
            type="text" 
            className="sr-input" 
            style={{ paddingLeft: '2.5rem', width: '100%', boxSizing: 'border-box' }}
            placeholder="Search scenarios by name or description..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Scenario List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredScenarios.map((sc) => {
            const isEditing = editingId === sc.id;

            return (
              <div 
                key={sc.id} 
                className="sr-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  padding: '1rem 1.25rem',
                  gap: '1rem'
                }}
              >
                {/* Left Side: Checkbox, Details, Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                  
                  <input 
                    type="checkbox" 
                    checked={Boolean(sc.showcaseEnabled)} 
                    onChange={() => handleToggleShowcase(sc)}
                    title="Include in main showcase panel"
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      
                      <span 
                        className="sr-badge"
                        style={{
                          fontSize: '0.65rem',
                          backgroundColor: sc.isBuiltIn ? 'rgba(59, 130, 246, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                          color: sc.isBuiltIn ? '#3b82f6' : '#a855f7',
                          border: `1px solid ${sc.isBuiltIn ? 'rgba(59, 130, 246, 0.3)' : 'rgba(168, 85, 247, 0.3)'}`
                        }}
                      >
                        {sc.isBuiltIn ? 'JSX Built-In' : 'JSON Custom'}
                      </span>

                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <input 
                            type="text" 
                            className="sr-input" 
                            style={{ padding: '0.2rem 0.4rem', fontSize: '0.85rem' }}
                            value={editingName} 
                            onChange={(e) => setEditingName(e.target.value)} 
                          />
                          <button className="sr-btn sr-btn-secondary" style={{ padding: '0.25rem' }} onClick={() => handleSaveRename(sc)}>
                            <Check size={12} style={{ color: '#10b981' }} />
                          </button>
                          <button className="sr-btn sr-btn-secondary" style={{ padding: '0.25rem' }} onClick={() => setEditingId(null)}>
                            <X size={12} style={{ color: '#ef4444' }} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <h3 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 600 }}>{sc.name}</h3>
                          <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem', border: 'none' }} onClick={() => handleStartRename(sc)} title="Rename scenario">
                            <Edit2 size={12} style={{ opacity: 0.6 }} />
                          </button>
                        </div>
                      )}
                    </div>

                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--sr-color-text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sc.description}
                    </p>
                  </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  
                  {/* Simulate Button */}
                  <button 
                    className="sr-btn sr-btn-primary" 
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', gap: '0.35rem' }}
                    onClick={() => onSimulateScenario && onSimulateScenario(sc.id)}
                  >
                    <Play size={13} />
                    <span>Simulate</span>
                  </button>

                  {/* Actions for JSON custom scenarios only */}
                  {sc.type === 'json' && (
                    <>
                      {/* Edit Scenario Button */}
                      <button 
                        className="sr-btn sr-btn-secondary" 
                        style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', gap: '0.35rem' }}
                        onClick={() => handleEditScenario(sc.id)}
                        title="Edit scenario in visual editor"
                      >
                        <Edit2 size={13} style={{ color: 'var(--sr-color-primary)' }} />
                        <span>Edit</span>
                      </button>

                      {/* Export JSON Button */}
                      <button 
                        className="sr-btn sr-btn-secondary" 
                        style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', gap: '0.35rem' }}
                        onClick={() => handleExportJson(sc)}
                        title="Export scenario as JSON file"
                      >
                        <Download size={13} style={{ color: 'var(--sr-color-primary)' }} />
                        <span>Export</span>
                      </button>
                    </>
                  )}

                  {/* Delete Custom Scenario Button */}
                  {!sc.isBuiltIn && (
                    <button 
                      className="sr-btn sr-btn-secondary" 
                      style={{ padding: '0.4rem', color: '#ef4444' }}
                      onClick={() => handleDeleteScenario(sc.id)}
                      title="Delete custom scenario"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}