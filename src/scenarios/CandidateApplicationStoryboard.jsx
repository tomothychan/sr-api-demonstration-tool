import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Database, 
  UserCheck, 
  Send, 
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

export default function CandidateApplicationStoryboard() {
  const TOTAL_STEPS = 4;

  const [formData, setFormData] = useState({
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@example.com',
    jobTitle: 'Senior Enterprise Architect'
  });

  const [status, setStatus] = useState('idle'); // idle | parsing | dedup | posting | complete
  const [logs, setLogs] = useState([]);
  const [currentStep, setCurrentStep] = useState(0); // 0 (not started) to 4 (completed)
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

  const executeStep = (stepNumber) => {
    if (stepNumber > TOTAL_STEPS) return;

    const time = new Date().toLocaleTimeString();

    if (stepNumber === 1) {
      setStatus('parsing');
      setLogs((prev) => [
        ...prev,
        {
          id: Date.now(),
          time,
          title: 'Client Action: Form Submitted',
          details: 'Candidate submits job application on custom career site portal.',
          payload: null,
          statusType: 'action'
        }
      ]);
    } else if (stepNumber === 2) {
      setStatus('dedup');
      setLogs((prev) => [
        ...prev,
        {
          id: Date.now(),
          time,
          title: 'Data Transformation: Resume & Profile Parsing',
          details: 'Client wrapper converts inputs into SmartRecruiters Open Web API JSON format.',
          payload: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            consent: { type: 'GDPR', acquired: true }
          },
          statusType: 'process'
        }
      ]);
    } else if (stepNumber === 3) {
      setStatus('posting');
      setLogs((prev) => [
        ...prev,
        {
          id: Date.now(),
          time,
          title: 'API Pre-Check: Email Deduplication Anchoring',
          details: `Querying backend for existing candidate with email [${formData.email}]. Result: No duplicate match.`,
          payload: { query: `email EQ '${formData.email}'`, matchFound: false },
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
          title: 'HTTP POST /postings/job-7712/candidates',
          details: 'SmartRecruiters processes payload, generates UUIDs, and creates candidate record.',
          payload: {
            status: 201,
            statusText: 'Created',
            data: {
              candidateId: 'cand_987654321-uuid',
              applicationId: 'app_1122334455-uuid',
              currentStage: 'NEW'
            }
          },
          statusType: 'success'
        }
      ]);
    }

    setCurrentStep(stepNumber);
  };

  // Form Submit Action (Runs single step instead of auto-running all)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 0) {
      setLogs([]);
      executeStep(1);
    } else if (!isCompleted) {
      executeStep(currentStep + 1);
    }
  };

  // Step Controls
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
      {/* LEFT PANEL: Front-End UI */}
      <section className="sr-panel sr-panel-left">
        <div className="sr-panel-content">
          <div className="sr-section-header">
            <span className="sr-badge sr-badge-blue">Front-End Experience</span>
            <h2 className="sr-title">Career Site Application</h2>
            <p className="sr-subtitle">Simulate how a job seeker interacts with your custom front-end portal.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="sr-card sr-form">
            <div className="sr-form-group">
              <label className="sr-label">First Name</label>
              <input
                type="text"
                className="sr-input"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={currentStep > 0}
              />
            </div>

            <div className="sr-form-group">
              <label className="sr-label">Last Name</label>
              <input
                type="text"
                className="sr-input"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={currentStep > 0}
              />
            </div>

            <div className="sr-form-group">
              <label className="sr-label">Email Address</label>
              <input
                type="email"
                className="sr-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={currentStep > 0}
              />
            </div>

            <div className="sr-form-actions">
              <button
                type="submit"
                disabled={isCompleted || isRunningAll}
                className={`sr-btn ${!isCompleted && !isRunningAll ? 'sr-btn-primary' : 'sr-btn-disabled'}`}
              >
                <span>
                  {currentStep === 0 
                    ? 'Submit Application' 
                    : isCompleted 
                    ? 'Simulation Completed' 
                    : `Next Step (${currentStep + 1}/${TOTAL_STEPS})`}
                </span>
                {currentStep === 0 && <Send className="sr-icon-sm" />}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* RIGHT PANEL: API Inspector */}
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
          <span className="sr-badge sr-badge-green">Behind the Scenes (API Inspector)</span>
          <h2 className="sr-title" style={{ marginTop: '0.25rem' }}>Real-Time Data Execution</h2>
          <p className="sr-subtitle" style={{ marginTop: '0.25rem' }}>
            Translates user interactions directly into API events, business logic, and JSON payloads.
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
              <p>Submit the form on the left or click "Run step" below to inspect the API workflow.</p>
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
                      <Database className="sr-icon-sm sr-text-purple" />
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