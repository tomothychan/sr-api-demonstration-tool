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
  Plus,
  ExternalLink
} from 'lucide-react';

import { storageService } from './StorageService';
import NotificationBanner from '../components/NotificationBanner';

const BUILT_IN_SCENARIOS = [
  {
    id: 'candidate-app',
    name: 'Candidate Application Portal',
    description: 'Simulates candidate form intake, OpenAPI mapping, and email deduplication.',
    type: 'jsx',
    isBuiltIn: true
  },
  {
    id: 'gsheet-import',
    name: 'Google Sheets Batch Sourcing',
    description: 'ETL worker streaming rows from Google Sheets into OpenAPI POST payloads.',
    type: 'jsx',
    isBuiltIn: true
  },
  {
    id: 'hired-webhook',
    name: 'SAP SuccessFactors Handoff',
    description: 'Recruiter hire events converted to SuccessFactors OData API records.',
    type: 'jsx',
    isBuiltIn: true
  },
  {
    id: 'webhook-subscription',
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

  const handleDeleteScenario = async (scId) => {
    await storageService.deleteScenario(scId);
    await storageService.removeShowcasePanelScenario(scId);
    
    const activeEditingId = await storageService.getActiveEditingScenarioId();
    if (activeEditingId === scId) {
      await storageService.setActiveEditingScenarioId(null);
    }

    await loadAllScenarios();
    setNotification({ type: 'info', message: 'Custom scenario deleted from browser storage.' });
  };

  const handleExportJson = (sc) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sc, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${sc.id || 'scenario'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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
        <div className="sr-flex-between" style={{ marginBottom: '1.5rem' }}>
          <div>
            <span className="sr-badge sr-badge-blue">Scenario Manager</span>
            <h2 className="sr-title">Browser Scenario Repository</h2>
            <p className="sr-subtitle">Manage built-in scenarios, custom JSON entries, imports, and exports.</p>
          </div>

          <div className="sr-flex-gap">
            <button className="sr-btn sr-btn-primary" onClick={handleCreateNewScenario}>
              <Plus size={15} />
              <span>Create New Scenario</span>
            </button>

            <label className="sr-btn sr-btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={15} />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportJson} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Search Bar */}
        <div className="sr-search-wrapper">
          <Search size={16} className="sr-search-icon" />
          <input 
            type="text" 
            className="sr-input sr-search-input" 
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
                className="sr-card sr-flex-between"
                style={{ padding: '1rem 1.25rem', gap: '1rem' }}
              >
                {/* Left Side */}
                <div className="sr-flex-gap" style={{ flex: 1, minWidth: 0, gap: '1rem' }}>
                  
                  <input 
                    type="checkbox" 
                    checked={Boolean(sc.showcaseEnabled)} 
                    onChange={() => handleToggleShowcase(sc)}
                    title="Include in main showcase panel"
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="sr-flex-gap" style={{ marginBottom: '0.25rem' }}>
                      
                      <span className={`sr-badge ${sc.isBuiltIn ? 'sr-badge-blue' : 'sr-badge-purple'}`} style={{ fontSize: '0.65rem' }}>
                        {sc.isBuiltIn ? 'JSX Built-In' : 'JSON Custom'}
                      </span>

                      {isEditing ? (
                        <div className="sr-flex-gap-sm">
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
                        <div className="sr-flex-gap-sm">
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

                {/* Right Side */}
                <div className="sr-flex-gap" style={{ flexShrink: 0 }}>
                  {sc.isBuiltIn ? (
                    <button 
                      className={`sr-btn ${sc.showcaseEnabled ? 'sr-btn-primary' : 'sr-btn-disabled'}`}
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}
                      disabled={!sc.showcaseEnabled}
                      onClick={() => {
                        const scenarioUrl = new URL(
                          sc.id,
                          `${window.location.origin}${import.meta.env.BASE_URL}`
                        ).href;
                        window.open(scenarioUrl, '_blank', 'noopener,noreferrer');
                      }}
                      title={!sc.showcaseEnabled ? 'Check showcase panel checkbox to enable demonstration' : 'Go to Demonstration'}
                    >
                      <ExternalLink size={13} />
                      <span>Go to Demonstration</span>
                    </button>
                  ) : (
                    <button 
                      className="sr-btn sr-btn-primary" 
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}
                      onClick={() => onSimulateScenario && onSimulateScenario(sc.id)}
                    >
                      <Play size={13} />
                      <span>Simulate</span>
                    </button>
                  )}

                  {sc.type === 'json' && (
                    <>
                      <button 
                        className="sr-btn sr-btn-secondary" 
                        style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem' }}
                        onClick={() => handleEditScenario(sc.id)}
                        title="Edit scenario in visual editor"
                      >
                        <Edit2 size={13} style={{ color: 'var(--sr-color-primary)' }} />
                        <span>Edit</span>
                      </button>

                      <button 
                        className="sr-btn sr-btn-secondary" 
                        style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem' }}
                        onClick={() => handleExportJson(sc)}
                        title="Export scenario as JSON file"
                      >
                        <Download size={13} style={{ color: 'var(--sr-color-primary)' }} />
                        <span>Export</span>
                      </button>
                    </>
                  )}

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