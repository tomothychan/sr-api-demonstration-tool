Here is the fully refactored, universal **`NodeDataFlowDiagram.jsx`** component.

It is now 100% declarative and prop-driven. Anyone can build **any topology** (linear pipelines, multi-branch trees, parallel nodes, two-way request/response handshakes) simply by supplying custom `nodes` and `edges` props—no hardcoded node IDs or rigid layout assumptions.

---

### How to Build Any Scenario via Props

**1. Simple Linear Scenario (Candidate Application, Sheet Import, SF Handoff)**
No `col`, `row`, or `edges` props needed—pass `nodes` in order and it automatically builds sequential pipeline connectors:

```jsx
<NodeDataFlowDiagram 
  nodes={[
    { id: 'client', label: 'Career Site', sublabel: 'React Portal', icon: 'globe', activeSteps: [1] },
    { id: 'wrapper', label: 'API Wrapper', sublabel: 'Payload Mapper', icon: 'workflow', activeSteps: [2] },
    { id: 'sr_api', label: 'SmartRecruiters', sublabel: 'OpenAPI Core', icon: 'server', activeSteps: [3, 4] },
    { id: 'sr_db', label: 'PostgreSQL', sublabel: 'Candidates DB', icon: 'database', activeSteps: [4] }
  ]}
  activeStep={currentStep} 
  activePacket={activePacket} 
/>

```

**2. Custom Multi-Branch & Two-Way Scenario (Webhook Subscription)**
Define layout columns (`col: 1, 2, 3`), rows (`row: 1, 2`), and connections via `edges`:

```jsx
<NodeDataFlowDiagram 
  nodes={[
    { id: 'sr_engine', label: 'SmartRecruiters', sublabel: 'Webhook Engine', icon: 'workflow', col: 1, row: 1, activeSteps: [1,2,3] },
    { id: 'company_server', label: 'Company Server', sublabel: 'Webhook Listener', icon: 'server', col: 2, row: 1, activeSteps: [1,2,3,4,5] },
    { id: 'company_db', label: 'Company DB', sublabel: 'Applicants Table', icon: 'database', col: 3, row: 1, activeSteps: [4] },
    { id: 'bg_agency', label: 'BG Check Agency', sublabel: 'Checkr API', icon: 'globe', col: 3, row: 2, activeSteps: [5] }
  ]}
  edges={[
    { from: 'sr_engine', to: 'company_server' },
    { from: 'company_server', to: 'company_db' },
    { from: 'company_server', to: 'bg_agency' }
  ]}
  activeStep={currentStep} 
  activePacket={activePacket} 
/>

```

**3. Dispatching Two-Way or Custom Color Packets**
Set `fromNode` and `toNode` on `activePacket`. If `fromNode` is in a higher column than `toNode`, the component automatically animates the packet backwards (right-to-left) with a reverse arrow:

```jsx
// Reverse Packet (Company Server -> SR Engine)
setActivePacket({ 
  fromNode: 'company_server', 
  toNode: 'sr_engine', 
  label: 'POST /webhooks/subscribe', 
  color: '#3b82f6', 
  key: `pkt-1-${Date.now()}` 
});

// Forward Branch Packet (Company Server -> BG Check Agency)
setActivePacket({ 
  fromNode: 'company_server', 
  toNode: 'bg_agency', 
  label: 'POST /checkr/orders', 
  color: '#f59e0b', 
  key: `pkt-5-${Date.now()}` 
});

```