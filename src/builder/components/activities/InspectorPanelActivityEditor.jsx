import React, { useState } from 'react';

const STATUS_TYPES = [
  { id: 'action', label: 'Action (Blue)', color: '#3b82f6' },
  { id: 'process', label: 'Process (Purple)', color: '#a855f7' },
  { id: 'success', label: 'Success (Green)', color: '#10b981' }
];

export default function InspectorPanelActivityEditor({ activity, onChange }) {
  const config = activity.config || {};
  const [jsonError, setJsonError] = useState(false);

  const updateConfig = (updates) => {
    onChange({
      ...activity,
      config: { ...config, ...updates }
    });
  };

  const handlePayloadChange = (text) => {
    updateConfig({ payloadText: text });
    try {
      JSON.parse(text);
      setJsonError(false);
    } catch {
      setJsonError(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', minWidth: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', width: '100%' }}>
        {/* Title */}
        <div className="sr-form-group" style={{ minWidth: 0 }}>
          <label className="sr-label" style={{ fontSize: '0.65rem' }}>Log Entry Title</label>
          <input
            type="text"
            className="sr-input"
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '100%' }}
            value={config.title || ''}
            placeholder="e.g. Outbound Webhook Request"
            onChange={(e) => updateConfig({ title: e.target.value })}
          />
        </div>

        {/* Status Type Badge */}
        <div className="sr-form-group" style={{ minWidth: 0 }}>
          <label className="sr-label" style={{ fontSize: '0.65rem' }}>Status Type</label>
          <select
            className="sr-input"
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '100%' }}
            value={config.statusType || 'action'}
            onChange={(e) => updateConfig({ statusType: e.target.value })}
          >
            {STATUS_TYPES.map((st) => (
              <option key={st.id} value={st.id}>{st.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Details Description */}
      <div className="sr-form-group" style={{ minWidth: 0 }}>
        <label className="sr-label" style={{ fontSize: '0.65rem' }}>Log Details Description</label>
        <input
          type="text"
          className="sr-input"
          style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '100%' }}
          value={config.details || ''}
          placeholder="Brief overview of the API event or state change..."
          onChange={(e) => updateConfig({ details: e.target.value })}
        />
      </div>

      {/* JSON Payload Text Area */}
      <div className="sr-form-group" style={{ minWidth: 0 }}>
        <div className="sr-flex-between" style={{ marginBottom: '2px' }}>
          <label className="sr-label" style={{ fontSize: '0.65rem' }}>Payload JSON Object</label>
          {jsonError && (
            <span style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 600 }}>Invalid JSON syntax</span>
          )}
        </div>
        <textarea
          className="sr-input sr-textarea-vertical"
          style={{
            padding: '0.4rem',
            fontSize: '0.7rem',
            fontFamily: 'var(--sr-font-mono, monospace)',
            borderColor: jsonError ? '#ef4444' : undefined,
            width: '100%'
          }}
          rows={3}
          value={config.payloadText || ''}
          placeholder={`{\n  "key": "value"\n}`}
          onChange={(e) => handlePayloadChange(e.target.value)}
        />
      </div>
    </div>
  );
}