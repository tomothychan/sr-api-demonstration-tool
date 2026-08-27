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

const getNodeY = (index, count) => {
  if (count <= 1) return 50;
  return ((index + 0.5) / count) * 100;
};

const getStatePriority = (state) => {
  switch (state) {
    case 'error': return 5;
    case 'active': return 4;
    case 'updated': return 3;
    case 'completed': return 2;
    default: return 1;
  }
};

const getGroupColor = (edgesGroup) => {
  if (!edgesGroup || edgesGroup.length === 0) return 'var(--sr-border)';

  const activePacketEdge = edgesGroup.find((e) => e.hasPacket);
  if (activePacketEdge && activePacketEdge.color) {
    return activePacketEdge.color;
  }

  let bestColor = 'var(--sr-border)';
  let maxPriority = 0;

  edgesGroup.forEach((e) => {
    const priority = getStatePriority(e.state);
    if (priority > maxPriority) {
      maxPriority = priority;
      bestColor = e.color;
    }
  });

  return bestColor;
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

  const packetsList = Array.isArray(activePacket) 
    ? activePacket 
    : (activePacket ? [activePacket] : []);

  const getPacketsOnEdge = (edgeFrom, edgeTo) => {
    return packetsList.filter((p) => {
      const matchesForward = p.fromNode === edgeFrom && p.toNode === edgeTo;
      const matchesReverse = p.fromNode === edgeTo && p.toNode === edgeFrom;
      const matchesGeneric = p.fromNode === edgeFrom && !p.toNode;
      return matchesForward || matchesReverse || matchesGeneric;
    });
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
        .sr-node-diagram {
          --sr-bg-base: var(--sr-color-bg-base, #0f172a);
          --sr-bg-card: var(--sr-color-bg-card, #1e1e24);
          --sr-bg-surface: var(--sr-color-bg-surface, #1e293b);
          --sr-border: var(--sr-color-border, #334155);
          --sr-text-main: var(--sr-color-text-main, #f8fafc);
          --sr-text-muted: var(--sr-color-text-muted, #94a3b8);
          --sr-text-subtle: var(--sr-color-text-subtle, #64748b);
        }

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
              {!isLastCol && (() => {
                const gapEdges = [];

                colNodes.forEach((leftNode, leftIdx) => {
                  nextColNodes.forEach((rightNode, rightIdx) => {
                    const edgeObj = normalizedEdges.find(
                      (e) => (e.from === leftNode.id && e.to === rightNode.id) ||
                             (e.from === rightNode.id && e.to === leftNode.id)
                    );

                    if (edgeObj) {
                      const state = resolveState(edgeObj);
                      const style = STATE_STYLES[state] || STATE_STYLES.inactive;
                      const packetsOnEdge = getPacketsOnEdge(leftNode.id, rightNode.id);
                      const hasPacket = packetsOnEdge.length > 0;
                      const firstPacket = packetsOnEdge[0];
                      const isReverse = hasPacket && (firstPacket?.direction === 'reverse' || firstPacket?.fromNode === rightNode.id);

                      const color = (hasPacket && firstPacket?.color)
                        ? firstPacket.color
                        : (edgeObj.color || style.borderColor);

                      gapEdges.push({
                        edgeObj,
                        leftNode,
                        leftIdx,
                        leftY: getNodeY(leftIdx, colNodes.length),
                        rightNode,
                        rightIdx,
                        rightY: getNodeY(rightIdx, nextColNodes.length),
                        state,
                        color,
                        hasPacket,
                        isReverse,
                        packetsOnEdge
                      });
                    }
                  });
                });

                const leftArmIndices = [...new Set(gapEdges.map((e) => e.leftIdx))];
                const rightArmIndices = [...new Set(gapEdges.map((e) => e.rightIdx))];

                const allY = [
                  ...gapEdges.map((e) => e.leftY),
                  ...gapEdges.map((e) => e.rightY)
                ];

                const hasEdges = gapEdges.length > 0;
                const minY = hasEdges ? Math.min(...allY) : 0;
                const maxY = hasEdges ? Math.max(...allY) : 0;
                const spineColor = getGroupColor(gapEdges);

                return (
                  <div 
                    style={{ 
                      flex: '0 0 65px', 
                      position: 'relative',
                      minHeight: '100%'
                    }}
                  >
                    {/* VERTICAL SPINE */}
                    {hasEdges && maxY > minY && (
                      <div 
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: `${minY}%`,
                          height: `${maxY - minY}%`,
                          width: '2px',
                          marginLeft: '-1px',
                          backgroundColor: spineColor,
                          transition: 'background-color 0.3s ease'
                        }}
                      />
                    )}

                    {/* LEFT ARMS */}
                    {leftArmIndices.map((leftIdx) => {
                      const y = getNodeY(leftIdx, colNodes.length);
                      const edgesForArm = gapEdges.filter((e) => e.leftIdx === leftIdx);
                      const armColor = getGroupColor(edgesForArm);

                      return (
                        <div 
                          key={`left-arm-${colNum}-${leftIdx}`}
                          style={{
                            position: 'absolute',
                            left: '0px',
                            width: '50%',
                            top: `${y}%`,
                            height: '2px',
                            marginTop: '-1px',
                            backgroundColor: armColor,
                            transition: 'background-color 0.3s ease'
                          }}
                        />
                      );
                    })}

                    {/* RIGHT ARMS */}
                    {rightArmIndices.map((rightIdx) => {
                      const y = getNodeY(rightIdx, nextColNodes.length);
                      const edgesForArm = gapEdges.filter((e) => e.rightIdx === rightIdx);
                      const armColor = getGroupColor(edgesForArm);
                      const hasReverse = edgesForArm.some((e) => e.isReverse);

                      return (
                        <React.Fragment key={`right-arm-${colNum}-${rightIdx}`}>
                          <div 
                            style={{
                              position: 'absolute',
                              left: '50%',
                              width: '50%',
                              top: `${y}%`,
                              height: '2px',
                              marginTop: '-1px',
                              backgroundColor: armColor,
                              transition: 'background-color 0.3s ease'
                            }}
                          />

                          {hasReverse ? (
                            <ArrowLeft 
                              size={14} 
                              style={{ 
                                position: 'absolute', 
                                left: '50%', 
                                top: `${y}%`, 
                                transform: 'translate(-50%, -50%)', 
                                color: armColor,
                                zIndex: 2,
                                transition: 'color 0.3s ease' 
                              }} 
                            />
                          ) : (
                            <ArrowRight 
                              size={14} 
                              style={{ 
                                position: 'absolute', 
                                right: '-1px', 
                                top: `${y}%`, 
                                transform: 'translateY(-50%)', 
                                color: armColor,
                                zIndex: 2,
                                transition: 'color 0.3s ease' 
                              }} 
                            />
                          )}
                        </React.Fragment>
                      );
                    })}

                    {/* ACTIVE PACKETS (Multi-Packet Stacking) */}
                    {gapEdges.filter((e) => e.hasPacket).flatMap((e, pIdx) => {
                      return e.packetsOnEdge.map((pkt, pktIdx) => (
                        <div 
                          key={pkt.key || `pkt-${colNum}-${pIdx}-${pktIdx}-${activeStep}`}
                          style={{
                            position: 'absolute', 
                            top: `calc(${e.leftY}% - ${12 + pktIdx * 18}px)`, 
                            left: pkt.direction === 'reverse' ? '100%' : '0%',
                            transform: 'translateX(-50%)', 
                            backgroundColor: pkt.color || '#3b82f6', 
                            color: '#ffffff', 
                            padding: '2px 7px',
                            borderRadius: '10px', 
                            fontSize: '0.65rem', 
                            fontWeight: 700, 
                            whiteSpace: 'nowrap',
                            boxShadow: `0 0 8px ${pkt.color || 'rgba(59, 130, 246, 0.4)'}`,
                            animation: pkt.direction === 'reverse' 
                              ? 'movePacketReverse 1.2s ease-in-out forwards' 
                              : 'movePacket 1.2s ease-in-out forwards',
                            zIndex: 10 + pktIdx
                          }}
                        >
                          {pkt.label}
                        </div>
                      ));
                    })}
                  </div>
                );
              })()}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}