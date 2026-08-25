import React from 'react';

const NODE_STATES = ['inactive', 'active', 'updated', 'completed', 'error'];

export default function NodeUpdateActivityEditor({ activity, baseComponents = [], onChange }) {
  const config = activity.config || {};
  const nodeGraphs = baseComponents.filter((c) => c.type === 'nodeGraph');
  
  const selectedGraph = nodeGraphs.find((g) => g.id === config.nodeGraphId) || nodeGraphs[0];
  const availableNodes = selectedGraph?.nodes || [];

  const updateConfig = (updates) => {
    onChange({
      ...activity,
      config: { ...config, ...updates }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', minWidth: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', width: '100%' }}>
        {/* Node Graph Target */}
        <div className="sr-form-group" style={{ minWidth: 0 }}>
          <label className="sr-label" style={{ fontSize: '0.65rem' }}>Node Graph</label>
          <select
            className="sr-input"
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '100%' }}
            value={config.nodeGraphId || selectedGraph?.id || ''}
            onChange={(e) => {
              const newGraphId = e.target.value;
              const graph = nodeGraphs.find((g) => g.id === newGraphId);
              const firstNodeId = graph?.nodes?.[0]?.id || '';
              updateConfig({ nodeGraphId: newGraphId, nodeId: firstNodeId });
            }}
          >
            <option value="">Select Graph...</option>
            {nodeGraphs.map((g) => (
              <option key={g.id} value={g.id}>{g.title || g.id}</option>
            ))}
          </select>
        </div>

        {/* Target Node */}
        <div className="sr-form-group" style={{ minWidth: 0 }}>
          <label className="sr-label" style={{ fontSize: '0.65rem' }}>Target Node</label>
          <select
            className="sr-input"
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '100%' }}
            value={config.nodeId || ''}
            onChange={(e) => updateConfig({ nodeId: e.target.value })}
          >
            <option value="">Select Node...</option>
            {availableNodes.map((n) => (
              <option key={n.id} value={n.id}>{n.label || n.id}</option>
            ))}
          </select>
        </div>

        {/* Node State */}
        <div className="sr-form-group" style={{ minWidth: 0 }}>
          <label className="sr-label" style={{ fontSize: '0.65rem' }}>Node State</label>
          <select
            className="sr-input"
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '100%' }}
            value={config.state || 'active'}
            onChange={(e) => updateConfig({ state: e.target.value })}
          >
            {NODE_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}