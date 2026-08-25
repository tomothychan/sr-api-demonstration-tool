import React from 'react';

export default function PacketMovementActivityEditor({ activity, baseComponents = [], onChange }) {
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
            onChange={(e) => updateConfig({ nodeGraphId: e.target.value })}
          >
            <option value="">Select Graph...</option>
            {nodeGraphs.map((g) => (
              <option key={g.id} value={g.id}>{g.title || g.id}</option>
            ))}
          </select>
        </div>

        {/* Origin Node */}
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

        {/* Target Node */}
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

        {/* Direction */}
        <div className="sr-form-group" style={{ minWidth: 0 }}>
          <label className="sr-label" style={{ fontSize: '0.65rem' }}>Direction</label>
          <select
            className="sr-input"
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '100%' }}
            value={config.direction || 'forward'}
            onChange={(e) => updateConfig({ direction: e.target.value })}
          >
            <option value="forward">Forward (&rarr;)</option>
            <option value="reverse">Reverse (&larr;)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(80px, 120px)', gap: '0.5rem', width: '100%' }}>
        {/* Packet Label Text */}
        <div className="sr-form-group" style={{ minWidth: 0 }}>
          <label className="sr-label" style={{ fontSize: '0.65rem' }}>Packet Badge Label</label>
          <input
            type="text"
            className="sr-input"
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '100%' }}
            value={config.label || ''}
            placeholder="e.g. POST /webhooks"
            onChange={(e) => updateConfig({ label: e.target.value })}
          />
        </div>

        {/* Badge Color */}
        <div className="sr-form-group" style={{ minWidth: 0 }}>
          <label className="sr-label" style={{ fontSize: '0.65rem' }}>Badge Color</label>
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