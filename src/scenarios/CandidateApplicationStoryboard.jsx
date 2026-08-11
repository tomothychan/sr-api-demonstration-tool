import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Database, 
  UserCheck, 
  Send, 
  ArrowLeftCircleIcon
} from 'lucide-react';

export default function CandidateApplicationStoryboard() {
  const [formData, setFormData] = useState({
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@example.com',
    jobTitle: 'Senior Enterprise Architect'
  });

  const [status, setStatus] = useState('idle'); // idle | parsing | dedup | posting | complete
  const [logs, setLogs] = useState([]);

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

  const runApiSimulation = async (e) => {
    e.preventDefault();
    setLogs([]);
    
    // Step 1: Form Submitted
    setStatus('parsing');
    addLog(
      'Client Action: Form Submitted',
      'Candidate submits job application on custom career site portal.',
      null,
      'action'
    );

    // Step 2: Resume Parsing & Payload Creation
    await new Promise((res) => setTimeout(res, 800));
    setStatus('dedup');
    addLog(
      'Data Transformation: Resume & Profile Parsing',
      'Client wrapper converts inputs into SmartRecruiters Open Web API JSON format.',
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        consent: { type: 'GDPR', acquired: true }
      },
      'process'
    );

    // Step 3: Deduplication
    await new Promise((res) => setTimeout(res, 1000));
    setStatus('posting');
    addLog(
      'API Pre-Check: Email Deduplication Anchoring',
      `Querying backend for existing candidate with email [${formData.email}]. Result: No duplicate match.`,
      { query: `email EQ '${formData.email}'`, matchFound: false },
      'process'
    );

    // Step 4: Execute API POST Call
    await new Promise((res) => setTimeout(res, 900));
    setStatus('complete');
    addLog(
      'HTTP POST /postings/job-7712/candidates',
      'SmartRecruiters processes payload, generates UUIDs, and creates candidate record.',
      {
        status: 201,
        statusText: 'Created',
        data: {
          candidateId: 'cand_987654321-uuid',
          applicationId: 'app_1122334455-uuid',
          currentStage: 'NEW'
        }
      },
      'success'
    );
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

          <form onSubmit={runApiSimulation} className="sr-card sr-form">
            <div className="sr-form-group">
              <label className="sr-label">First Name</label>
              <input
                type="text"
                className="sr-input"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={status !== 'idle'}
              />
            </div>

            <div className="sr-form-group">
              <label className="sr-label">Last Name</label>
              <input
                type="text"
                className="sr-input"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={status !== 'idle'}
              />
            </div>

            <div className="sr-form-group">
              <label className="sr-label">Email Address</label>
              <input
                type="email"
                className="sr-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={status !== 'idle'}
              />
            </div>

            <div className="sr-form-actions">
              <button
                type="submit"
                disabled={status !== 'idle'}
                className={`sr-btn ${status === 'idle' ? 'sr-btn-primary' : 'sr-btn-disabled'}`}
              >
                <span>{status === 'idle' ? 'Submit Application' : 'Processing API Event...'}</span>
                {status === 'idle' && <Send className="sr-icon-sm" />}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* RIGHT PANEL: API Inspector */}
      <section className="sr-panel sr-panel-right">
        <div className="sr-section-header">
          <span className="sr-badge sr-badge-green">Behind the Scenes (API Inspector)</span>
          <h2 className="sr-title">Real-Time Data Execution</h2>
          <p className="sr-subtitle">Translates user interactions directly into API events, business logic, and JSON payloads.</p>
        </div>

        <div className="sr-log-timeline">
          {logs.length === 0 ? (
            <div className="sr-empty-state">
              <ArrowLeftCircleIcon className="sr-icon-lg sr-pulse" />
              <p>Submit the form on the left to inspect the API workflow.</p>
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
      </section>
    </div>
  );
}