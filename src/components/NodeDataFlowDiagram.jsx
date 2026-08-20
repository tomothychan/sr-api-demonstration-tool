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

const STATE_STYLES = {
  inactive: {
    borderColor: 'var(--sr-border)',
    iconBg: 'var(--sr-bg-surface)',
    iconColor: 'var(--sr-text-muted)',
    textColor: 'var(--sr-text-muted)',
    bgColor: 'var(--sr-bg-card)',
    boxShadow: 'none'
  },
  active: {
    borderColor: '#3b82f6',
    iconBg: '#3b82f6',
    iconColor: '#ffffff',
    textColor: 'var(--sr-text-main)',
    bgColor: 'var(--sr-bg-surface)',
    boxShadow: '0 0 14px rgba(59, 130, 246, 0.3)'
  },
  completed: {
    borderColor: '#10b981',
    iconBg: '#10b981',
    iconColor: '#ffffff',
    textColor: 'var(--sr-text-main)',
    bgColor: 'var(--sr-bg-card)',
    boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)'
  },
  updated: {
    borderColor: '#f59e0b',
    iconBg: '#f59e0b',
    iconColor: '#ffffff',
    textColor: 'var(--sr-text-main)',
    bgColor: 'var(--sr-bg-card)',
    boxShadow: '0 0 12px rgba(245, 158, 11, 0.25)'
  },
  error: {
    borderColor: '#ef4444',
    iconBg: '#ef4444',
    iconColor: '#ffffff',
    textColor: 'var(--sr-text-main)',
    bgColor: 'var(--sr-bg-card)',
    boxShadow: '0 0 12px rgba(239, 68, 68, 0.3)'
  }
};

export default function NodeDataFlowDiagram({ 
  nodes = [], 
  edges = null, 
  activeStep = 0, 
  activePacket = null,
  theme = null
}) {
  const renderNodeIcon = (iconProp, size = 20) => {
    if (React.isValidElement(iconProp)) return iconProp;
    switch (iconProp) {
      case 'sheet': return <FileSpreadsheet size={size} />;
      case 'globe': return <Globe size={size} />;
      case 'server': return <Server size={size} />;
      case 'workflow': return <Workflow size={size} />;
      case 'database': return <Database size={size} />;
      default: return <Server size={size} />;
    }
  };

  const resolveState = (item) => {
    if (item.stepStates) {
      if (Array.isArray(item.stepStates)) {
        return item.stepStates[activeStep] || (activeStep >= item.stepStates.length ? item.stepStates[item.stepStates.length - 1] : 'inactive');
      }
      if (typeof item.stepStates === 'object' && item.stepStates[activeStep]) {
        return item.stepStates[activeStep];
      }
    }
    if (item.activeSteps && item.activeSteps.length > 0) {
      if (item.activeSteps.includes(activeStep)) return 'active';
      if (activeStep > Math.max(...item.activeSteps)) return 'completed';
    }
    return 'inactive';
  };

  const normalizedNodes = nodes
    .map((node, idx) => ({
      ...node,
      col: node.col ?? (idx + 1),
      row: node.row ?? 1
    }))
    .sort((a, b) => a.col - b.col || a.row - b.row);

  const maxCol = Math.max(...normalizedNodes.map((n) => n.col), 1);
  const columnMap = Array.from({ length: maxCol }, (_, colIdx) => {
    const colNum = colIdx + 1;
    return normalizedNodes
      .filter((n) => n.col === colNum)
      .sort((a, b) => a.row - b.row);
  });

  const normalizedEdges = edges ?? normalizedNodes.slice(0, -1).map((n, i) => ({
    from: n.id,
    to: normalizedNodes[i + 1].id
  }));

  const isPacketOnEdge = (edgeFrom, edgeTo) => {
    if (!activePacket) return false;
    const matchesForward = activePacket.fromNode === edgeFrom && activePacket.toNode === edgeTo;
    const matchesReverse = activePacket.fromNode === edgeTo && activePacket.toNode === edgeFrom;
    const matchesGeneric = activePacket.fromNode === edgeFrom && !activePacket.toNode;
    return matchesForward || matchesReverse || matchesGeneric;
  };

  return (
    <div 
      className="sr-node-diagram"
      data-theme={theme || undefined}
      style={{ 
        padding: '1.25rem', 
        backgroundColor: 'var(--sr-bg-base)', 
        borderRadius: '10px', 
        border: '1px solid var(--sr-border)',
        color: 'var(--sr-text-main)',
        transition: 'all 0.3s ease'
      }}
    >
      <style>{`
        /* Default: Dark Theme Tokens */
        .sr-node-diagram {
          --sr-bg-base: var(--sr-color-bg-base, #0f172a);
          --sr-bg-card: var(--sr-color-bg-card, #1e1e24);
          --sr-bg-surface: var(--sr-color-bg-surface, #1e293b);
          --sr-border: var(--sr-color-border, #334155);
          --sr-text-main: var(--sr-color-text-main, #f8fafc);
          --sr-text-muted: var(--sr-color-text-muted, #94a3b8);
          --sr-text-subtle: var(--sr-color-text-subtle, #64748b);
        }

        /* Light Theme Tokens */
        .sr-node-diagram[data-theme="light"],
        [data-theme="light"] .sr-node-diagram,
        .light .sr-node-diagram,
        html.light .sr-node-diagram,
        body.light .sr-node-diagram {
          --sr-bg-base: var(--sr-color-bg-base, #ffffff);
          --sr-bg-card: var(--sr-color-bg-card, #ffffff);
          --sr-bg-surface: var(--sr-color-bg-surface, #f8fafc);
          --sr-border: var(--sr-color-border, #e2e8f0);
          --sr-text-main: var(--sr-color-text-main, #0f172a);
          --sr-text-muted: var(--sr-color-text-muted, #64748b);
          --sr-text-subtle: var(--sr-color-text-subtle, #94a3b8);
        }

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

      <div 
        style={{ 
          width: '100%', 
          display: 'flex', 
          alignItems: 'stretch', 
          justifyContent: 'space-between', 
          minHeight: '260px', 
          gap: '0.5rem', 
          boxSizing: 'border-box' 
        }}
      >
        {columnMap.map((colNodes, colIdx) => {
          const colNum = colIdx + 1;
          const isLastCol = colNum === maxCol;
          const nextColNodes = columnMap[colIdx + 1] || [];
          const connectorRows = colNodes.length > nextColNodes.length ? colNodes : nextColNodes;

          return (
            <React.Fragment key={`col-group-${colNum}`}>
              {/* NODE COLUMN */}
              <div 
                style={{ 
                  flex: '1 1 0', 
                  minWidth: 0, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: colNodes.length === 1 ? 'center' : 'space-around', 
                  alignItems: 'center',
                  gap: colNodes.length > 1 ? '0.5rem' : '0'
                }}
              >
                {colNodes.map((node) => {
                  const state = resolveState(node);
                  const style = STATE_STYLES[state] || STATE_STYLES.inactive;

                  return (
                    <div
                      key={`node-wrapper-${node.id}`}
                      style={{
                        flex: colNodes.length > 1 ? '1 1 0' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%'
                      }}
                    >
                      <div 
                        style={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          padding: colNodes.length > 1 ? '0.65rem 0.5rem' : '1.25rem 0.75rem',
                          borderRadius: '10px',
                          backgroundColor: style.bgColor,
                          border: `2px solid ${style.borderColor}`,
                          boxShadow: style.boxShadow,
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div 
                          style={{ 
                            width: colNodes.length > 1 ? '36px' : '46px', 
                            height: colNodes.length > 1 ? '36px' : '46px', 
                            borderRadius: '50%', 
                            backgroundColor: style.iconBg, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexShrink: 0,
                            margin: '0 auto 0.4rem auto',
                            color: style.iconColor, 
                            transition: 'all 0.3s ease' 
                          }}
                        >
                          {renderNodeIcon(node.icon, colNodes.length > 1 ? 16 : 22)}
                        </div>

                        <span style={{ fontSize: colNodes.length > 1 ? '0.75rem' : '0.825rem', fontWeight: 600, color: style.textColor, textAlign: 'center' }}>
                          {node.label}
                        </span>

                        {node.sublabel && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--sr-text-subtle)', marginTop: '0.2rem', textAlign: 'center' }}>
                            {node.sublabel}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DYNAMIC CONNECTOR BETWEEN COLUMNS */}
              {!isLastCol && (
                <div 
                  style={{ 
                    flex: '0 0 65px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    position: 'relative' 
                  }}
                >
                  {/* 1-to-N Spine */}
                  {nextColNodes.length > 1 && colNodes.length === 1 && (
                    <>
                      <div 
                        style={{
                          position: 'absolute',
                          left: '0px',
                          width: '50%',
                          top: '50%',
                          height: '2px',
                          transform: 'translateY(-50%)',
                          backgroundColor: activeStep >= colNum ? '#3b82f6' : 'var(--sr-border)',
                          transition: 'background-color 0.3s ease'
                        }}
                      />
                      <div 
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: `${50 / nextColNodes.length}%`,
                          bottom: `${50 / nextColNodes.length}%`,
                          width: '2px',
                          backgroundColor: activeStep >= colNum ? '#3b82f6' : 'var(--sr-border)',
                          transition: 'background-color 0.3s ease'
                        }}
                      />
                    </>
                  )}

                  {/* N-to-1 Spine */}
                  {colNodes.length > 1 && nextColNodes.length === 1 && (
                    <>
                      <div 
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: `${50 / colNodes.length}%`,
                          bottom: `${50 / colNodes.length}%`,
                          width: '2px',
                          backgroundColor: activeStep >= colNum ? '#3b82f6' : 'var(--sr-border)',
                          transition: 'background-color 0.3s ease'
                        }}
                      />
                      <div 
                        style={{
                          position: 'absolute',
                          left: '50%',
                          width: '50%',
                          top: '50%',
                          height: '2px',
                          transform: 'translateY(-50%)',
                          backgroundColor: activeStep >= colNum ? '#3b82f6' : 'var(--sr-border)',
                          transition: 'background-color 0.3s ease'
                        }}
                      />
                      <ArrowRight 
                        size={16} 
                        style={{ 
                          position: 'absolute', 
                          right: '0px', 
                          top: '50%', 
                          transform: 'translateY(-50%)', 
                          color: activeStep >= colNum ? '#3b82f6' : 'var(--sr-border)',
                          zIndex: 1 
                        }} 
                      />
                    </>
                  )}

                  {/* EDGE LINES AND ARROWS */}
                  {connectorRows.map((_, rowIdx) => {
                    const edgeFrom = colNodes.length === 1 ? colNodes[0].id : (colNodes[rowIdx]?.id || colNodes[0].id);
                    const edgeTo = nextColNodes.length === 1 ? nextColNodes[0].id : (nextColNodes[rowIdx]?.id || nextColNodes[0].id);

                    const edgeObj = normalizedEdges.find((e) => (e.from === edgeFrom && e.to === edgeTo) || (e.from === edgeTo && e.to === edgeFrom)) || { from: edgeFrom, to: edgeTo };
                    const edgeState = resolveState(edgeObj);
                    const edgeStyle = STATE_STYLES[edgeState] || STATE_STYLES.inactive;

                    const hasActivePacket = isPacketOnEdge(edgeFrom, edgeTo);
                    const isReversePacket = hasActivePacket && (activePacket?.direction === 'reverse' || activePacket?.fromNode === edgeTo);

                    const isOneToN = colNodes.length === 1 && nextColNodes.length > 1;
                    const isNToOne = colNodes.length > 1 && nextColNodes.length === 1;

                    return (
                      <div 
                        key={`edge-${edgeFrom}-${edgeTo}-${rowIdx}`} 
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          width: (isOneToN || isNToOne) ? '50%' : '100%',
                          marginLeft: isOneToN ? 'auto' : '0',
                          flex: '1 1 0',
                          position: 'relative'
                        }}
                      >
                        {isReversePacket && (
                          <ArrowLeft size={16} style={{ color: activePacket?.color || '#3b82f6', marginRight: '-4px', zIndex: 1, flexShrink: 0 }} />
                        )}

                        <div 
                          style={{ 
                            flex: 1,
                            minWidth: 0,
                            height: '2px', 
                            backgroundColor: hasActivePacket ? (activePacket?.color || '#3b82f6') : edgeStyle.borderColor, 
                            position: 'relative', 
                            transition: 'background-color 0.3s ease' 
                          }}
                        >
                          {hasActivePacket && (
                            <div 
                              key={activePacket.key || `${activePacket.label}-${activeStep}`}
                              style={{
                                position: 'absolute', 
                                top: '-14px', 
                                left: isReversePacket ? '100%' : '0%',
                                transform: 'translateX(-50%)', 
                                backgroundColor: activePacket.color || '#3b82f6', 
                                color: '#ffffff', 
                                padding: '3px 8px',
                                borderRadius: '12px', 
                                fontSize: '0.68rem', 
                                fontWeight: 700, 
                                whiteSpace: 'nowrap',
                                boxShadow: `0 0 10px ${activePacket.color || 'rgba(59, 130, 246, 0.4)'}`,
                                animation: isReversePacket ? 'movePacketReverse 1.2s ease-in-out forwards' : 'movePacket 1.2s ease-in-out forwards'
                              }}
                            >
                              {activePacket.label}
                            </div>
                          )}
                        </div>

                        {!isReversePacket && !isNToOne && (
                          <ArrowRight size={16} style={{ color: hasActivePacket ? (activePacket?.color || '#3b82f6') : edgeStyle.borderColor, marginLeft: '-4px', zIndex: 1, flexShrink: 0 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}