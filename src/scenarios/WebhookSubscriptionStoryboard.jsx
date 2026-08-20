import React, { useState, useEffect } from 'react';
import { Webhook, Network, Database } from 'lucide-react';
import InspectorPanel from '../components/InspectorPanel';
import NodeDataFlowDiagram from '../components/NodeDataFlowDiagram';
import LiveDatabaseTable from '../components/LiveDatabaseTable';

export default function WebhookSubscriptionStoryboard() {
  const TOTAL_STEPS = 5;

  const FLOW_NODES = [
    { id: 'sr_engine', label: 'SmartRecruiters', sublabel: 'Webhook Engine', icon: 'workflow', col: 1, stepStates: ['inactive', 'active', 'completed', 'active', 'completed', 'completed'] },
    { id: 'company_server', label: 'Company Server', sublabel: 'Webhook Listener', icon: 'server', col: 2, stepStates: ['inactive', 'active', 'completed', 'completed', 'updated', 'completed'] },
    { id: 'company_db', label: 'Company DB', sublabel: 'Applicants Table', icon: 'database', col: 3, stepStates: ['inactive', 'inactive', 'inactive', 'inactive', 'updated', 'completed'] },
    { id: 'bg_agency', label: 'BG Check Agency', sublabel: 'Checkr / Sterling API', icon: 'globe', col: 3, stepStates: ['inactive', 'inactive', 'inactive', 'inactive', 'inactive', 'active'] }
  ];

  const FLOW_EDGES = [
    { from: 'sr_engine', to: 'company_server' },
    { from: 'company_server', to: 'company_db' },
    { from: 'company_server', to: 'bg_agency' }
  ];

  const DB_COLUMNS = [
    { key: 'applicantId', label: 'APPLICANT_ID' },
    { key: 'name', label: 'CANDIDATE_NAME' },
    { key: 'email', label: 'EMAIL' },
    { key: 'webhookStatus', label: 'WEBHOOK_STATUS' },
    { key: 'bgCheckStatus', label: 'BG_CHECK_STATUS' }
  ];

  const [subscriptionConfig, setSubscriptionConfig] = useState({
    targetUrl: 'https://api.company.com/v1/webhooks/smartrecruiters',
    eventType: 'candidate.application.created',
    candidateName: 'Jordan Lee',
    candidateEmail: 'jordan.lee@example.com'
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
      timer = setTimeout(() => executeStep(currentStep + 1), 1200);
    } else if (currentStep >= TOTAL_STEPS) {
      setIsRunningAll(false);
    }
    return () => clearTimeout(timer);
  }, [isRunningAll, currentStep]);

  const executeStep = (stepNumber) => {
    if (stepNumber > TOTAL_STEPS) return;
    const time = new Date().toLocaleTimeString();

    if (stepNumber === 1) {
      // Step 1: Company Server -> SmartRecruiters (Outbound Subscription Request)
      setActivePacket({ fromNode: 'company_server', toNode: 'sr_engine', label: 'POST /webhooks', key: `pkt-1-${Date.now()}` });
      setLogs((prev) => [...prev, {
        id: Date.now(), time,
        title: 'Step 1: Outbound Subscription Request (Company -> SR)',
        details: `Company server sends webhook subscription request to SmartRecruiters for event [${subscriptionConfig.eventType}].`,
        payload: {
          endpoint: 'POST /webhooks/subscriptions',
          targetUrl: subscriptionConfig.targetUrl,
          eventType: subscriptionConfig.eventType,
          secretKey: 'whsec_a8f9021b9c3e47'
        }, 
        statusType: 'action'
      }]);
    } else if (stepNumber === 2) {
      // Step 2: SmartRecruiters -> Company Server (Subscription Acceptance)
      setActivePacket({ fromNode: 'sr_engine', toNode: 'company_server', label: '201 Sub Accepted', key: `pkt-2-${Date.now()}` });
      setLogs((prev) => [...prev, {
        id: Date.now(), time,
        title: 'Step 2: Webhook Subscription Acceptance (SR -> Company)',
        details: 'SmartRecruiters accepts the subscription and verifies secret handshake response.',
        payload: {
          status: 201,
          subscriptionId: 'sub_8839201-uuid',
          subscriptionStatus: 'ACTIVE',
          handshakeVerified: true
        }, 
        statusType: 'process'
      }]);
    } else if (stepNumber === 3) {
      // Step 3: SmartRecruiters -> Company Server (New Applicant Notification)
      setActivePacket({ fromNode: 'sr_engine', toNode: 'company_server', label: 'Applicant Notification', key: `pkt-3-${Date.now()}` });
      setLogs((prev) => [...prev, {
        id: Date.now(), time,
        title: `Step 3: New Applicant Notification Received (SR -> Company)`,
        details: `SmartRecruiters triggers real-time webhook payload for new applicant [${subscriptionConfig.candidateName}].`,
        payload: {
          eventId: 'evt_77120499',
          eventType: subscriptionConfig.eventType,
          candidate: {
            id: 'cand_55443322',
            fullName: subscriptionConfig.candidateName,
            email: subscriptionConfig.candidateEmail,
            applicationDate: new Date().toISOString()
          }
        }, 
        statusType: 'action'
      }]);
    } else if (stepNumber === 4) {
      // Step 4: Company Server -> Company DB (Branch 1: Update Company DB)
      setActivePacket({ fromNode: 'company_server', toNode: 'company_db', label: 'INSERT Candidate Row', key: `pkt-4-${Date.now()}` });

      setDbRecords([
        {
          id: 1,
          applicantId: 'APP-55443322',
          name: subscriptionConfig.candidateName,
          email: subscriptionConfig.candidateEmail,
          webhookStatus: 'RECEIVED',
          bgCheckStatus: 'PENDING',
          _rowStatus: 'added'
        }
      ]);

      setLogs((prev) => [...prev, {
        id: Date.now(), time,
        title: 'Step 4: Update Internal Database (Branch 1)',
        details: 'Company server writes applicant profile to internal PostgreSQL database.',
        payload: {
          table: 'company_applicants',
          operation: 'INSERT',
          record: {
            applicantId: 'APP-55443322',
            name: subscriptionConfig.candidateName,
            email: subscriptionConfig.candidateEmail,
            webhookStatus: 'RECEIVED'
          }
        }, 
        statusType: 'process'
      }]);
    } else if (stepNumber === 5) {
      // Step 5: Company Server -> BG Check Agency (Branch 2: Contact Agency)
      setActivePacket({ fromNode: 'company_server', toNode: 'bg_agency', label: 'POST /checkr/orders', color: '#f59e0b', key: `pkt-5-${Date.now()}` });

      setDbRecords([
        {
          id: 1,
          applicantId: 'APP-55443322',
          name: subscriptionConfig.candidateName,
          email: subscriptionConfig.candidateEmail,
          webhookStatus: 'PROCESSED',
          bgCheckStatus: 'INITIATED',
          _rowStatus: 'updated',
          _updatedFields: ['webhookStatus', 'bgCheckStatus']
        }
      ]);

      setLogs((prev) => [...prev, {
        id: Date.now(), time,
        title: 'Step 5: Contact Background Check Agency (Branch 2)',
        details: 'Automated screening request dispatched to Checkr/Sterling agency API.',
        payload: {
          agencyProvider: 'Checkr API v1',
          endpoint: 'POST /v1/candidates/orders',
          status: 201,
          orderResponse: {
            orderId: 'ord_chk_99001122',
            package: 'STANDARD_CRIMINAL_PLUS_EDU',
            candidateEmail: subscriptionConfig.candidateEmail,
            invitationUrl: 'https://checkr.com/invite/chk_99001122'
          }
        }, 
        statusType: 'success'
      }]);
    }

    setCurrentStep(stepNumber);
  };

  const handleStartSimulation = (e) => {
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
          
          {/* Section 1: Config Form */}
          <div>
            <div className="sr-section-header">
              <span className="sr-badge sr-badge-blue">Event Driven Integration</span>
              <h2 className="sr-title">Webhook & Automated Screening</h2>
              <p className="sr-subtitle">Subscribe to SmartRecruiters webhooks, update internal DB, and trigger automated screening workflows.</p>
            </div>

            <form onSubmit={handleStartSimulation} className="sr-card sr-form">
              <div className="sr-form-group">
                <label className="sr-label">Company Webhook Endpoint URL</label>
                <input 
                  type="text" 
                  className="sr-input" 
                  value={subscriptionConfig.targetUrl} 
                  onChange={(e) => setSubscriptionConfig({ ...subscriptionConfig, targetUrl: e.target.value })} 
                  disabled={currentStep > 0} 
                />
              </div>

              <div className="sr-form-group">
                <label className="sr-label">Subscribed Event Trigger</label>
                <input 
                  type="text" 
                  className="sr-input" 
                  value={subscriptionConfig.eventType} 
                  disabled 
                  style={{ opacity: 0.8 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="sr-form-group">
                  <label className="sr-label">Sample Candidate Name</label>
                  <input 
                    type="text" 
                    className="sr-input" 
                    value={subscriptionConfig.candidateName} 
                    onChange={(e) => setSubscriptionConfig({ ...subscriptionConfig, candidateName: e.target.value })} 
                    disabled={currentStep > 0} 
                  />
                </div>

                <div className="sr-form-group">
                  <label className="sr-label">Sample Candidate Email</label>
                  <input 
                    type="email" 
                    className="sr-input" 
                    value={subscriptionConfig.candidateEmail} 
                    onChange={(e) => setSubscriptionConfig({ ...subscriptionConfig, candidateEmail: e.target.value })} 
                    disabled={currentStep > 0} 
                  />
                </div>
              </div>

              <div className="sr-form-actions">
                <button type="submit" disabled={isCompleted || isRunningAll} className={`sr-btn ${!isCompleted && !isRunningAll ? 'sr-btn-primary' : 'sr-btn-disabled'}`}>
                  <span>{currentStep === 0 ? 'Subscribe & Trigger Simulation' : isCompleted ? 'Workflow Completed' : `Next Step (${currentStep + 1}/${TOTAL_STEPS})`}</span>
                  {currentStep === 0 && <Webhook className="sr-icon-sm" />}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Node Data Flow (Branched Layout) */}
          <div>
            <div className="sr-subheading-group">
              <Network size={18} style={{ color: '#3b82f6' }} />
              <h3 className="sr-subheading-title">
                System Node Architecture
              </h3>
            </div>
            <NodeDataFlowDiagram 
              nodes={FLOW_NODES} 
              edges={FLOW_EDGES}
              activeStep={currentStep} 
              activePacket={activePacket} 
            />
          </div>

          {/* Section 3: Live Database Sync */}
          <div style={{ paddingBottom: '2rem' }}>
            <div className="sr-subheading-group">
              <Database size={18} style={{ color: '#10b981' }} />
              <h3 className="sr-subheading-title">
                Company Applicants Database Sync
              </h3>
            </div>
            <LiveDatabaseTable 
              tableName="Company DB (applicants_screening)"
              records={dbRecords} 
              columns={DB_COLUMNS} 
            />
          </div>

        </div>
      </section>

      {/* RIGHT PANEL */}
      <InspectorPanel
        badgeText="Webhook Event Hub"
        title="Real-Time Event Processing"
        subtitle="Observe bidirectional webhook handshakes and automated multi-node downstream triggers."
        logs={logs}
        isCompleted={isCompleted}
        isRunningAll={isRunningAll}
        onRunStep={handleRunStep}
        onToggleRunAll={handleToggleRunAll}
      />
    </div>
  );
}