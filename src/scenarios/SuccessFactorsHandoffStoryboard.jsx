import React, { useState, useEffect } from 'react';
import { Building2, FileCheck, Network, Database } from 'lucide-react';
import InspectorPanel from '../components/InspectorPanel';
import NodeDataFlowDiagram from '../components/NodeDataFlowDiagram';
import LiveDatabaseTable from '../components/LiveDatabaseTable';

export default function SuccessFactorsHandoffStoryboard() {
  const TOTAL_STEPS = 4;

  const FLOW_NODES = [
    { id: 'ats', label: 'SmartRecruiters ATS', sublabel: 'Recruiter UI', icon: 'globe', stepStates: ['inactive', 'active', 'completed', 'completed', 'completed'] },
    { id: 'event_bus', label: 'Event Bus', sublabel: 'candidate.hired Webhook', icon: 'workflow', stepStates: ['inactive', 'inactive', 'active', 'completed', 'completed'] },
    { id: 'cpi', label: 'SAP CPI Middleware', sublabel: 'OData Transformation', icon: 'server', stepStates: ['inactive', 'inactive', 'inactive', 'active', 'completed'] },
    { id: 'sf_db', label: 'SuccessFactors EC', sublabel: 'Pending Hires Queue', icon: 'database', stepStates: ['inactive', 'inactive', 'inactive', 'inactive', 'updated'] }
  ];

  const DB_COLUMNS = [
    { key: 'personIdExternal', label: 'PERSON_ID' },
    { key: 'name', label: 'EMPLOYEE_NAME' },
    { key: 'department', label: 'COST_CENTER' },
    { key: 'manager', label: 'MANAGER_ID' },
    { key: 'status', label: 'HIRE_STATUS' }
  ];

  const [candidate, setCandidate] = useState({
    name: 'Sarah Jenkins',
    role: 'Senior Enterprise Architect',
    salary: '165000',
    currency: 'USD',
    costCenter: 'CC-1002 (IT Operations)',
    managerId: 'EMP-88402 (David Miller)',
    startDate: '2026-09-01'
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

  const handleInputChange = (field, value) => setCandidate((prev) => ({ ...prev, [field]: value }));

  const executeStep = (stepNumber) => {
    if (stepNumber > TOTAL_STEPS) return;
    const time = new Date().toLocaleTimeString();

    if (stepNumber === 1) {
      setActivePacket({ fromNode: 'ats', toNode: 'event_bus', label: 'Status: HIRED', key: `pkt-1-${Date.now()}` });
      setLogs((prev) => [...prev, {
        id: Date.now(), time,
        title: 'Recruiter Action: Candidate Status Updated to HIRED',
        details: `Candidate [${candidate.name}] moved to final Hired stage on job requisition [JOB-7712].`,
        payload: null, statusType: 'action'
      }]);
    } else if (stepNumber === 2) {
      setActivePacket({ fromNode: 'event_bus', toNode: 'cpi', label: 'candidate.hired Webhook', key: `pkt-2-${Date.now()}` });
      setLogs((prev) => [...prev, {
        id: Date.now(), time,
        title: 'SmartRecruiters Event: candidate.hired (Webhook)',
        details: 'SmartRecruiters fires real-time event JSON payload to registered SAP CPI webhook endpoint.',
        payload: { eventId: 'evt_9988776655', eventType: 'candidate.hired', candidateId: 'cand_44332211-uuid', jobId: 'JOB-7712', offerData: { candidateName: candidate.name, jobTitle: candidate.role, baseSalary: Number(candidate.salary) || candidate.salary, currency: candidate.currency, startDate: candidate.startDate, costCenter: candidate.costCenter, managerId: candidate.managerId } },
        statusType: 'process'
      }]);
    } else if (stepNumber === 3) {
      setActivePacket({ fromNode: 'cpi', toNode: 'sf_db', label: 'EmpEmployment OData', key: `pkt-3-${Date.now()}` });
      setLogs((prev) => [...prev, {
        id: Date.now(), time,
        title: 'SAP CPI Middleware: Field Transformation & OData Mapping',
        details: 'SAP Integration Suite maps SmartRecruiters JSON properties to SuccessFactors Employee Central OData API fields.',
        payload: { sfEntity: 'EmpEmployment', mappedFields: { personIdExternal: 'PENDING_cand_44332211', startDate: candidate.startDate, department: candidate.costCenter, manager: candidate.managerId, compensation: `${candidate.salary} ${candidate.currency}` } },
        statusType: 'process'
      }]);
    } else if (stepNumber === 4) {
    setActivePacket({ fromNode: 'cpi', toNode: 'sf_db', label: 'INSERT Pending Hire', color: '#10b981', key: `pkt-4-${Date.now()}` });

      setDbRecords([
        {
          id: 1,
          personIdExternal: 'SF_EMP_2026_9012',
          name: candidate.name,
          department: candidate.costCenter,
          manager: candidate.managerId,
          status: 'READY_FOR_ONBOARDING',
          _rowStatus: 'added'
        }
      ]);

      setLogs((prev) => [...prev, {
        id: Date.now(), time,
        title: 'SAP SuccessFactors: 201 Created (Manage Pending Hires)',
        details: 'Data successfully written to SuccessFactors EC queue. Profile ready for pre-onboarding.',
        payload: { status: 201, statusText: 'Created', sfRecord: { personIdExternal: 'SF_EMP_2026_9012', pendingHireStatus: 'READY_FOR_ONBOARDING', assignedOnboardingWorkflow: 'US_CORP_ONBOARDING_V2' } },
        statusType: 'success'
      }]);
    }

    setCurrentStep(stepNumber);
  };

  const handleHiredSimulationSubmit = (e) => {
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
        <div className="sr-panel-content" style={{ width: '100%', maxWidth: 'none', display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '2rem' }}>
          
          {/* Section 1: Form Inputs */}
          <div>
            <div className="sr-section-header">
              <span className="sr-badge sr-badge-blue">Front-End Experience</span>
              <h2 className="sr-title">Offer Accepted & Hiring Action</h2>
              <p className="sr-subtitle">Customize candidate data, then run the simulation to inspect the API payloads.</p>
            </div>

            <form onSubmit={handleHiredSimulationSubmit} className="sr-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="sr-icon-wrapper-primary"><Building2 className="sr-icon" /></div>
                <div style={{ flex: 1 }}>
                  <input type="text" className="sr-input" style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }} value={candidate.name} onChange={(e) => handleInputChange('name', e.target.value)} disabled={currentStep > 0} placeholder="Candidate Name" />
                  <input type="text" className="sr-input" style={{ fontSize: '0.8rem' }} value={candidate.role} onChange={(e) => handleInputChange('role', e.target.value)} disabled={currentStep > 0} placeholder="Job Title" />
                </div>
              </div>

              <div className="sr-form" style={{ marginBottom: '1.25rem' }}>
                <div className="sr-form-group"><label className="sr-label">Base Salary</label><input type="text" className="sr-input" value={candidate.salary} onChange={(e) => handleInputChange('salary', e.target.value)} disabled={currentStep > 0} /></div>
                <div className="sr-form-group"><label className="sr-label">SAP Cost Center</label><input type="text" className="sr-input" value={candidate.costCenter} onChange={(e) => handleInputChange('costCenter', e.target.value)} disabled={currentStep > 0} /></div>
                <div className="sr-form-group"><label className="sr-label">Reporting Manager ID</label><input type="text" className="sr-input" value={candidate.managerId} onChange={(e) => handleInputChange('managerId', e.target.value)} disabled={currentStep > 0} /></div>
                <div className="sr-form-group"><label className="sr-label">Target Start Date</label><input type="date" className="sr-input" value={candidate.startDate} onChange={(e) => handleInputChange('startDate', e.target.value)} disabled={currentStep > 0} /></div>
              </div>

              <div className="sr-form-actions">
                <button type="submit" disabled={isCompleted || isRunningAll} className={`sr-btn ${!isCompleted && !isRunningAll ? 'sr-btn-primary' : 'sr-btn-disabled'}`}>
                  <span>{currentStep === 0 ? 'Mark Candidate as Hired' : isCompleted ? 'Handoff Completed' : `Next Step (${currentStep + 1}/${TOTAL_STEPS})`}</span>
                  <FileCheck className="sr-icon-sm" />
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Node Data Flow */}
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

          {/* Section 3: Live Database Sync */}
          <div style={{ paddingBottom: '2rem' }}>
            <div className="sr-subheading-group">
              <Database size={18} style={{ color: '#10b981' }} />
              <h3 className="sr-subheading-title">
                SuccessFactors EC DB Sync
              </h3>
            </div>
            <LiveDatabaseTable 
              tableName="SuccessFactors EC (Manage Pending Hires)"
              records={dbRecords} 
              columns={DB_COLUMNS} // no needed.
            />
          </div>

        </div>
      </section>

      {/* RIGHT PANEL */}
      <InspectorPanel
        badgeText="Integration Suite (CPI Bridge)"
        title="SmartRecruiters ➔ SuccessFactors Flow"
        subtitle="Inspect how Webhook triggers convert into SuccessFactors OData API records."
        logs={logs}
        isCompleted={isCompleted}
        isRunningAll={isRunningAll}
        onRunStep={handleRunStep}
        onToggleRunAll={handleToggleRunAll}
      />
    </div>
  );
}