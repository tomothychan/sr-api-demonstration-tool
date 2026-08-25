import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Eye, 
  EyeOff, 
  Network, 
  Database, 
  FileText, 
  Layers, 
  Play,
  ArrowRightLeft,
  Activity,
  Code,
  FolderOpen
} from 'lucide-react';

import { storageService } from './StorageService';
import { ScenarioModel, BaseComponent, Step, StepActivity } from './ScenarioModels';
import NotificationBanner from '../components/NotificationBanner';

const ACTIVITY_TYPES = [
  { id: 'dbMutations', label: 'DB Mutations', icon: Database, color: '#10b981' },
  { id: 'PacketMovement', label: 'Packet Movement', icon: ArrowRightLeft, color: '#3b82f6' },
  { id: 'NodeUpdate', label: 'Node Update', icon: Network, color: '#f59e0b' },
  { id: 'EdgeUpdate', label: 'Edge Update', icon: Activity, color: '#a855f7' },
  { id: 'inspectorPanelEntry', label: 'Inspector Panel Entry', icon: Code, color: '#ec4899' }
];

export default function EditorTab({ onSaveSuccess, onNavigateToBrowser }) {
  const [scenario, setScenario] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [showComponentDropdown, setShowComponentDropdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const initScenario = async () => {
      setNotFound(false);
      
      // Fetch active editing ID directly from LocalStorage
      const idToLoad = await storageService.getActiveEditingScenarioId();

      if (!idToLoad) {
        setNotFound(true);
        return;
      }

      // Load matching scenario from IndexedDB
      const loadedData = await storageService.loadScenario(idToLoad);
      if (loadedData) {
        setScenario(new ScenarioModel(loadedData));
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    };

    initScenario();
  }, []);

  const handleCreateNewAndLoad = async () => {
    const newScenario = await storageService.handleCreateNewScenario();
    setScenario(newScenario);
    setActiveStepIndex(0);
    setNotFound(false);
  };

  const handleSaveToBrowser = async () => {
    if (!scenario) return;
    const res = await storageService.saveScenario(scenario.toJSON());
    if (res.success) {
      setSaveStatus('Saved!');
      if (onSaveSuccess) onSaveSuccess(scenario.toJSON());
      setTimeout(() => setSaveStatus(''), 2500);
    } else {
      setSaveStatus('Error saving');
    }
  };

  const handleToggleInspectorPanel = () => {
    if (!scenario) return;
    if (scenario.inspectorPanelEnabled) {
      const hasInspectorEntries = scenario.steps.some((step) =>
        step.activities?.some((act) => act.type === 'inspectorPanelEntry')
      );

      if (hasInspectorEntries) {
        setNotification({
          type: 'warning',
          message: 'Warning: This scenario contains step activities that log to the Inspector Panel. Turning it off will suppress these logs during execution.'
        });
      }
      setScenario(new ScenarioModel({ ...scenario, inspectorPanelEnabled: false }));
    } else {
      setScenario(new ScenarioModel({ ...scenario, inspectorPanelEnabled: true }));
    }
  };

  const moveStep = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= scenario.steps.length) return;
    const updatedSteps = [...scenario.steps];
    const [moved] = updatedSteps.splice(index, 1);
    updatedSteps.splice(targetIdx, 0, moved);
    
    setScenario(new ScenarioModel({ ...scenario, steps: updatedSteps }));
    if (activeStepIndex === index) setActiveStepIndex(targetIdx);
    else if (activeStepIndex === targetIdx) setActiveStepIndex(index);
  };

  const addStep = () => {
    const nextIdx = scenario.steps.length;
    const newStep = new Step({ title: `Step ${nextIdx}: New Execution Step` });
    setScenario(new ScenarioModel({ ...scenario, steps: [...scenario.steps, newStep] }));
    setActiveStepIndex(nextIdx);
  };

  const deleteStep = (index) => {
    if (scenario.steps.length <= 1) return;
    const updatedSteps = scenario.steps.filter((_, idx) => idx !== index);
    setScenario(new ScenarioModel({ ...scenario, steps: updatedSteps }));
    if (activeStepIndex >= updatedSteps.length) {
      setActiveStepIndex(updatedSteps.length - 1);
    }
  };

  const addStepActivity = (type) => {
    if (type === 'inspectorPanelEntry' && !scenario.inspectorPanelEnabled) {
      setNotification({
        type: 'warning',
        message: 'Adding a new Inspector Panel Entry requires you to turn the Inspector Panel ON.'
      });
      return;
    }

    const currentStep = scenario.steps[activeStepIndex];
    if (!currentStep) return;

    const newActivity = new StepActivity({ type, name: `New ${type} Activity` });
    const updatedSteps = [...scenario.steps];
    updatedSteps[activeStepIndex] = new Step({
      ...currentStep,
      activities: [...currentStep.activities, newActivity]
    });

    setScenario(new ScenarioModel({ ...scenario, steps: updatedSteps }));
    setShowActivityDropdown(false);
  };

  const moveActivityWithinStep = (actIndex, direction) => {
    const currentStep = scenario.steps[activeStepIndex];
    const targetIdx = actIndex + direction;
    if (targetIdx < 0 || targetIdx >= currentStep.activities.length) return;

    const updatedActs = [...currentStep.activities];
    const [moved] = updatedActs.splice(actIndex, 1);
    updatedActs.splice(targetIdx, 0, moved);

    const updatedSteps = [...scenario.steps];
    updatedSteps[activeStepIndex] = new Step({ ...currentStep, activities: updatedActs });
    setScenario(new ScenarioModel({ ...scenario, steps: updatedSteps }));
  };

  const moveActivityToStep = (actIndex, targetStepIdx) => {
    if (targetStepIdx === activeStepIndex) return;
    const currentStep = scenario.steps[activeStepIndex];
    const targetStep = scenario.steps[targetStepIdx];
    if (!targetStep) return;

    const updatedCurrentActs = [...currentStep.activities];
    const [movedAct] = updatedCurrentActs.splice(actIndex, 1);
    const updatedTargetActs = [...targetStep.activities, movedAct];

    const updatedSteps = [...scenario.steps];
    updatedSteps[activeStepIndex] = new Step({ ...currentStep, activities: updatedCurrentActs });
    updatedSteps[targetStepIdx] = new Step({ ...targetStep, activities: updatedTargetActs });
    setScenario(new ScenarioModel({ ...scenario, steps: updatedSteps }));
  };

  const deleteActivity = (actIndex) => {
    const currentStep = scenario.steps[activeStepIndex];
    const updatedActs = currentStep.activities.filter((_, idx) => idx !== actIndex);

    const updatedSteps = [...scenario.steps];
    updatedSteps[activeStepIndex] = new Step({ ...currentStep, activities: updatedActs });
    setScenario(new ScenarioModel({ ...scenario, steps: updatedSteps }));
  };

  const hasForm = scenario?.baseComponents.some((c) => c.type === 'form');

  const addComponent = (type) => {
    if (type === 'form' && hasForm) return;

    let newComp;
    if (type === 'form') newComp = BaseComponent.createForm();
    else if (type === 'nodeGraph') newComp = BaseComponent.createNodeGraph();
    else if (type === 'dbTable') newComp = BaseComponent.createDbTable();

    setScenario(new ScenarioModel({
      ...scenario,
      baseComponents: [...scenario.baseComponents, newComp]
    }));
    setShowComponentDropdown(false);
  };

  const moveComponent = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= scenario.baseComponents.length) return;
    const updated = [...scenario.baseComponents];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setScenario(new ScenarioModel({ ...scenario, baseComponents: updated }));
  };

  const duplicateComponent = (index) => {
    const comp = scenario.baseComponents[index];
    if (comp.type === 'form' && hasForm) return;
    
    const duplicated = new BaseComponent({
      ...JSON.parse(JSON.stringify(comp)),
      id: `${comp.type}-${Date.now()}`
    });
    const updated = [...scenario.baseComponents];
    updated.splice(index + 1, 0, duplicated);
    setScenario(new ScenarioModel({ ...scenario, baseComponents: updated }));
  };

  const deleteComponent = (index) => {
    const updated = scenario.baseComponents.filter((_, idx) => idx !== index);
    setScenario(new ScenarioModel({ ...scenario, baseComponents: updated }));
  };

  // Render "No Scenario Selected" Empty State
  if (notFound || !scenario) {
    return (
      <div className="sr-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="sr-empty-state" style={{ padding: '3rem', maxWidth: '440px', width: '100%', textAlign: 'center', height: 'auto' }}>
          <FolderOpen size={42} style={{ color: 'var(--sr-color-primary)', marginBottom: '1rem' }} />
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600 }}>No Scenario Selected</h2>
          <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: 'var(--sr-color-text-muted)', lineHeight: 1.5 }}>
            Select an existing custom scenario from the repository to edit or create a new one to start authoring.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', width: '100%' }}>
            <button className="sr-btn sr-btn-secondary" onClick={onNavigateToBrowser} style={{ gap: '0.35rem' }}>
              <FolderOpen size={14} />
              <span>Select Existing Scenario</span>
            </button>
            <button className="sr-btn sr-btn-primary" onClick={handleCreateNewAndLoad} style={{ gap: '0.35rem' }}>
              <Plus size={14} />
              <span>Create New Scenario</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentActiveStep = scenario.steps[activeStepIndex] || new Step();

  return (
    <div className="sr-main-split" style={{ position: 'relative', overflow: 'hidden' }}>
      
      <NotificationBanner 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />

      {/* LEFT PANEL */}
      <section 
        className="sr-panel sr-panel-left" 
        style={{ 
          flex: isRightPanelCollapsed ? '1 1 calc(100% - 48px)' : '1 1 60%', 
          transition: 'flex 0.35s cubic-bezier(0.4, 0, 0.2, 1)' 
        }}
      >
        <div className="sr-panel-content" style={{ width: '100%', maxWidth: 'none', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem' }}>
          
          {/* Top Command Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--sr-color-border)' }}>
            <div>
              <span className="sr-badge sr-badge-blue">Scenario Authoring Environment</span>
              <h2 className="sr-title" style={{ marginTop: '0.25rem' }}>Step Activity Timeline</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button className="sr-btn sr-btn-secondary" style={{ gap: '0.5rem' }}>
                <Play size={16} />
                <span>Simulate</span>
              </button>

              <button className="sr-btn sr-btn-primary" onClick={handleSaveToBrowser} style={{ gap: '0.5rem' }}>
                <Save size={16} />
                <span>{saveStatus || 'Save to Browser'}</span>
              </button>
            </div>
          </div>

          {/* Main Step Builder Area */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.25rem' }}>
            
            {/* Step Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRight: '1px solid var(--sr-color-border)', paddingRight: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="sr-label">STEPS ({scenario.steps.length})</span>
                <button onClick={addStep} className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} title="Add Step">
                  <Plus size={14} />
                </button>
              </div>

              {scenario.steps.map((step, idx) => {
                const isActive = activeStepIndex === idx;
                return (
                  <div 
                    key={step.id || idx}
                    onClick={() => setActiveStepIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      padding: '0.5rem 0.6rem',
                      borderRadius: 'var(--sr-radius-sm)',
                      backgroundColor: isActive ? 'var(--sr-color-primary-light)' : 'var(--sr-color-bg-surface)',
                      border: `1px solid ${isActive ? 'var(--sr-color-primary)' : 'var(--sr-color-border)'}`,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 600 : 400
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>
                      Step {idx}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }} onClick={(e) => e.stopPropagation()}>
                      <button className="sr-btn sr-btn-secondary" style={{ padding: '0.15rem', border: 'none' }} onClick={() => moveStep(idx, -1)} title="Move Step Up">
                        <ArrowUp size={11} />
                      </button>
                      <button className="sr-btn sr-btn-secondary" style={{ padding: '0.15rem', border: 'none' }} onClick={() => moveStep(idx, 1)} title="Move Step Down">
                        <ArrowDown size={11} />
                      </button>
                      {scenario.steps.length > 1 && (
                        <button className="sr-btn sr-btn-secondary" style={{ padding: '0.15rem', border: 'none', color: '#ef4444' }} onClick={() => deleteStep(idx)} title="Delete Step">
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step Detail Editor */}
            <div className="sr-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
                  Editing Step {activeStepIndex}
                </h3>

                <div style={{ position: 'relative' }}>
                  <button 
                    className="sr-btn sr-btn-secondary" 
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '0.35rem' }}
                    onClick={() => setShowActivityDropdown(!showActivityDropdown)}
                  >
                    <Plus size={13} />
                    <span>Add Activity</span>
                  </button>

                  {showActivityDropdown && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '110%',
                      backgroundColor: 'var(--sr-color-bg-surface)',
                      border: '1px solid var(--sr-color-border)',
                      borderRadius: 'var(--sr-radius-md)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                      zIndex: 30,
                      width: '190px',
                      overflow: 'hidden'
                    }}>
                      {ACTIVITY_TYPES.map((actType) => {
                        const IconComponent = actType.icon;
                        const isInspectorDisabled = actType.id === 'inspectorPanelEntry' && !scenario.inspectorPanelEnabled;

                        return (
                          <div 
                            key={actType.id} 
                            className="sr-tab-btn" 
                            style={{ 
                              padding: '0.5rem 0.75rem', 
                              fontSize: '0.75rem',
                              textDecoration: isInspectorDisabled ? 'line-through' : 'none',
                              opacity: isInspectorDisabled ? 0.5 : 1,
                              cursor: 'pointer'
                            }}
                            onClick={() => addStepActivity(actType.id)}
                          >
                            <IconComponent size={14} style={{ color: actType.color }} />
                            <span>{actType.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="sr-form-group">
                <label className="sr-label">Step Title</label>
                <input 
                  type="text" 
                  className="sr-input" 
                  value={currentActiveStep.title || ''} 
                  onChange={(e) => {
                    const updated = [...scenario.steps];
                    updated[activeStepIndex] = new Step({ ...currentActiveStep, title: e.target.value });
                    setScenario(new ScenarioModel({ ...scenario, steps: updated }));
                  }}
                />
              </div>

              {/* Activity List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <span className="sr-label">ACTIVITIES ({currentActiveStep.activities?.length || 0})</span>

                {(!currentActiveStep.activities || currentActiveStep.activities.length === 0) ? (
                  <div className="sr-empty-state" style={{ height: '100px' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem' }}>No activities in this step yet. Click "Add Activity" above.</p>
                  </div>
                ) : (
                  currentActiveStep.activities.map((act, actIdx) => {
                    const actMeta = ACTIVITY_TYPES.find((t) => t.id === act.type) || ACTIVITY_TYPES[0];
                    const IconComponent = actMeta.icon;

                    return (
                      <div key={act.id || actIdx} style={{ padding: '0.75rem', borderRadius: 'var(--sr-radius-md)', border: '1px solid var(--sr-color-border)', backgroundColor: 'var(--sr-color-bg-base)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <IconComponent size={15} style={{ color: actMeta.color }} />
                            <input 
                              type="text" 
                              className="sr-input" 
                              style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem', fontWeight: 600 }}
                              value={act.name || ''} 
                              onChange={(e) => {
                                const updatedSteps = [...scenario.steps];
                                const updatedActs = [...currentActiveStep.activities];
                                updatedActs[actIdx] = new StepActivity({ ...act, name: e.target.value });
                                updatedSteps[activeStepIndex] = new Step({ ...currentActiveStep, activities: updatedActs });
                                setScenario(new ScenarioModel({ ...scenario, steps: updatedSteps }));
                              }}
                            />
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem' }} onClick={() => moveActivityWithinStep(actIdx, -1)} title="Move Up">
                              <ArrowUp size={12} />
                            </button>
                            <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem' }} onClick={() => moveActivityWithinStep(actIdx, 1)} title="Move Down">
                              <ArrowDown size={12} />
                            </button>

                            <select 
                              className="sr-input"
                              style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', width: '90px' }}
                              value={activeStepIndex}
                              onChange={(e) => moveActivityToStep(actIdx, Number(e.target.value))}
                              title="Move to another step"
                            >
                              {scenario.steps.map((s, sIdx) => (
                                <option key={sIdx} value={sIdx}>To Step {sIdx}</option>
                              ))}
                            </select>

                            <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem', color: '#ef4444' }} onClick={() => deleteActivity(actIdx)} title="Delete Activity">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--sr-color-text-subtle)', backgroundColor: 'var(--sr-color-bg-surface)', padding: '0.5rem', borderRadius: 'var(--sr-radius-sm)', border: '1px solid var(--sr-color-border-subtle)' }}>
                          <span>[{act.type}] Component Settings Stub</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* RIGHT PANEL */}
      <section 
        className="sr-panel sr-panel-right" 
        style={{ 
          flex: isRightPanelCollapsed ? '0 0 48px' : '0 0 40%', 
          transition: 'flex 0.35s cubic-bezier(0.4, 0, 0.2, 1), padding 0.35s ease',
          padding: isRightPanelCollapsed ? '1rem 0.25rem' : '2rem',
          position: 'relative',
          boxSizing: 'border-box'
        }}
      >
        {/* Toggle Circle Indicator Button */}
        <button 
          onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
          style={{ 
            position: 'absolute', 
            top: '1.25rem', 
            left: '-12px', 
            zIndex: 40, 
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'var(--sr-color-bg-surface)',
            border: '1px solid var(--sr-color-border)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            padding: 0
          }}
          title={isRightPanelCollapsed ? 'Expand Panel' : 'Collapse Panel'}
        >
          <span 
            style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: isRightPanelCollapsed ? 'var(--sr-color-primary)' : 'var(--sr-color-text-muted)',
              transition: 'background-color 0.25s ease'
            }} 
          />
        </button>

        {/* Inner Content Wrapper */}
        <div 
          style={{ 
            opacity: isRightPanelCollapsed ? 0 : 1, 
            visibility: isRightPanelCollapsed ? 'hidden' : 'visible',
            transition: 'opacity 0.25s ease, visibility 0.25s ease',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.25rem',
            width: '100%'
          }}
        >
          {/* Metadata Card */}
          <div className="sr-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="sr-label">SCENARIO DESCRIPTION</span>
              
              <button 
                onClick={handleToggleInspectorPanel}
                className="sr-btn"
                style={{ 
                  padding: '0.25rem 0.6rem', 
                  fontSize: '0.75rem', 
                  gap: '0.35rem',
                  backgroundColor: scenario.inspectorPanelEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: scenario.inspectorPanelEnabled ? '#10b981' : '#ef4444',
                  border: `1px solid ${scenario.inspectorPanelEnabled ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                }}
              >
                {scenario.inspectorPanelEnabled ? <Eye size={12} /> : <EyeOff size={12} />}
                <span>Inspector {scenario.inspectorPanelEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="sr-form" style={{ gap: '0.75rem' }}>
              <div className="sr-form-group">
                <label className="sr-label">Scenario Name</label>
                <input 
                  type="text" 
                  className="sr-input" 
                  value={scenario.name} 
                  onChange={(e) => setScenario(new ScenarioModel({ ...scenario, name: e.target.value }))} 
                />
              </div>
              <div className="sr-form-group">
                <label className="sr-label">Description</label>
                <textarea 
                  className="sr-input" 
                  rows={2} 
                  style={{ resize: 'vertical' }}
                  value={scenario.description} 
                  onChange={(e) => setScenario(new ScenarioModel({ ...scenario, description: e.target.value }))} 
                />
              </div>
            </div>
          </div>

          {/* Base Components Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={16} style={{ color: 'var(--sr-color-primary)' }} />
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Base Components</h3>
              </div>

              <div style={{ position: 'relative' }}>
                <button 
                  className="sr-btn sr-btn-primary" 
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={() => setShowComponentDropdown(!showComponentDropdown)}
                >
                  <Plus size={14} />
                  <span>Create Component</span>
                </button>

                {showComponentDropdown && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '110%',
                    backgroundColor: 'var(--sr-color-bg-surface)',
                    border: '1px solid var(--sr-color-border)',
                    borderRadius: 'var(--sr-radius-md)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    zIndex: 30,
                    width: '180px',
                    overflow: 'hidden'
                  }}>
                    <button 
                      className="sr-tab-btn" 
                      disabled={hasForm}
                      style={{ width: '100%', justifyContent: 'flex-start', opacity: hasForm ? 0.4 : 1, cursor: hasForm ? 'not-allowed' : 'pointer' }}
                      onClick={() => addComponent('form')}
                    >
                      <FileText size={14} style={{ color: '#a855f7' }} />
                      <span>Form {hasForm ? '(Max 1)' : ''}</span>
                    </button>

                    <button 
                      className="sr-tab-btn" 
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                      onClick={() => addComponent('nodeGraph')}
                    >
                      <Network size={14} style={{ color: '#f59e0b' }} />
                      <span>Node Graph</span>
                    </button>

                    <button 
                      className="sr-tab-btn" 
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                      onClick={() => addComponent('dbTable')}
                    >
                      <Database size={14} style={{ color: '#10b981' }} />
                      <span>DB Table</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Component Cards with Inline Title Editing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {scenario.baseComponents.map((comp, idx) => {
                let badgeStyle = { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)' };
                if (comp.type === 'nodeGraph') {
                  badgeStyle = { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
                } else if (comp.type === 'dbTable') {
                  badgeStyle = { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' };
                }

                return (
                  <div key={comp.id || idx} className="sr-card" style={{ padding: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, marginRight: '0.5rem' }}>
                        <span 
                          className="sr-badge" 
                          style={{ 
                            fontSize: '0.65rem', 
                            backgroundColor: badgeStyle.bg, 
                            color: badgeStyle.color, 
                            border: `1px solid ${badgeStyle.border}` 
                          }}
                        >
                          {comp.type}
                        </span>
                        
                        <input 
                          type="text" 
                          className="sr-input" 
                          style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem', fontWeight: 600, flex: 1 }}
                          value={comp.title || ''} 
                          onChange={(e) => {
                            const updated = [...scenario.baseComponents];
                            updated[idx] = new BaseComponent({ ...comp, title: e.target.value });
                            setScenario(new ScenarioModel({ ...scenario, baseComponents: updated }));
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem 0.35rem' }} onClick={() => moveComponent(idx, -1)} title="Move Up">
                          <ArrowUp size={12} />
                        </button>
                        <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem 0.35rem' }} onClick={() => moveComponent(idx, 1)} title="Move Down">
                          <ArrowDown size={12} />
                        </button>
                        <button 
                          className="sr-btn sr-btn-secondary" 
                          disabled={comp.type === 'form' && hasForm}
                          style={{ padding: '0.2rem 0.35rem', opacity: (comp.type === 'form' && hasForm) ? 0.4 : 1 }} 
                          onClick={() => duplicateComponent(idx)} 
                          title="Duplicate"
                        >
                          <Copy size={12} />
                        </button>
                        <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem 0.35rem', color: '#ef4444' }} onClick={() => deleteComponent(idx)} title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}