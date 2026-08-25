import React, { useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  UserCheck, 
  Workflow, 
  ArrowLeftCircleIcon, 
  Play, 
  Pause, 
  StepForward,
  RefreshCw
} from 'lucide-react';
import { smoothScrollTo } from './Scroll';

export default function InspectorPanel({
  badgeText = "Behind the Scenes (API Inspector)",
  badgeColorClass = "sr-badge-green",
  title = "Real-Time Data Execution",
  subtitle = "Translates user interactions directly into API events, business logic, and JSON payloads.",
  emptyMessage = "Click an action on the left or 'Run step' below to trigger the workflow.",
  logs = [],
  isCompleted = false,
  isRunningAll = false,
  isLoading = false,
  onRunStep,
  onToggleRunAll,
  onReset
}) {
  const timelineRef = useRef(null);

  // Auto-scroll timeline container whenever logs update
  useEffect(() => {
    if (timelineRef.current) {
      setTimeout(() => {
        smoothScrollTo(timelineRef.current, timelineRef.current.scrollHeight, 350);
      }, 50);
    }
  }, [logs]);

  const renderLogIcon = (statusType) => {
    if (statusType === 'success') return <CheckCircle2 className="sr-icon-sm sr-text-success" />;
    if (statusType === 'action') return <UserCheck className="sr-icon-sm sr-text-blue" />;
    return <Workflow className="sr-icon-sm sr-text-purple" />;
  };

  return (
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
      {/* Panel Header */}
      <div className="sr-section-header" style={{ marginBottom: '1rem', flexShrink: 0 }}>
        <span className={`sr-badge ${badgeColorClass}`}>{badgeText}</span>
        <h2 className="sr-title" style={{ marginTop: '0.25rem' }}>{title}</h2>
        <p className="sr-subtitle" style={{ marginTop: '0.25rem' }}>{subtitle}</p>
      </div>

      {/* API Logs Timeline */}
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
            <p>{emptyMessage}</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`sr-log-card sr-log-${log.statusType}`}>
              <div className="sr-log-header">
                <div className="sr-log-title-group">
                  {renderLogIcon(log.statusType)}
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

      {/* Pinned Action Control Bar */}
      <div 
        style={{ 
          marginTop: '1rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid var(--sr-color-border, #334155)', 
          display: 'flex', 
          justify: 'flex-end', 
          gap: '0.75rem',
          flexShrink: 0
        }}
      >
        <button onClick={onReset} className="sr-btn sr-btn-secondary">
          <RefreshCw className="sr-icon-sm" />
          <span>Reset Scenario</span>
        </button>
        
        <button
          type="button"
          onClick={onRunStep}
          disabled={isCompleted || isRunningAll || isLoading}
          className={`sr-btn ${!isCompleted && !isRunningAll && !isLoading ? 'sr-btn-secondary' : 'sr-btn-disabled'}`}
          title="Execute next step"
        >
          <StepForward className="sr-icon-sm" />
          <span>Run step</span>
        </button>

        <button
          type="button"
          onClick={onToggleRunAll}
          disabled={isCompleted || isLoading}
          className={`sr-btn ${!isCompleted && !isLoading ? (isRunningAll ? 'sr-btn-secondary' : 'sr-btn-primary') : 'sr-btn-disabled'}`}
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
  );
}