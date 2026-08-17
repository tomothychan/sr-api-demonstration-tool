import React from 'react';
import { 
  Database, 
  FileSpreadsheet, 
  Globe, 
  Server, 
  Workflow, 
  ArrowRight
} from 'lucide-react';

export default function NodeDataFlowDiagram({ 
  nodes = [], 
  activeStep = 0, 
  activePacket = null 
}) {
  return (
    <div 
      style={{ 
        padding: '1.25rem', 
        backgroundColor: 'var(--sr-color-bg-base, #0f172a)', 
        borderRadius: '10px', 
        border: '1px solid var(--sr-color-border, #334155)',
        color: 'var(--sr-color-text-main, #f8fafc)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}
    >
      {/* Node Graph Grid */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', position: 'relative', minHeight: '260px', padding: '1rem 0', boxSizing: 'border-box' }}>
        {nodes.map((node, index) => {
          const isNodeActive = node.activeSteps?.includes(activeStep);
          const isNodePassed = activeStep > Math.max(...(node.activeSteps || [0]));

          return (
            <React.Fragment key={node.id}>
              {/* Node Card */}
              <div 
                style={{
                  flex: '1 1 0',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '1.25rem 0.75rem',
                  borderRadius: '10px',
                  backgroundColor: isNodeActive 
                    ? 'var(--sr-color-bg-surface, #1e293b)' 
                    : 'var(--sr-color-bg-card, var(--sr-color-bg-base, #1e1e24))',
                  border: isNodeActive 
                    ? '2px solid #3b82f6' 
                    : isNodePassed 
                    ? '1px solid #10b981' 
                    : '1px solid var(--sr-color-border, #334155)',
                  boxShadow: isNodeActive ? '0 0 16px rgba(59, 130, 246, 0.4)' : 'none',
                  transition: 'all 0.3s ease',
                  zIndex: 2,
                  position: 'relative'
                }}
              >
                {/* Node Icon Container */}
                <div style={{ 
                  width: '46px', 
                  height: '46px', 
                  borderRadius: '50%', 
                  backgroundColor: isNodeActive 
                    ? '#3b82f6' 
                    : isNodePassed 
                    ? '#10b981' 
                    : 'var(--sr-color-border, #334155)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  color: (isNodeActive || isNodePassed) ? '#ffffff' : 'var(--sr-color-text-muted, #94a3b8)',
                  transition: 'all 0.3s ease'
                }}>
                  {node.icon === 'sheet' && <FileSpreadsheet size={22} />}
                  {node.icon === 'globe' && <Globe size={22} />}
                  {node.icon === 'server' && <Server size={22} />}
                  {node.icon === 'workflow' && <Workflow size={22} />}
                  {node.icon === 'database' && <Database size={22} />}
                </div>

                <span style={{ 
                  fontSize: '0.825rem', 
                  fontWeight: 600, 
                  color: isNodeActive 
                    ? 'var(--sr-color-text-main, #f8fafc)' 
                    : 'var(--sr-color-text-muted, #94a3b8)', 
                  textAlign: 'center' 
                }}>
                  {node.label}
                </span>

                <span style={{ 
                  fontSize: '0.725rem', 
                  color: 'var(--sr-color-text-subtle, #64748b)', 
                  marginTop: '0.35rem', 
                  textAlign: 'center' 
                }}>
                  {node.sublabel}
                </span>
              </div>

              {/* Connector Arrow & Moving Data Packet */}
              {index < nodes.length - 1 && (
                <div style={{ flex: '0 0 70px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    width: '100%', 
                    height: '2px', 
                    backgroundColor: activeStep > index ? '#3b82f6' : 'var(--sr-color-border, #334155)', 
                    position: 'relative',
                    transition: 'background-color 0.3s ease'
                  }}>
                    {/* Animated Data Packet */}
                    {activePacket && activePacket.fromNode === node.id && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '-14px',
                          left: '0%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)',
                          animation: 'movePacket 1.2s ease-in-out forwards'
                        }}
                      >
                        {activePacket.label}
                      </div>
                    )}
                  </div>
                  <ArrowRight size={16} style={{ color: activeStep > index ? '#3b82f6' : 'var(--sr-color-text-subtle, #475569)', marginTop: '-9px' }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <style>{`
        @keyframes movePacket {
          0% { left: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}