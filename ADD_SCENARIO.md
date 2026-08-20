# Developer Guide: Creating & Registering New Storyboard Scenarios

This guide details how to build, configure, and register a new integration scenario storyboard within the application using the standardized multi-node data flow, live database sync, and API inspector architecture.

---

## Project Directory Structure

```text
src/
├── components/
│   └── InspectorPanel.jsx             # Reusable API timeline inspector panel
│   └── LiveDatabaseTable.jsx          # Reusable Database update panel
│   └── NodeDataFlowDiagram.jsx        # Reusable Node to Node data flow diagram
├── scenarios/
│   ├── CandidateApplicationStoryboard.jsx   # Candidate site application flow
│   ├── SuccessFactorsHandoffStoryboard.jsx  # Webhook to SAP SuccessFactors flow
│   └── GoogleSheetImportStoryboard.jsx      # Google Sheet batch sourcing flow
│   └── WebhookSubscriptionStoryboard.jsx    # Webhook subscription data flow
├── App.jsx                            # Main shell app well new scenarios are added
├── index.css                          # Global dark mode styles & dark scrollbars
└── main.jsx                           # Application entry point

```

---

## 1. Scenario Architecture Overview

Every storyboard scenario lives in `src/storyboards/` and follows a split-panel design:

* **Left Panel (`sr-panel-left`)**: Houses the scenario configuration form, the animated **`NodeDataFlowDiagram`**, and the **`LiveDatabaseTable`**.
* **Right Panel (`InspectorPanel`)**: Houses real-time execution logs, code payload previews, and simulation play/pause/step controls.

---

## 2. Step-by-Step Implementation Guide

### Step 1: Create the Storyboard Component File

Create a new file in `src/storyboards/` (e.g., `src/storyboards/MyNewScenarioStoryboard.jsx`).

### Step 2: Define Topology & Database Schema Constants

At the top of your component, define your step count, diagram nodes, edges, and database table columns:

```javascript
const TOTAL_STEPS = 4;

// Define System Diagram Nodes & State Arrays
const FLOW_NODES = [
  { 
    id: 'source_system', 
    label: 'Source Portal', 
    sublabel: 'User Interface', 
    icon: 'globe', 
    col: 1, 
    stepStates: ['inactive', 'active', 'completed', 'completed', 'completed'] 
  },
  { 
    id: 'middleware', 
    label: 'API Middleware', 
    sublabel: 'Data Mapper', 
    icon: 'workflow', 
    col: 2, 
    stepStates: ['inactive', 'inactive', 'active', 'completed', 'completed'] 
  },
  { 
    id: 'target_db', 
    label: 'Target DB', 
    sublabel: 'PostgreSQL', 
    icon: 'database', 
    col: 3, 
    stepStates: ['inactive', 'inactive', 'inactive', 'updated', 'completed'] 
  }
];

// Define Connection Edges
const FLOW_EDGES = [
  { from: 'source_system', to: 'middleware' },
  { from: 'middleware', to: 'target_db' }
];

// Define Live Database Columns
const DB_COLUMNS = [
  { key: 'recordId', label: 'RECORD_ID' },
  { key: 'name', label: 'NAME' },
  { key: 'status', label: 'STATUS' }
];

```

#### Supported Node Icons:

`'globe'`, `'workflow'`, `'server'`, `'database'`, `'sheet'`

#### Step State Options:

`'inactive'` (gray) | `'active'` (blue outline) | `'completed'` (green) | `'updated'` (orange outline) | `'error'` (red)

---

### Step 3: Initialize State & Auto-Run Loop

Set up the standardized state hooks and auto-play timer:

```javascript
export default function MyNewScenarioStoryboard() {
  const [formData, setFormData] = useState({ name: 'Sample Entry' });
  const [logs, setLogs] = useState([]);
  const [dbRecords, setDbRecords] = useState([]);
  const [activePacket, setActivePacket] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const isCompleted = currentStep >= TOTAL_STEPS;

  // Auto-advance loop when "Run All" is active
  useEffect(() => {
    let timer;
    if (isRunningAll && currentStep > 0 && currentStep < TOTAL_STEPS) {
      timer = setTimeout(() => executeStep(currentStep + 1), 1200);
    } else if (currentStep >= TOTAL_STEPS) {
      setIsRunningAll(false);
    }
    return () => clearTimeout(timer);
  }, [isRunningAll, currentStep]);

```

---

### Step 4: Implement `executeStep` Simulation Logic

Define what happens during each step of the workflow. Each step should trigger an animated data packet, append a log to the inspector panel, and optionally update the database table:

```javascript
  const executeStep = (stepNumber) => {
    if (stepNumber > TOTAL_STEPS) return;
    const time = new Date().toLocaleTimeString();

    if (stepNumber === 1) {
      // Dispatch Animated Data Packet
      setActivePacket({ 
        fromNode: 'source_system', 
        toNode: 'middleware', 
        label: 'POST /submit', 
        key: `pkt-1-${Date.now()}` 
      });

      // Push Log to Right Panel
      setLogs((prev) => [...prev, {
        id: Date.now(),
        time,
        title: 'Step 1: Data Submitted',
        details: 'User initiated data transfer.',
        payload: formData,
        statusType: 'action' // 'action' | 'process' | 'success'
      }]);
    } 
    else if (stepNumber === 2) {
      // Dispatch Packet & Update Live Database
      setActivePacket({ 
        fromNode: 'middleware', 
        toNode: 'target_db', 
        label: 'INSERT Row', 
        color: '#10b981', 
        key: `pkt-2-${Date.now()}` 
      });

      setDbRecords([
        {
          id: 1,
          recordId: 'REC-1001',
          name: formData.name,
          status: 'ACTIVE',
          _rowStatus: 'added' // 'added' (green) | 'updated' (yellow) | 'deleted' (red)
        }
      ]);

      setLogs((prev) => [...prev, {
        id: Date.now(),
        time,
        title: 'Step 2: Database Synchronized',
        details: 'Record successfully written to target database.',
        payload: { status: 201, recordId: 'REC-1001' },
        statusType: 'success'
      }]);
    }

    setCurrentStep(stepNumber);
  };

```

---

### Step 5: Render UI Components & Layout

Wire up the split layout utilizing the standard CSS utility classes (`sr-subheading-group`, `sr-subheading-title`, `sr-section-padded`):

```jsx
  return (
    <div className="sr-main-split">
      {/* LEFT PANEL */}
      <section className="sr-panel sr-panel-left" style={{ overflowY: 'auto' }}>
        <div className="sr-panel-content" style={{ width: '100%', maxWidth: 'none', display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '2rem' }}>
          
          {/* Section 1: User Form */}
          <div>
            <div className="sr-section-header">
              <span className="sr-badge sr-badge-blue">Scenario Category</span>
              <h2 className="sr-title">Scenario Title</h2>
              <p className="sr-subtitle">Description of the workflow simulation.</p>
            </div>
            {/* Input Form Fields and Submit Button */}
          </div>

          {/* Section 2: Node Data Flow Diagram */}
          <div>
            <div className="sr-subheading-group">
              <Network size={18} style={{ color: '#3b82f6' }} />
              <h3 className="sr-subheading-title">System Node Architecture</h3>
            </div>
            <NodeDataFlowDiagram 
              nodes={FLOW_NODES} 
              edges={FLOW_EDGES}
              activeStep={currentStep} 
              activePacket={activePacket} 
            />
          </div>

          {/* Section 3: Live Database Sync */}
          <div className="sr-section-padded">
            <div className="sr-subheading-group">
              <Database size={18} style={{ color: '#10b981' }} />
              <h3 className="sr-subheading-title">Database Records</h3>
            </div>
            <LiveDatabaseTable 
              tableName="Target DB (records_table)"
              records={dbRecords} 
              columns={DB_COLUMNS} 
            />
          </div>

        </div>
      </section>

      {/* RIGHT PANEL */}
      <InspectorPanel
        badgeText="Execution Inspector"
        title="Real-Time Payload Execution"
        subtitle="Displays JSON payloads and event logs."
        logs={logs}
        isCompleted={isCompleted}
        isRunningAll={isRunningAll}
        onRunStep={() => executeStep(currentStep + 1)}
        onToggleRunAll={() => setIsRunningAll(!isRunningAll)}
      />
    </div>
  );
}

```

---

### Step 6: Register Scenario in `App.jsx`

Import your new storyboard component into `App.jsx` and add it to the tab/view navigation array:

```jsx
import MyNewScenarioStoryboard from './storyboards/MyNewScenarioStoryboard';

// Add tab option to state / tab selection list
const TABS = [
  { id: 'candidate', label: 'Candidate Application', component: CandidateApplicationStoryboard },
  { id: 'webhook', label: 'Webhook Subscription', component: WebhookSubscriptionStoryboard },
  { id: 'my-new-scenario', label: 'My New Scenario', component: MyNewScenarioStoryboard }
];

```


```jsx
<main className="sr-content-area">
  {activeTab === 'candidate-app' && (
    <CandidateApplicationStoryboard key={resetKey} />
  )}

  {activeTab === 'my-new-scenario' && (
    <MyNewScenarioStoryboard key={resetKey} />
  )}

  {activeTab === 'Empty Tab' && (
    <div className="sr-empty-state-tab">
      <h2>Auto Self-Scheduling Scenario</h2>
      <p>Ready to build: Real-time calendar availability lookup & booking API workflow.</p>
    </div>
  )}
</main>
```