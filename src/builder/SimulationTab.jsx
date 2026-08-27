import React, { useState, useEffect } from 'react';
import { Webhook, Network, Database, Play } from 'lucide-react';
import { storageService } from './StorageService';
import InspectorPanel from '../components/InspectorPanel';
import NodeDataFlowDiagram from '../components/NodeDataFlowDiagram';
import LiveDatabaseTable from '../components/LiveDatabaseTable';
import NoScenarioSlate from './components/NoScenarioSlate';

export default function SimulationTab({ onNavigateToBrowser }) {
  const [scenario, setScenario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunningAll, setIsRunningAll] = useState(false);

  // Simulation execution state snapshots
  const [logs, setLogs] = useState([]);
  const [dbRecords, setDbRecords] = useState({}); // Keyed by dbTableId
  const [activePackets, setActivePackets] = useState({}); // Keyed by nodeGraphId -> Array of packets
  const [nodeStates, setNodeStates] = useState({});
  const [edgeStates, setEdgeStates] = useState({});
  const [formData, setFormData] = useState({});

  // 1. Load Simulating Scenario from LocalStorage / StorageService
  useEffect(() => {
    const loadSimulatingScenario = async () => {
      setIsLoading(true);
      const simId = await storageService.getActiveSimulatingScenarioId();

      if (simId) {
        const loaded = await storageService.loadScenario(simId);
        if (loaded) {
          setScenario(loaded);
          const formComp = loaded.baseComponents?.find((c) => c.type === 'form');
          if (formComp && Array.isArray(formComp.fields)) {
            const initialForm = {};
            formComp.fields.forEach((f) => {
              initialForm[f.name] = f.defaultValue || '';
            });
            setFormData(initialForm);
          }
        } else {
          setScenario(null);
        }
      } else {
        setScenario(null);
      }
      setIsLoading(false);
    };

    loadSimulatingScenario();
  }, []);

  const totalSteps = scenario?.steps?.length || 0;
  const isCompleted = currentStep >= totalSteps && totalSteps > 0;

  // 2. Step Execution Engine
  const executeToStep = (targetStepNum) => {
    if (!scenario || targetStepNum > totalSteps || targetStepNum < 0) return;

    let newLogs = [];
    let newDbRecords = {};
    let newActivePackets = {}; // Reset packets per step
    let nodeStateMap = {};
    let edgeStateMap = {}; // Isolated to targetStepNum so edge highlights turn back to grey

    const firstDbTable = scenario.baseComponents?.find((c) => c.type === 'dbTable');
    const firstNodeGraph = scenario.baseComponents?.find((c) => c.type === 'nodeGraph');

    for (let s = 1; s <= targetStepNum; s++) {
      const stepObj = scenario.steps[s - 1];
      if (!stepObj) continue;

      const time = new Date().toLocaleTimeString();

      stepObj.activities?.forEach((act) => {
        const cfg = act.config || {};

        // 1. Node State Updates (Sticky across steps)
        if (act.type === 'NodeUpdate' && cfg.nodeId) {
          nodeStateMap[cfg.nodeId] = cfg.state || 'active';
        }

        // 2. Edge State Updates (Isolated to current step)
        if (act.type === 'EdgeUpdate' && s === targetStepNum) {
          const edgeKey = `${cfg.fromNode}_${cfg.toNode}`;
          edgeStateMap[edgeKey] = { state: cfg.state || 'active', color: cfg.color };
        }

        // 3. Packet Movement Animation (Multi-Packet array support per graph for targetStepNum)
        if (act.type === 'PacketMovement' && s === targetStepNum) {
          const graphId = cfg.nodeGraphId || firstNodeGraph?.id || 'default_graph';
          if (!newActivePackets[graphId]) {
            newActivePackets[graphId] = [];
          }
          newActivePackets[graphId].push({
            fromNode: cfg.fromNode,
            toNode: cfg.toNode,
            label: cfg.label || 'Packet',
            direction: cfg.direction || 'forward',
            color: cfg.color || '#3b82f6',
            key: `pkt-${s}-${act.id || Date.now()}-${Math.random()}`
          });
        }

        // 4. Database Mutations Snapshot (Keyed by Table ID)
        if (act.type === 'dbMutations' && Array.isArray(cfg.records)) {
          const tableId = cfg.dbTableId || firstDbTable?.id;
          if (tableId) {
            newDbRecords[tableId] = cfg.records;
          }
        }

        // 5. Inspector Panel Logs
        if (act.type === 'inspectorPanelEntry') {
          let payload = null;
          if (cfg.payloadText) {
            try {
              payload = JSON.parse(cfg.payloadText);
            } catch {
              payload = cfg.payloadText;
            }
          }
          newLogs.push({
            id: `${s}-${act.id || Date.now()}-${Math.random()}`,
            time,
            title: cfg.title || act.name || `Step ${s} Log`,
            details: cfg.details || '',
            payload,
            statusType: cfg.statusType || 'action'
          });
        }
      });
    }

    setLogs(newLogs);
    setDbRecords(newDbRecords);
    setActivePackets(newActivePackets);
    setNodeStates(nodeStateMap);
    setEdgeStates(edgeStateMap);
    setCurrentStep(targetStepNum);
  };

  // 3. Auto-play Step Loop
  useEffect(() => {
    let timer;
    if (isRunningAll && currentStep < totalSteps) {
      timer = setTimeout(() => executeToStep(currentStep + 1), 1200);
    } else if (currentStep >= totalSteps) {
      setIsRunningAll(false);
    }
    return () => clearTimeout(timer);
  }, [isRunningAll, currentStep, totalSteps]);

  // 4. Action Handlers
  const handleReset = () => {
    setCurrentStep(0);
    setLogs([]);
    setDbRecords({});
    setActivePackets({});
    setNodeStates({});
    setEdgeStates({});
    setIsRunningAll(false);
  };

  const handleStartOrNextStep = (e) => {
    if (e) e.preventDefault();
    if (currentStep === 0) {
      executeToStep(1);
    } else if (!isCompleted) {
      executeToStep(currentStep + 1);
    }
  };

  const handleRunStep = () => {
    if (!isCompleted) executeToStep(currentStep + 1);
  };

  const handleToggleRunAll = () => {
    if (isCompleted) return;
    if (isRunningAll) {
      setIsRunningAll(false);
    } else {
      setIsRunningAll(true);
      if (currentStep === 0) executeToStep(1);
    }
  };

  if (!isLoading && !scenario) {
    return (
      <NoScenarioSlate 
        onNavigateToBrowser={onNavigateToBrowser}
        isEditor={false} 
      />
    );
  }

  if (isLoading || !scenario) {
    return (
      <div className="sr-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--sr-color-text-muted)' }}>Loading simulation scenario...</p>
      </div>
    );
  }

  // Base Component Categories
  const formComp = scenario.baseComponents?.find((c) => c.type === 'form');
  const nodeGraphComps = scenario.baseComponents?.filter((c) => c.type === 'nodeGraph') || [];
  const dbTableComps = scenario.baseComponents?.filter((c) => c.type === 'dbTable') || [];

  return (
    <div className="sr-main-split">
      {/* LEFT PANEL */}
      <section className="sr-panel sr-panel-left" style={{ overflowY: 'auto' }}>
        <div className="sr-panel-content" style={{ width: '100%', maxWidth: 'none', display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '2rem' }}>
          
          {/* Section 1: Header Description & Form Component */}
          <div>
            <div className="sr-section-header">
              <span className="sr-badge sr-badge-blue">Live Simulation Mode</span>
              <h2 className="sr-title">{scenario.name}</h2>
              <p className="sr-subtitle">{scenario.description || 'Observe API triggers, packet movements, and database updates in real time.'}</p>
            </div>

            {formComp ? (
              <form onSubmit={handleStartOrNextStep} className="sr-card sr-form">
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 600 }}>{formComp.title}</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  {formComp.fields?.map((field) => (
                    <div key={field.name} className="sr-form-group">
                      <label className="sr-label">{field.label || field.name}</label>
                      <input 
                        type={field.type === 'int' ? 'number' : field.type === 'email' ? 'email' : 'text'} 
                        className="sr-input" 
                        value={formData[field.name] ?? ''} 
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} 
                        disabled={currentStep > 0} 
                      />
                    </div>
                  ))}
                </div>

                <div className="sr-form-actions">
                  <button 
                    type="submit" 
                    disabled={isCompleted || isRunningAll} 
                    className={`sr-btn ${!isCompleted && !isRunningAll ? 'sr-btn-primary' : 'sr-btn-disabled'}`}
                  >
                    <span>
                      {currentStep === 0 
                        ? 'Trigger Simulation' 
                        : isCompleted 
                        ? 'Workflow Completed' 
                        : `Next Step (${currentStep + 1}/${totalSteps})`}
                    </span>
                    {currentStep === 0 && <Webhook className="sr-icon-sm" />}
                  </button>
                </div>
              </form>
            ) : (
              <div className="sr-card sr-flex-between" style={{ padding: '1rem 1.25rem' }}>
                <div>
                  <span className="sr-label">SIMULATION CONTROL</span>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--sr-color-text-muted)' }}>
                    {currentStep === 0 ? 'Ready to execute scenario timeline.' : `Currently at Step ${currentStep} of ${totalSteps}`}
                  </p>
                </div>
                <button 
                  onClick={handleStartOrNextStep} 
                  disabled={isCompleted || isRunningAll} 
                  className={`sr-btn ${!isCompleted && !isRunningAll ? 'sr-btn-primary' : 'sr-btn-disabled'}`}
                >
                  <Play size={14} />
                  <span>{currentStep === 0 ? 'Start Simulation' : isCompleted ? 'Completed' : `Step ${currentStep + 1}`}</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Node Data Flow Diagrams */}
          {nodeGraphComps.map((graph) => {
            const processedNodes = (graph.nodes || []).map((node) => ({
              ...node,
              stepStates: [nodeStates[node.id] || 'inactive']
            }));

            const processedEdges = (graph.edges || []).map((edge) => {
              const key = `${edge.from}_${edge.to}`;
              const edgeInfo = edgeStates[key];
              return {
                ...edge,
                stepStates: [edgeInfo?.state || 'inactive'],
                color: edgeInfo?.color
              };
            });

            const activeGraphPackets = activePackets[graph.id] || [];

            return (
              <div key={graph.id}>
                <div className="sr-subheading-group">
                  <Network size={18} style={{ color: '#3b82f6' }} />
                  <h3 className="sr-subheading-title">{graph.title || 'System Node Architecture'}</h3>
                </div>
                <NodeDataFlowDiagram 
                  nodes={processedNodes} 
                  edges={processedEdges}
                  activeStep={0} 
                  activePacket={activeGraphPackets} 
                />
              </div>
            );
          })}

          {/* Section 3: Live Database Tables */}
          {dbTableComps.map((table) => {
            const recordsForTable = dbRecords[table.id] || [];

            return (
              <div key={table.id} style={{ paddingBottom: '1rem' }}>
                <div className="sr-subheading-group">
                  <Database size={18} style={{ color: '#10b981' }} />
                  <h3 className="sr-subheading-title">{table.title || 'Database Table Sync'}</h3>
                </div>
                <LiveDatabaseTable 
                  tableName={table.tableName || table.title}
                  records={recordsForTable} 
                  columns={table.dbColumns?.filter((c) => !c.isFixed) || []} 
                />
              </div>
            );
          })}

        </div>
      </section>

      {/* RIGHT PANEL */}
      {scenario.inspectorPanelEnabled && (
        <InspectorPanel
          badgeText="API Inspector"
          title="Real-Time Event Processing"
          subtitle="Observe live payloads and multi-node downstream triggers."
          logs={logs}
          isCompleted={isCompleted}
          isRunningAll={isRunningAll}
          isLoading={isLoading}
          onRunStep={handleRunStep}
          onToggleRunAll={handleToggleRunAll}
          onReset={handleReset}
        />
      )}
    </div>
  );
}