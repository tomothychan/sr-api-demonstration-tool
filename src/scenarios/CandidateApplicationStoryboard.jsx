import React, { useState, useEffect } from 'react';
import { Send, Network, Database } from 'lucide-react';
import InspectorPanel from '../components/InspectorPanel';
import NodeDataFlowDiagram from '../components/NodeDataFlowDiagram';
import LiveDatabaseTable from '../components/LiveDatabaseTable';

export default function CandidateApplicationStoryboard() {
  const TOTAL_STEPS = 4;

  const FLOW_NODES = [
    { id: 'client', label: 'Career Portal', sublabel: 'React Front-End', icon: 'globe', activeSteps: [1] },
    { id: 'wrapper', label: 'API Wrapper', sublabel: 'Data Mapper', icon: 'workflow', activeSteps: [2] },
    { id: 'sr_api', label: 'SmartRecruiters', sublabel: 'Open Web API', icon: 'server', activeSteps: [3, 4] },
    { id: 'sr_db', label: 'Candidate DB', sublabel: 'PostgreSQL', icon: 'database', activeSteps: [4] }
  ];

  const DB_COLUMNS = [
    { key: 'candidateId', label: 'CANDIDATE_ID' },
    { key: 'name', label: 'FULL_NAME' },
    { key: 'email', label: 'EMAIL' },
    { key: 'stage', label: 'STAGE' }
  ];

  const [formData, setFormData] = useState({
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@example.com'
  });

  const [logs, setLogs] = useState([]);
  const [dbRecords, setDbRecords] = useState([]);
  const [activePacket, setActivePacket] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const isCompleted = currentStep >= TOTAL_STEPS;

  useEffect(() => {
    let timer;
    if (isRunningAll && currentStep > 0 && currentStep < TOTAL_STEPS) {
      timer = setTimeout(() => executeStep(currentStep + 1), 1000);
    } else if (currentStep >= TOTAL_STEPS) {
      setIsRunningAll(false);
    }
    return () => clearTimeout(timer);
  }, [isRunningAll, currentStep]);

  const executeStep = (stepNumber) => {
    if (stepNumber > TOTAL_STEPS) return;
    const time = new Date().toLocaleTimeString();

    if (stepNumber === 1) {
      setActivePacket({ fromNode: 'client', label: 'Form Payload' });
      setLogs((prev) => [...prev, {
        id: Date.now(), time,
        title: 'Client Action: Form Submitted',
        details: 'Candidate submits job application on custom career site portal.',
        payload: null, statusType: 'action'
      }]);
    } else if (stepNumber === 2) {
      setActivePacket({ fromNode: 'wrapper', label: 'OpenAPI JSON' });
      setLogs((prev) => [...prev, {
        id: Date.now(), time,
        title: 'Data Transformation: Resume & Profile Parsing',
        details: 'Client wrapper converts inputs into SmartRecruiters Open Web API JSON format.',
        payload: { firstName: formData.firstName, lastName: formData.lastName, email: formData.email, consent: { type: 'GDPR', acquired: true } },
        statusType: 'process'
      }]);
    } else if (stepNumber === 3) {
      setActivePacket({ fromNode: 'sr_api', label: 'Dedup Check' });
      setLogs((prev) => [...prev, {
        id: Date.now(), time,
        title: 'API Pre-Check: Email Deduplication Anchoring',
        details: `Querying backend for existing candidate with email [${formData.email}]. Result: No duplicate match.`,
        payload: { query: `email EQ '${formData.email}'`, matchFound: false },
        statusType: 'process'
      }]);
    } else if (stepNumber === 4) {
      setActivePacket({ fromNode: 'sr_api', label: 'INSERT ROW' });
      
      setDbRecords([
        {
          id: 1,
          candidateId: 'cand_987654321',
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          stage: 'NEW',
          _rowStatus: 'added'
        }
      ]);

      setLogs((prev) => [...prev, {
        id: Date.now(), time,
        title: 'HTTP POST /postings/job-7712/candidates',
        details: 'SmartRecruiters processes payload, generates UUIDs, and inserts a new candidate record into PostgreSQL database.',
        payload: { status: 201, statusText: 'Created', data: { candidateId: 'cand_987654321-uuid', applicationId: 'app_1122334455-uuid', currentStage: 'NEW' } },
        statusType: 'success'
      }]);
    }

    setCurrentStep(stepNumber);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 0) {
      setLogs([]);
      setDbRecords([]);
      setActivePacket(null);
      executeStep(1);
    } else if (!isCompleted) {
      executeStep(currentStep + 1);
    }
  };

  const handleRunStep = () => !isCompleted && executeStep(currentStep + 1);

  const handleToggleRunAll = () => {
    if (isCompleted) return;
    if (isRunningAll) {
      setIsRunningAll(false);
    } else {
      setIsRunningAll(true);
      if (currentStep === 0) executeStep(1);
    }
  };

  return (
    <div className="sr-main-split">
      {/* LEFT PANEL */}
      <section className="sr-panel sr-panel-left" style={{ overflowY: 'auto' }}>
        {/* Parent container controls the trailing scroll space */}
        <div className="sr-panel-content" style={{ width: '100%', maxWidth: 'none', display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '6rem' }}>
          {/* Section Header & Interactive Form */}
          <div>
            <div className="sr-section-header">
              <span className="sr-badge sr-badge-blue">Front-End Experience</span>
              <h2 className="sr-title">Career Site Application</h2>
              <p className="sr-subtitle">Simulate how a job seeker interacts with your custom front-end portal.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="sr-card sr-form">
              <div className="sr-form-group">
                <label className="sr-label">First Name</label>
                <input type="text" className="sr-input" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} disabled={currentStep > 0} />
              </div>
              <div className="sr-form-group">
                <label className="sr-label">Last Name</label>
                <input type="text" className="sr-input" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} disabled={currentStep > 0} />
              </div>
              <div className="sr-form-group">
                <label className="sr-label">Email Address</label>
                <input type="email" className="sr-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={currentStep > 0} />
              </div>
              <div className="sr-form-actions">
                <button type="submit" disabled={isCompleted || isRunningAll} className={`sr-btn ${!isCompleted && !isRunningAll ? 'sr-btn-primary' : 'sr-btn-disabled'}`}>
                  <span>{currentStep === 0 ? 'Submit Application' : isCompleted ? 'Simulation Completed' : `Next Step (${currentStep + 1}/${TOTAL_STEPS})`}</span>
                  {currentStep === 0 && <Send className="sr-icon-sm" />}
                </button>
              </div>
            </form>
          </div>

          {/* Node Data Flow Section */}
          <div>
            <div className="sr-subheading-group">
              <Network size={18} style={{ color: '#3b82f6' }} />
              <h3 className="sr-subheading-title">
                System Node Architecture
              </h3>
            </div>
            <NodeDataFlowDiagram 
              nodes={FLOW_NODES} 
              activeStep={currentStep} 
              activePacket={activePacket} 
            />
          </div>

          {/* Live Database Updates Section */}
          <div style={{ paddingBottom: '4rem' }}>
            <div className="sr-subheading-group">
              <Database size={18} style={{ color: '#10b981' }} />
              <h3 className="sr-subheading-title">
                SmartRecruiters DB Sync
              </h3>
            </div>
            <LiveDatabaseTable 
              tableName="SmartRecruiters DB (candidates)"
              records={dbRecords} 
              columns={DB_COLUMNS} 
            />
          </div>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <InspectorPanel
        badgeText="Behind the Scenes (API Inspector)"
        title="Real-Time Data Execution"
        subtitle="Translates user interactions directly into API events, business logic, and JSON payloads."
        logs={logs}
        isCompleted={isCompleted}
        isRunningAll={isRunningAll}
        onRunStep={handleRunStep}
        onToggleRunAll={handleToggleRunAll}
      />
    </div>
  );
}