import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  UserCheck, 
  Building2, 
  Workflow, 
  FileCheck,
  ArrowLeftCircleIcon
} from 'lucide-react';

export default function SuccessFactorsHandoffStoryboard() {
  // Editable Candidate State
  const [candidate, setCandidate] = useState({
    name: 'Sarah Jenkins',
    role: 'Senior Enterprise Architect',
    salary: '165000',
    currency: 'USD',
    costCenter: 'CC-1002 (IT Operations)',
    managerId: 'EMP-88402 (David Miller)',
    startDate: '2026-09-01'
  });

  const [status, setStatus] = useState('idle'); // idle | webhook | cpi_transform | complete
  const [logs, setLogs] = useState([]);

  // Handler for dynamic input updates
  const handleInputChange = (field, value) => {
    setCandidate((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const addLog = (title, details, payload = null, statusType = 'info') => {
    setLogs((prev) => [
      ...prev,
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        title,
        details,
        payload,
        statusType
      }
    ]);
  };

  const runHiredSimulation = async (e) => {
    e.preventDefault();
    setLogs([]);

    // Step 1: Recruiter Action inside SmartRecruiters
    setStatus('webhook');
    addLog(
      'Recruiter Action: Candidate Status Updated to HIRED',
      `Candidate [${candidate.name}] moved to final Hired stage on job requisition [JOB-7712].`,
      null,
      'action'
    );

    // Step 2: SmartRecruiters Outbound Webhook Event
    await new Promise((res) => setTimeout(res, 900));
    setStatus('cpi_transform');
    addLog(
      'SmartRecruiters Event: candidate.hired (Webhook)',
      'SmartRecruiters fires real-time event JSON payload to registered SAP CPI webhook endpoint.',
      {
        eventId: 'evt_9988776655',
        eventType: 'candidate.hired',
        candidateId: 'cand_44332211-uuid',
        jobId: 'JOB-7712',
        offerData: {
          candidateName: candidate.name,
          jobTitle: candidate.role,
          baseSalary: Number(candidate.salary) || candidate.salary,
          currency: candidate.currency,
          startDate: candidate.startDate,
          costCenter: candidate.costCenter,
          managerId: candidate.managerId
        }
      },
      'process'
    );

    // Step 3: SAP Integration Suite (CPI) Transformation
    await new Promise((res) => setTimeout(res, 1100));
    setStatus('complete');
    addLog(
      'SAP CPI Middleware: Field Transformation & OData Mapping',
      'SAP Integration Suite maps SmartRecruiters JSON properties to SuccessFactors Employee Central OData API fields.',
      {
        sfEntity: 'EmpEmployment',
        mappedFields: {
          personIdExternal: 'PENDING_cand_44332211',
          startDate: candidate.startDate,
          department: candidate.costCenter,
          manager: candidate.managerId,
          compensation: `${candidate.salary} ${candidate.currency}`
        }
      },
      'process'
    );

    // Step 4: SuccessFactors Confirmation
    await new Promise((res) => setTimeout(res, 1000));
    setStatus('idle'); // Re-enable fields once simulation finishes
    addLog(
      'SAP SuccessFactors: 201 Created (Manage Pending Hires)',
      'Data successfully written to SuccessFactors EC queue. Profile ready for pre-onboarding.',
      {
        status: 201,
        statusText: 'Created',
        sfRecord: {
          personIdExternal: 'SF_EMP_2026_9012',
          pendingHireStatus: 'READY_FOR_ONBOARDING',
          assignedOnboardingWorkflow: 'US_CORP_ONBOARDING_V2'
        }
      },
      'success'
    );
  };

  // Inputs are editable when idle, disabled during simulation running
  const isSimulationRunning = status !== 'idle';

  return (
    <div className="sr-main-split">
      {/* LEFT PANEL: Recruiter Action UI */}
      <section className="sr-panel sr-panel-left">
        <div className="sr-panel-content">
          <div className="sr-section-header">
            <span className="sr-badge sr-badge-blue">Front-End Experience</span>
            <h2 className="sr-title">Offer Accepted & Hiring Action</h2>
            <p className="sr-subtitle">Customize candidate data, then run the simulation to inspect the API payloads.</p>
          </div>

          <form onSubmit={runHiredSimulation} className="sr-card">
            {/* Candidate Header Summary */}
            <div style={{ display: 'flex', items: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div className="sr-icon-wrapper-primary">
                <Building2 className="sr-icon" />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  className="sr-input"
                  style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}
                  value={candidate.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isSimulationRunning}
                  placeholder="Candidate Name"
                />
                <input
                  type="text"
                  className="sr-input"
                  style={{ fontSize: '0.8rem' }}
                  value={candidate.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  disabled={isSimulationRunning}
                  placeholder="Job Title"
                />
              </div>
            </div>

            {/* Editable Form Fields */}
            <div className="sr-form" style={{ marginBottom: '1.25rem' }}>
              <div className="sr-form-group">
                <label className="sr-label">Base Salary</label>
                <input 
                  type="text" 
                  className="sr-input" 
                  value={candidate.salary} 
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  disabled={isSimulationRunning} 
                />
              </div>

              <div className="sr-form-group">
                <label className="sr-label">SAP Cost Center</label>
                <input 
                  type="text" 
                  className="sr-input" 
                  value={candidate.costCenter} 
                  onChange={(e) => handleInputChange('costCenter', e.target.value)}
                  disabled={isSimulationRunning} 
                />
              </div>

              <div className="sr-form-group">
                <label className="sr-label">Reporting Manager ID</label>
                <input 
                  type="text" 
                  className="sr-input" 
                  value={candidate.managerId} 
                  onChange={(e) => handleInputChange('managerId', e.target.value)}
                  disabled={isSimulationRunning} 
                />
              </div>

              <div className="sr-form-group">
                <label className="sr-label">Target Start Date</label>
                <input 
                  type="date" 
                  className="sr-input" 
                  value={candidate.startDate} 
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  disabled={isSimulationRunning} 
                />
              </div>
            </div>

            <div className="sr-form-actions">
              <button
                type="submit"
                disabled={isSimulationRunning}
                className={`sr-btn ${!isSimulationRunning ? 'sr-btn-primary' : 'sr-btn-disabled'}`}
              >
                <span>
                  {!isSimulationRunning 
                    ? 'Mark Candidate as Hired' 
                    : 'Processing Handoff Payload...'}
                </span>
                <FileCheck className="sr-icon-sm" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* RIGHT PANEL: Middleware & API Inspector */}
      <section className="sr-panel sr-panel-right">
        <div className="sr-section-header">
          <span className="sr-badge sr-badge-green">Integration Suite (CPI Bridge)</span>
          <h2 className="sr-title">SmartRecruiters ➔ SuccessFactors Flow</h2>
          <p className="sr-subtitle">Inspect how Webhook triggers convert into SuccessFactors OData API records.</p>
        </div>

        <div className="sr-log-timeline">
          {logs.length === 0 ? (
            <div className="sr-empty-state">
              <ArrowLeftCircleIcon className="sr-icon-lg sr-pulse" />
              <p>Click "Mark Candidate as Hired" on the left to trigger the webhook flow.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className={`sr-log-card sr-log-${log.statusType}`}>
                <div className="sr-log-header">
                  <div className="sr-log-title-group">
                    {log.statusType === 'success' ? (
                      <CheckCircle2 className="sr-icon-sm sr-text-success" />
                    ) : log.statusType === 'action' ? (
                      <UserCheck className="sr-icon-sm sr-text-blue" />
                    ) : (
                      <Workflow className="sr-icon-sm sr-text-purple" />
                    )}
                    <h3 className="sr-log-title">{log.title}</h3>
                  </div>
                  <span className="sr-log-time">{log.time}</span>
                </div>

                <p className="sr-log-details">{log.details}</p>

                {log.payload && (
                  <div className="sr-code-block">
                    <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}