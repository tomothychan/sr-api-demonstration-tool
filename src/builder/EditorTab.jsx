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
  Activity as ActivityIcon,
  Code,
  FolderOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { storageService } from './StorageService';
import { ScenarioModel, BaseComponent, Step, StepActivity } from './ScenarioModels';
import NotificationBanner from '../components/NotificationBanner';

import FormEditor from './components/editors/FormEditor';
import DbTableEditor from './components/editors/DbTableEditor';
import NodeGraphEditor from './components/editors/NodeGraphEditor';
import ActivityEditor from './components/activities/ActivityEditor';
import NoScenarioSlate from './components/NoScenarioSlate';

const ACTIVITY_TYPES = [
  { id: 'dbMutations', label: 'DB Mutations', icon: Database, color: '#10b981' },
  { id: 'PacketMovement', label: 'Packet Movement', icon: ArrowRightLeft, color: '#3b82f6' },
  { id: 'NodeUpdate', label: 'Node Update', icon: Network, color: '#f59e0b' },
  { id: 'EdgeUpdate', label: 'Edge Update', icon: ActivityIcon, color: '#a855f7' },
  { id: 'inspectorPanelEntry', label: 'Inspector Panel Entry', icon: Code, color: '#ec4899' }
];

export default function EditorTab({ onSaveSuccess, onNavigateToBrowser, onSimulateScenario }) {
  const [scenario, setScenario] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  
  const [expandedCompIds, setExpandedCompIds] = useState({});
  const [expandedActivityIds, setExpandedActivityIds] = useState({});

  const [saveStatus, setSaveStatus] = useState('');
  const [showComponentDropdown, setShowComponentDropdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const initScenario = async () => {
      setNotFound(false);
      const idToLoad = await storageService.getActiveEditingScenarioId();

      if (!idToLoad) {
        setNotFound(true);
        return;
      }

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

  const toggleComponentExpand = (compId) => {
    setExpandedCompIds((prev) => ({
      ...prev,
      [compId]: !prev[compId]
    }));
  };

  const toggleActivityExpand = (actId) => {
    setExpandedActivityIds((prev) => ({
      ...prev,
      [actId]: !prev[actId]
    }));
  };

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

  const scenarioHasNodeGraph = () => scenario?.baseComponents.some((c) => c.type === 'nodeGraph');
  const scenarioHasDbTable = () => scenario?.baseComponents.some((c) => c.type === 'dbTable');
  const scenarioHasForm = () => scenario?.baseComponents.some((c) => c.type === 'form');
  const scenarioHasInspectorPanel = () => scenario?.inspectorPanelEnabled;

  const isActivityDisabled = (type) => {
    if (type === 'inspectorPanelEntry') return !scenarioHasInspectorPanel();
    if (type === 'dbMutations') return !scenarioHasDbTable();
    if (type === 'NodeUpdate' || type === 'EdgeUpdate' || type === 'PacketMovement') {
      return !scenarioHasNodeGraph();
    }
    return false;
  };

  const addStepActivity = (type) => {
    if (type === 'inspectorPanelEntry' && !scenarioHasInspectorPanel()) {
      setNotification({
        type: 'warning',
        message: 'Adding a new Inspector Panel Entry requires you to turn the Inspector Panel ON.'
      });
      return;
    }
    if ((type === 'NodeUpdate' || type === 'EdgeUpdate' || type === 'PacketMovement') && !scenarioHasNodeGraph()) {
      setNotification({
        type: 'warning',
        message: 'Adding this activity requires at least one Node Graph component in the scenario.'
      });
      return;
    }
    if (type === 'dbMutations' && !scenarioHasDbTable()) {
      setNotification({
        type: 'warning',
        message: 'Adding a new DB Mutations activity requires at least one Database Table component in the scenario.'
      });
      return;
    }

    const currentStep = scenario.steps[activeStepIndex];
    if (!currentStep) return;

    const firstGraph = scenario.baseComponents.find((c) => c.type === 'nodeGraph');
    const firstDbTable = scenario.baseComponents.find((c) => c.type === 'dbTable');

    const newActivity = new StepActivity({ 
      type, 
      name: `New ${type} Activity`,
      config: StepActivity.getDefaultConfig(type, {
        nodeGraphId: firstGraph?.id || '',
        dbTableId: firstDbTable?.id || '',
        fromNode: firstGraph?.nodes?.[0]?.id || '',
        toNode: firstGraph?.nodes?.[1]?.id || '',
        nodeId: firstGraph?.nodes?.[0]?.id || ''
      })
    });

    const updatedSteps = [...scenario.steps];
    updatedSteps[activeStepIndex] = new Step({
      ...currentStep,
      activities: [...currentStep.activities, newActivity]
    });

    setScenario(new ScenarioModel({ ...scenario, steps: updatedSteps }));
    setExpandedActivityIds((prev) => ({ ...prev, [newActivity.id]: true }));
    setShowActivityDropdown(false);
  };

  const updateActivity = (actIndex, updatedActivity) => {
    const currentStep = scenario.steps[activeStepIndex];
    const updatedActs = [...currentStep.activities];
    updatedActs[actIndex] = new StepActivity(updatedActivity);

    const updatedSteps = [...scenario.steps];
    updatedSteps[activeStepIndex] = new Step({ ...currentStep, activities: updatedActs });
    setScenario(new ScenarioModel({ ...scenario, steps: updatedSteps }));
  };

  const moveActivityWithinStep = (actIndex, direction) => {
    const currentStep = scenario.steps[activeStepIndex];
    const targetIdx = actIndex + direction;
    if (targetIdx < 0 || targetIdx >= currentStep.activities.length) return;

    const updatedActs = [...currentStep.activities];
    const [movedAct] = updatedActs.splice(actIndex, 1);
    updatedActs.splice(targetIdx, 0, movedAct);

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

  const hasForm = scenarioHasForm();

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
    setExpandedCompIds((prev) => ({ ...prev, [newComp.id]: true }));
    setShowComponentDropdown(false);
  };

  const updateBaseComponent = (index, updatedComponent) => {
    const updatedComps = [...scenario.baseComponents];
    updatedComps[index] = new BaseComponent(updatedComponent);
    setScenario(new ScenarioModel({ ...scenario, baseComponents: updatedComps }));
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
      id: `${comp.type}_${Date.now()}`
    });
    const updated = [...scenario.baseComponents];
    updated.splice(index + 1, 0, duplicated);
    setScenario(new ScenarioModel({ ...scenario, baseComponents: updated }));
  };

  const isActivityReferencingComponent = (act, compId) => {
    return (
      act.config?.nodeGraphId === compId ||
      act.config?.dbTableId === compId ||
      act.config?.componentId === compId ||
      act.config?.formId === compId
    );
  };

  const countReferencingActivities = (compId) => {
    let count = 0;
    scenario.steps.forEach((step) => {
      step.activities.forEach((act) => {
        if (isActivityReferencingComponent(act, compId)) {
          count++;
        }
      });
    });
    return count;
  };

  const deleteComponent = (index) => {
    const comp = scenario.baseComponents[index];
    if (!comp) return;

    const refCount = countReferencingActivities(comp.id);

    const executeDelete = () => {
      const updatedComps = scenario.baseComponents.filter((_, idx) => idx !== index);
      
      const updatedSteps = scenario.steps.map((step) => {
        const filteredActivities = step.activities.filter(
          (act) => !isActivityReferencingComponent(act, comp.id)
        );
        return new Step({ ...step, activities: filteredActivities });
      });

      setScenario(new ScenarioModel({ 
        ...scenario, 
        baseComponents: updatedComps, 
        steps: updatedSteps 
      }));
    };

    if (refCount > 0) {
      setNotification({
        type: 'warning',
        message: `Deleting "${comp.title || comp.id}" will also delete ${refCount} activity/activities referencing it across the timeline.`,
        confirmText: 'Delete Component & Activities',
        onConfirm: () => {
          executeDelete();
        }
      });
    } else {
      executeDelete();
    }
  };

  if (notFound || !scenario) {
    return <NoScenarioSlate 
      onNavigateToBrowser={onNavigateToBrowser} 
      handleCreateNewAndLoad={handleCreateNewAndLoad} 
      isEditor={true} />;
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
          flex: isRightPanelCollapsed ? '1 1 calc(100% - 48px)' : '1 1 55%', 
          transition: 'flex 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: 0
        }}
      >
        <div className="sr-panel-content" style={{ width: '100%', maxWidth: 'none', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem', minWidth: 0 }}>
          
          {/* Command Bar */}
          <div className="sr-flex-between" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--sr-color-border)', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span className="sr-badge sr-badge-blue">Scenario Authoring Environment</span>
              <h2 className="sr-title" style={{ marginTop: '0.25rem' }}>Step Activity Timeline</h2>
            </div>

            <div className="sr-flex-gap" style={{ flexWrap: 'wrap' }}>
              <button className="sr-btn sr-btn-secondary" onClick={onSimulateScenario} style={{ gap: '0.35rem' }}>
                <Play size={16} />
                <span className="sr-btn-text">Simulate</span>
              </button>

              <button className="sr-btn sr-btn-primary" onClick={handleSaveToBrowser}>
                <Save size={16} />
                <span>{saveStatus || 'Save to Browser'}</span>
              </button>
            </div>
          </div>

          {/* Main Step Builder Grid */}
          <div className="sr-scenario-grid" style={{ minWidth: 0 }}>
            
            {/* Step Sidebar */}
            <div className="sr-step-sidebar" style={{ minWidth: 0 }}>
              <div className="sr-flex-between" style={{ marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.25rem' }}>
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
                      fontWeight: isActive ? 600 : 400,
                      gap: '0.35rem',
                      minWidth: 0
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                      Step {idx}
                    </span>

                    <div className="sr-flex-gap-sm" style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
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
            <div className="sr-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
              <div className="sr-flex-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
                  Editing Step {activeStepIndex}
                </h3>

                <div style={{ position: 'relative' }}>
                  <button 
                    className="sr-btn sr-btn-secondary" 
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    onClick={() => setShowActivityDropdown(!showActivityDropdown)}
                  >
                    <Plus size={13} />
                    <span>Add Activity</span>
                  </button>

                  {showActivityDropdown && (
                    <div className="sr-dropdown-menu">
                      {ACTIVITY_TYPES.map((actType) => {
                        const IconComponent = actType.icon;
                        const disabled = isActivityDisabled(actType.id);

                        return (
                          <div 
                            key={actType.id} 
                            className={`sr-tab-btn ${disabled ? 'sr-activity-disabled' : ''}`}
                            style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
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

              <div className="sr-form-group" style={{ minWidth: 0 }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem', minWidth: 0 }}>
                <span className="sr-label">ACTIVITIES ({currentActiveStep.activities?.length || 0})</span>

                {(!currentActiveStep.activities || currentActiveStep.activities.length === 0) ? (
                  <div className="sr-empty-state" style={{ height: '100px' }}>
                    <p className="sr-empty-state-message" style={{ margin: 0, fontSize: '0.8rem' }}>No activities in this step yet. Click "Add Activity" above.</p>
                  </div>
                ) : (
                  currentActiveStep.activities.map((act, actIdx) => {
                    const actMeta = ACTIVITY_TYPES.find((t) => t.id === act.type) || ACTIVITY_TYPES[0];
                    const IconComponent = actMeta.icon;
                    const isExpanded = Boolean(expandedActivityIds[act.id]);

                    return (
                      <div key={act.id || actIdx} style={{ padding: '0.75rem', borderRadius: 'var(--sr-radius-md)', border: '1px solid var(--sr-color-border)', backgroundColor: 'var(--sr-color-bg-base)', minWidth: 0 }}>
                        <div className="sr-flex-between" style={{ marginBottom: isExpanded ? '0.5rem' : 0, flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div className="sr-flex-gap" style={{ flex: '1 1 140px', minWidth: 0 }}>
                            <IconComponent size={15} style={{ color: actMeta.color, flexShrink: 0 }} />
                            <input 
                              type="text" 
                              className="sr-input" 
                              style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem', fontWeight: 600, width: '100%', minWidth: 0 }}
                              value={act.name || ''} 
                              onChange={(e) => updateActivity(actIdx, { ...act, name: e.target.value })}
                            />
                          </div>

                          <div className="sr-flex-gap-sm" style={{ flexShrink: 0, marginLeft: 'auto' }}>
                            <button 
                              className="sr-btn sr-btn-secondary" 
                              style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }} 
                              onClick={() => toggleActivityExpand(act.id)}
                            >
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              <span>{isExpanded ? 'Close' : 'Configure'}</span>
                            </button>

                            <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem' }} onClick={() => moveActivityWithinStep(actIdx, -1)} title="Move Up">
                              <ArrowUp size={12} />
                            </button>
                            <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem' }} onClick={() => moveActivityWithinStep(actIdx, 1)} title="Move Down">
                              <ArrowDown size={12} />
                            </button>

                            <select 
                              className="sr-input"
                              style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', width: '85px' }}
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

                        {/* Collapsible Modular Activity Editor */}
                        {isExpanded && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--sr-color-bg-surface)', padding: '0.65rem', borderRadius: 'var(--sr-radius-sm)', border: '1px solid var(--sr-color-border-subtle)', minWidth: 0 }}>
                            <ActivityEditor 
                              activity={act} 
                              baseComponents={scenario.baseComponents} 
                              onChange={(updatedAct) => updateActivity(actIdx, updatedAct)} 
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* RIGHT PANEL: Base Components Section */}
      <section 
        className="sr-panel sr-panel-right" 
        style={{ 
          flex: isRightPanelCollapsed ? '0 0 48px' : '1 1 45%', 
          transition: 'flex 0.35s cubic-bezier(0.4, 0, 0.2, 1), padding 0.35s ease',
          padding: isRightPanelCollapsed ? '1rem 0.25rem' : '2rem',
          position: 'relative',
          boxSizing: 'border-box',
          minWidth: 0
        }}
      >
        <button 
          onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
          className="sr-panel-toggle-btn"
          title={isRightPanelCollapsed ? 'Expand Panel' : 'Collapse Panel'}
        >
          <span className={`sr-panel-toggle-dot ${isRightPanelCollapsed ? 'sr-panel-toggle-dot-active' : ''}`} />
        </button>

        <div 
          style={{ 
            opacity: isRightPanelCollapsed ? 0 : 1, 
            visibility: isRightPanelCollapsed ? 'hidden' : 'visible',
            transition: 'opacity 0.25s ease, visibility 0.25s ease',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.25rem',
            width: '100%',
            minWidth: 0
          }}
        >
          {/* Metadata Card */}
          <div className="sr-card" style={{ padding: '1rem', minWidth: 0 }}>
            <div className="sr-flex-between" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span className="sr-label">SCENARIO DESCRIPTION</span>
              
              <button 
                onClick={handleToggleInspectorPanel}
                className="sr-btn"
                style={{ 
                  padding: '0.25rem 0.6rem', 
                  fontSize: '0.75rem', 
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
              <div className="sr-form-group" style={{ minWidth: 0 }}>
                <label className="sr-label">Scenario Name</label>
                <input 
                  type="text" 
                  className="sr-input" 
                  value={scenario.name} 
                  onChange={(e) => setScenario(new ScenarioModel({ ...scenario, name: e.target.value }))} 
                />
              </div>
              <div className="sr-form-group" style={{ minWidth: 0 }}>
                <label className="sr-label">Description</label>
                <textarea 
                  className="sr-input sr-textarea-vertical" 
                  rows={2} 
                  value={scenario.description} 
                  onChange={(e) => setScenario(new ScenarioModel({ ...scenario, description: e.target.value }))} 
                />
              </div>
            </div>
          </div>

          {/* Base Components List */}
          <div style={{ minWidth: 0 }}>
            <div className="sr-flex-between" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div className="sr-flex-gap">
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
                  <div className="sr-dropdown-menu" style={{ width: '180px' }}>
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

            {/* Component Cards with Expandable Detailed Editors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
              {scenario.baseComponents.map((comp, idx) => {
                let badgeClass = 'sr-badge-purple';
                if (comp.type === 'nodeGraph') badgeClass = 'sr-badge-orange';
                else if (comp.type === 'dbTable') badgeClass = 'sr-badge-green';

                const isExpanded = Boolean(expandedCompIds[comp.id]);

                return (
                  <div key={comp.id || idx} className="sr-card" style={{ padding: '0.85rem', minWidth: 0 }}>
                    <div className="sr-flex-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div className="sr-flex-gap" style={{ flex: '1 1 160px', minWidth: 0 }}>
                        <span className={`sr-badge ${badgeClass}`} style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                          {comp.type}
                        </span>
                        
                        <input 
                          type="text" 
                          className="sr-input" 
                          style={{ padding: '0.2rem 0.4rem', fontSize: '0.85rem', fontWeight: 600, width: '100%', minWidth: 0 }}
                          value={comp.title || ''} 
                          onChange={(e) => updateBaseComponent(idx, { ...comp, title: e.target.value })} 
                          placeholder="Component Title"
                        />
                      </div>

                      <div className="sr-flex-gap-sm" style={{ flexShrink: 0, marginLeft: 'auto' }}>
                        <button 
                          className="sr-btn sr-btn-secondary" 
                          style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }} 
                          onClick={() => toggleComponentExpand(comp.id)}
                        >
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          <span>{isExpanded ? 'Close' : 'Configure'}</span>
                        </button>

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

                    {/* Expandable Isolated Component Editor Container */}
                    {isExpanded && (
                      <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--sr-color-border-subtle)', minWidth: 0 }}>
                        {comp.type === 'form' && (
                          <FormEditor component={comp} onChange={(updated) => updateBaseComponent(idx, updated)} />
                        )}
                        {comp.type === 'dbTable' && (
                          <DbTableEditor component={comp} onChange={(updated) => updateBaseComponent(idx, updated)} />
                        )}
                        {comp.type === 'nodeGraph' && (
                          <NodeGraphEditor component={comp} onChange={(updated) => updateBaseComponent(idx, updated)} onNotification={(notif) => setNotification(notif)} />
                        )}
                      </div>
                    )}
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