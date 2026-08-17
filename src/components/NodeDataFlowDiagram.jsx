import React from 'react';
import { 
  Database, 
  FileSpreadsheet, 
  Globe, 
  Server, 
  Workflow, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export default function NodeDataFlowDiagram({ 
  nodes = [], 
  activeStep = 0, 
  activePacket = null,
  layout = 'linear' // 'linear' | 'branched'
}) {
  const renderIcon = (iconType, size = 22) => {
    switch (iconType) {
      case 'sheet': return <FileSpreadsheet size={size} />;
      case 'globe': return <Globe size={size} />;
      case 'server': return <Server size={size} />;
      case 'workflow': return <Workflow size={size} />;
      case 'database': return <Database size={size} />;
      default: return <Server size={size} />;
    }
  };

  const isNodeActive = (node) => node?.activeSteps?.includes(activeStep);
  const isNodePassed = (node) => node && activeStep > Math.max(...(node.activeSteps || [0]));

  // RENDER BRANCHED LAYOUT (Bidirectional Node 1 <-> Node 2 -> Parallel Nodes 3 & 4)
  if (layout === 'branched') {
    const node1 = nodes.find((n) => n.id === 'sr_engine') || nodes[0];
    const node2 = nodes.find((n) => n.id === 'company_server') || nodes[1];
    const node3 = nodes.find((n) => n.id === 'company_db') || nodes[2];
    const node4 = nodes.find((n) => n.id === 'bg_agency') || nodes[3];

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
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 60px 1fr 60px 1fr', alignItems: 'center', minHeight: '260px', gap: '0.75rem', padding: '1rem 0', boxSizing: 'border-box' }}>
          
          {/* COLUMN 1: SmartRecruiters Engine */}
          {node1 && (
            <div style={{
              flex: '1 1 0',
              minWidth: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.25rem 0.75rem', borderRadius: '10px',
              backgroundColor: isNodeActive(node1) ? 'var(--sr-color-bg-surface, #1e293b)' : 'var(--sr-color-bg-card, var(--sr-color-bg-base, #1e1e24))',
              border: isNodeActive(node1) ? '2px solid #3b82f6' : isNodePassed(node1) ? '1px solid #10b981' : '1px solid var(--sr-color-border, #334155)',
              boxShadow: isNodeActive(node1) ? '0 0 16px rgba(59, 130, 246, 0.4)' : 'none',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: isNodeActive(node1) ? '#3b82f6' : isNodePassed(node1) ? '#10b981' : 'var(--sr-color-border, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', color: (isNodeActive(node1) || isNodePassed(node1)) ? '#ffffff' : 'var(--sr-color-text-muted, #94a3b8)', transition: 'all 0.3s ease' }}>
                {renderIcon(node1.icon)}
              </div>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: isNodeActive(node1) ? 'var(--sr-color-text-main, #f8fafc)' : 'var(--sr-color-text-muted, #94a3b8)', textAlign: 'center' }}>{node1.label}</span>
              <span style={{ fontSize: '0.725rem', color: 'var(--sr-color-text-subtle, #64748b)', marginTop: '0.35rem', textAlign: 'center' }}>{node1.sublabel}</span>
            </div>
          )}

          {/* CONNECTOR 1: Bidirectional Pipe between Node 1 & Node 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{ width: '100%', height: '2px', backgroundColor: activeStep >= 1 ? '#3b82f6' : 'var(--sr-color-border, #334155)', position: 'relative', transition: 'background-color 0.3s ease' }}>
              {activePacket && (activePacket.fromNode === node1?.id || activePacket.fromNode === node2?.id) && (
                <div style={{
                  position: 'absolute', top: '-14px', left: activePacket.direction === 'reverse' ? '100%' : '0%',
                  transform: 'translateX(-50%)', backgroundColor: '#3b82f6', color: '#ffffff', padding: '3px 8px',
                  borderRadius: '12px', fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap',
                  boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)',
                  animation: activePacket.direction === 'reverse' ? 'movePacketReverse 1.2s ease-in-out forwards' : 'movePacket 1.2s ease-in-out forwards'
                }}>
                  {activePacket.label}
                </div>
              )}
            </div>
            {activePacket?.direction === 'reverse' ? (
              <ArrowLeft size={16} style={{ color: '#3b82f6', marginTop: '-9px' }} />
            ) : (
              <ArrowRight size={16} style={{ color: activeStep >= 1 ? '#3b82f6' : 'var(--sr-color-text-subtle, #475569)', marginTop: '-9px' }} />
            )}
          </div>

          {/* COLUMN 2: Company Server */}
          {node2 && (
            <div style={{
              flex: '1 1 0',
              minWidth: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.25rem 0.75rem', borderRadius: '10px',
              backgroundColor: isNodeActive(node2) ? 'var(--sr-color-bg-surface, #1e293b)' : 'var(--sr-color-bg-card, var(--sr-color-bg-base, #1e1e24))',
              border: isNodeActive(node2) ? '2px solid #3b82f6' : isNodePassed(node2) ? '1px solid #10b981' : '1px solid var(--sr-color-border, #334155)',
              boxShadow: isNodeActive(node2) ? '0 0 16px rgba(59, 130, 246, 0.4)' : 'none',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: isNodeActive(node2) ? '#3b82f6' : isNodePassed(node2) ? '#10b981' : 'var(--sr-color-border, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', color: (isNodeActive(node2) || isNodePassed(node2)) ? '#ffffff' : 'var(--sr-color-text-muted, #94a3b8)', transition: 'all 0.3s ease' }}>
                {renderIcon(node2.icon)}
              </div>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: isNodeActive(node2) ? 'var(--sr-color-text-main, #f8fafc)' : 'var(--sr-color-text-muted, #94a3b8)', textAlign: 'center' }}>{node2.label}</span>
              <span style={{ fontSize: '0.725rem', color: 'var(--sr-color-text-subtle, #64748b)', marginTop: '0.35rem', textAlign: 'center' }}>{node2.sublabel}</span>
            </div>
          )}

          {/* CONNECTOR 2: Parallel Split Branch */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '180px', position: 'relative' }}>
            <div style={{ width: '100%', height: '2px', backgroundColor: activeStep === 4 ? '#10b981' : 'var(--sr-color-border, #334155)', position: 'relative' }}>
              {activePacket && activePacket.toNode === 'company_db' && (
                <div style={{
                  position: 'absolute', top: '-14px', left: '0%', transform: 'translateX(-50%)', backgroundColor: '#10b981', color: '#ffffff',
                  padding: '3px 8px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)', animation: 'movePacket 1.2s ease-in-out forwards'
                }}>
                  {activePacket.label}
                </div>
              )}
            </div>
            <div style={{ width: '100%', height: '2px', backgroundColor: activeStep === 5 ? '#f59e0b' : 'var(--sr-color-border, #334155)', position: 'relative' }}>
              {activePacket && activePacket.toNode === 'bg_agency' && (
                <div style={{
                  position: 'absolute', top: '-14px', left: '0%', transform: 'translateX(-50%)', backgroundColor: '#f59e0b', color: '#ffffff',
                  padding: '3px 8px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.8)', animation: 'movePacket 1.2s ease-in-out forwards'
                }}>
                  {activePacket.label}
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: Parallel Branch Nodes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Branch Node 1: Company DB */}
            {node3 && (
              <div style={{
                flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.75rem 0.5rem', borderRadius: '10px',
                backgroundColor: isNodeActive(node3) ? 'var(--sr-color-bg-surface, #1e293b)' : 'var(--sr-color-bg-card, var(--sr-color-bg-base, #1e1e24))',
                border: isNodeActive(node3) ? '2px solid #10b981' : isNodePassed(node3) ? '1px solid #10b981' : '1px solid var(--sr-color-border, #334155)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: isNodeActive(node3) ? '#10b981' : 'var(--sr-color-border, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.35rem', color: '#ffffff' }}>
                  {renderIcon(node3.icon, 18)}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sr-color-text-main, #f8fafc)', textAlign: 'center' }}>{node3.label}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--sr-color-text-subtle, #64748b)', textAlign: 'center' }}>{node3.sublabel}</span>
              </div>
            )}

            {/* Branch Node 2: BG Check Agency */}
            {node4 && (
              <div style={{
                flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.75rem 0.5rem', borderRadius: '10px',
                backgroundColor: isNodeActive(node4) ? 'var(--sr-color-bg-surface, #1e293b)' : 'var(--sr-color-bg-card, var(--sr-color-bg-base, #1e1e24))',
                border: isNodeActive(node4) ? '2px solid #f59e0b' : isNodePassed(node4) ? '1px solid #10b981' : '1px solid var(--sr-color-border, #334155)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: isNodeActive(node4) ? '#f59e0b' : 'var(--sr-color-border, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.35rem', color: '#ffffff' }}>
                  {renderIcon(node4.icon, 18)}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sr-color-text-main, #f8fafc)', textAlign: 'center' }}>{node4.label}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--sr-color-text-subtle, #64748b)', textAlign: 'center' }}>{node4.sublabel}</span>
              </div>
            )}
          </div>

        </div>

        <style>{`
          @keyframes movePacket {
            0% { left: 0%; opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { left: 100%; opacity: 0; }
          }
          @keyframes movePacketReverse {
            0% { left: 100%; opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { left: 0%; opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  // STANDARD LINEAR LAYOUT
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
                  {renderIcon(node.icon)}
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