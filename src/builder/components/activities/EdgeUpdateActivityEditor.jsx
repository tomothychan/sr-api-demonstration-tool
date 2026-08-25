import React from 'react';

const EDGE_STATES = ['inactive', 'active', 'updated', 'completed', 'error'];

export default function EdgeUpdateActivityEditor({ activity, baseComponents = [], onChange }) {
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem', width: '100%' }}>
        {/* Node Graph Target */}
        <div className="sr-form-group" style={{ minWidth: 0 }}>
          <label className="sr-label" style={{ fontSize: '0.65rem' }}>Node Graph</label>
          <select
            className="sr-input"
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '100%' }}
            value={config.nodeGraphId || selectedGraph?.id || ''}
            onChange={(e) => updateConfig({ nodeGraphId: e.target.value })}
          >
            <option value="">Select Graph...</option>
            {nodeGraphs.map((g) => (
              <option key={g.id} value={g.id}>{g.title || g.id}</option>
            ))}
          </select>
        </div>

        {/* From Node */}
        <div className="sr-form-group" style={{ minWidth: 0 }}>
          <label className="sr-label" style={{ fontSize: '0.65rem' }}>From Node</label>
          <select
            className="sr-input"
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '100%' }}
            value={config.fromNode || ''}
            onChange={(e) => updateConfig({ fromNode: e.target.value })}
          >
            <option value="">Select Origin...</option>
            {availableNodes.map((n) => (
              <option key={n.id} value={n.id}>{n.label || n.id}</option>
            ))}
          </select>
        </div>

        {/* To Node */}
        <div className="sr-form-group" style={{ minWidth: 0 }}>
          <label className="sr-label" style={{ fontSize: '0.65rem' }}>To Node</label>
          <select
            className="sr-input"
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '100%' }}
            value={config.toNode || ''}
            onChange={(e) => updateConfig({ toNode: e.target.value })}
          >
            <option value="">Select Target...</option>
            {availableNodes.map((n) => (
              <option key={n.id} value={n.id}>{n.label || n.id}</option>
            ))}
          </select>
        </div>

        {/* Edge State */}
        <div className="sr-form-group" style={{ minWidth: 0 }}>
          <label className="sr-label" style={{ fontSize: '0.65rem' }}>Edge State</label>
          <select
            className="sr-input"
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '100%' }}
            value={config.state || 'active'}
            onChange={(e) => updateConfig({ state: e.target.value })}
          >
            {EDGE_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Edge Color */}
        <div className="sr-form-group" style={{ minWidth: 0 }}>
          <label className="sr-label" style={{ fontSize: '0.65rem' }}>Line Color</label>
          <input
            type="color"
            className="sr-input"
            style={{ padding: '0.1rem', height: '28px', cursor: 'pointer', width: '100%' }}
            value={config.color || '#3b82f6'}
            onChange={(e) => updateConfig({ color: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}