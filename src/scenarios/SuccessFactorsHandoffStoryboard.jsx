import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  UserCheck, 
  Building2, 
  Workflow, 
  FileCheck,
  ArrowLeftCircleIcon,
  Play,
  Pause,
  StepForward
} from 'lucide-react';

// Custom smooth scroll function with configurable speed (duration in ms)
const smoothScrollTo = (element, targetTop, duration = 1200) => {
  if (!element) return;
  const startTop = element.scrollTop;
  const distance = targetTop - startTop;
  let startTime = null;

  const animation = (currentTime) => {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    // Ease-out cubic curve
    const ease = 1 - Math.pow(1 - progress, 3);
    
    element.scrollTop = startTop + distance * ease;

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};

export default function SuccessFactorsHandoffStoryboard() {
  const TOTAL_STEPS = 4;

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
  const [currentStep, setCurrentStep] = useState(0); // 0 to 4
  const [isRunningAll, setIsRunningAll] = useState(false);

  // Ref attached directly to scrollable timeline container
  const timelineRef = useRef(null);

  // Smooth auto-scroll timeline container whenever logs update
  useEffect(() => {
    if (timelineRef.current) {
      setTimeout(() => {
        smoothScrollTo(timelineRef.current, timelineRef.current.scrollHeight, 350);
      }, 50);
    }
  }, [logs]);

  const isCompleted = currentStep >= TOTAL_STEPS;
  const isSimulationRunning = currentStep > 0 && !isCompleted;

  // Auto-advance loop when "Run All" is active
  useEffect(() => {
    let timer;
    if (isRunningAll && currentStep > 0 && currentStep < TOTAL_STEPS) {
      timer = setTimeout(() => {
        executeStep(currentStep + 1);
      }, 1000);
    } else if (currentStep >= TOTAL_STEPS) {
      setIsRunningAll(false);
    }
    return () => clearTimeout(timer);
  }, [isRunningAll, currentStep]);

  const handleInputChange = (field, value) => {
    setCandidate((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const executeStep = (stepNumber) => {
    if (stepNumber > TOTAL_STEPS) return;

    const time = new Date().toLocaleTimeString();

    if (stepNumber === 1) {
      setStatus('webhook');
      setLogs((prev) => [
        ...prev,
        {
          id: Date.now(),
          time,
          title: 'Recruiter Action: Candidate Status Updated to HIRED',
          details: `Candidate [${candidate.name}] moved to final Hired stage on job requisition [JOB-7712].`,
          payload: null,
          statusType: 'action'
        }
      ]);
    } else if (stepNumber === 2) {
      setStatus('cpi_transform');
      setLogs((prev) => [
        ...prev,
        {
          id: Date.now(),
          time,
          title: 'SmartRecruiters Event: candidate.hired (Webhook)',
          details: 'SmartRecruiters fires real-time event JSON payload to registered SAP CPI webhook endpoint.',
          payload: {
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
          statusType: 'process'
        }
      ]);
    } else if (stepNumber === 3) {
      setStatus('cpi_transform');
      setLogs((prev) => [
        ...prev,
        {
          id: Date.now(),
          time,
          title: 'SAP CPI Middleware: Field Transformation & OData Mapping',
          details: 'SAP Integration Suite maps SmartRecruiters JSON properties to SuccessFactors Employee Central OData API fields.',
          payload: {
            sfEntity: 'EmpEmployment',
            mappedFields: {
              personIdExternal: 'PENDING_cand_44332211',
              startDate: candidate.startDate,
              department: candidate.costCenter,
              manager: candidate.managerId,
              compensation: `${candidate.salary} ${candidate.currency}`
            }
          },
          statusType: 'process'
        }
      ]);
    } else if (stepNumber === 4) {
      setStatus('complete');
      setLogs((prev) => [
        ...prev,
        {
          id: Date.now(),
          time,
          title: 'SAP SuccessFactors: 201 Created (Manage Pending Hires)',
          details: 'Data successfully written to SuccessFactors EC queue. Profile ready for pre-onboarding.',
          payload: {
            status: 201,
            statusText: 'Created',
            sfRecord: {
              personIdExternal: 'SF_EMP_2026_9012',
              pendingHireStatus: 'READY_FOR_ONBOARDING',
              assignedOnboardingWorkflow: 'US_CORP_ONBOARDING_V2'
            }
          },
          statusType: 'success'
        }
      ]);
    }

    setCurrentStep(stepNumber);
  };

  // Submit Action (Runs single step instead of auto-running all)
  const handleHiredSimulationSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 0) {
      setLogs([]);
      executeStep(1);
    } else if (!isCompleted) {
      executeStep(currentStep + 1);
    }
  };

  const handleRunStep = () => {
    if (isCompleted) return;
    executeStep(currentStep + 1);
  };

  const handleToggleRunAll = () => {
    if (isCompleted) return;

    if (isRunningAll) {
      setIsRunningAll(false);
    } else {
      setIsRunningAll(true);
      if (currentStep === 0) {
        executeStep(1);
      }
    }
  };

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

          <form onSubmit={handleHiredSimulationSubmit} className="sr-card">
            {/* Candidate Header Summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
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
                  disabled={currentStep > 0}
                  placeholder="Candidate Name"
                />
                <input
                  type="text"
                  className="sr-input"
                  style={{ fontSize: '0.8rem' }}
                  value={candidate.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  disabled={currentStep > 0}
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
                  disabled={currentStep > 0} 
                />
              </div>

              <div className="sr-form-group">
                <label className="sr-label">SAP Cost Center</label>
                <input 
                  type="text" 
                  className="sr-input" 
                  value={candidate.costCenter} 
                  onChange={(e) => handleInputChange('costCenter', e.target.value)}
                  disabled={currentStep > 0} 
                />
              </div>

              <div className="sr-form-group">
                <label className="sr-label">Reporting Manager ID</label>
                <input 
                  type="text" 
                  className="sr-input" 
                  value={candidate.managerId} 
                  onChange={(e) => handleInputChange('managerId', e.target.value)}
                  disabled={currentStep > 0} 
                />
              </div>

              <div className="sr-form-group">
                <label className="sr-label">Target Start Date</label>
                <input 
                  type="date" 
                  className="sr-input" 
                  value={candidate.startDate} 
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  disabled={currentStep > 0} 
                />
              </div>
            </div>

            <div className="sr-form-actions">
              <button
                type="submit"
                disabled={isCompleted || isRunningAll}
                className={`sr-btn ${!isCompleted && !isRunningAll ? 'sr-btn-primary' : 'sr-btn-disabled'}`}
              >
                <span>
                  {currentStep === 0 
                    ? 'Mark Candidate as Hired' 
                    : isCompleted 
                    ? 'Handoff Completed' 
                    : `Next Step (${currentStep + 1}/${TOTAL_STEPS})`}
                </span>
                <FileCheck className="sr-icon-sm" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* RIGHT PANEL: Middleware & API Inspector */}
      <section 
        className="sr-panel sr-panel-right"
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          overflow: 'hidden',
          paddingBottom: '1.5rem'
        }}
      >
        {/* Header */}
        <div className="sr-section-header" style={{ marginBottom: '1rem', flexShrink: 0 }}>
          <span className="sr-badge sr-badge-green">Integration Suite (CPI Bridge)</span>
          <h2 className="sr-title" style={{ marginTop: '0.25rem' }}>SmartRecruiters ➔ SuccessFactors Flow</h2>
          <p className="sr-subtitle" style={{ marginTop: '0.25rem' }}>
            Inspect how Webhook triggers convert into SuccessFactors OData API records.
          </p>
        </div>

        {/* Scrollable Timeline */}
        <div 
          ref={timelineRef}
          className="sr-log-timeline"
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            paddingRight: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {logs.length === 0 ? (
            <div className="sr-empty-state">
              <ArrowLeftCircleIcon className="sr-icon-lg sr-pulse" />
              <p>Click "Mark Candidate as Hired" on the left or "Run step" below to trigger the webhook flow.</p>
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

        {/* PINNED ACTION BAR AT THE BOTTOM */}
        <div 
          style={{ 
            marginTop: '1rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid var(--sr-color-border)', 
            display: 'flex', 
            justify: 'flex-end', 
            gap: '0.75rem',
            flexShrink: 0
          }}
        >
          <button
            type="button"
            onClick={handleRunStep}
            disabled={isCompleted || isRunningAll}
            className={`sr-btn ${!isCompleted && !isRunningAll ? 'sr-btn-secondary' : 'sr-btn-disabled'}`}
            title="Execute next step"
          >
            <StepForward className="sr-icon-sm" />
            <span>Run step</span>
          </button>

          <button
            type="button"
            onClick={handleToggleRunAll}
            disabled={isCompleted}
            className={`sr-btn ${!isCompleted ? (isRunningAll ? 'sr-btn-secondary' : 'sr-btn-primary') : 'sr-btn-disabled'}`}
            title={isRunningAll ? 'Pause execution' : 'Run all steps'}
          >
            {isRunningAll ? (
              <>
                <Pause className="sr-icon-sm" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="sr-icon-sm" />
                <span>Run all</span>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}