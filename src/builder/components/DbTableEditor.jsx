import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Lock } from 'lucide-react';

const toSnakeCaps = (str) => {
  return (str || '')
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9_]+/g, '_');
};

export default function DbTableEditor({ component, onChange }) {
  const columns = component.dbColumns || [
    { key: 'STATE', label: 'STATE', isFixed: true }
  ];

  const updateComponent = (updates) => {
    onChange({ ...component, ...updates });
  };

  const handleColumnChange = (index, value) => {
    if (index === 0) return; // 0th column is fixed
    const formatted = toSnakeCaps(value);
    const updatedCols = [...columns];
    updatedCols[index] = { key: formatted, label: formatted };
    updateComponent({ dbColumns: updatedCols });
  };

  const addColumn = () => {
    const defaultTitle = toSnakeCaps(`COLUMN_${columns.length}`);
    const newCol = {
      key: defaultTitle,
      label: defaultTitle
    };
    updateComponent({ dbColumns: [...columns, newCol] });
  };

  const moveColumn = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx <= 0 || targetIdx >= columns.length) return; // Cannot move 0th column
    const updatedCols = [...columns];
    const [moved] = updatedCols.splice(index, 1);
    updatedCols.splice(targetIdx, 0, moved);
    updateComponent({ dbColumns: updatedCols });
  };

  const removeColumn = (index) => {
    if (index === 0) return; // Cannot remove 0th column
    const updatedCols = columns.filter((_, idx) => idx !== index);
    updateComponent({ dbColumns: updatedCols });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Simulation Title at the top */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        <div className="sr-form-group">
          <label className="sr-label">Simulation Title (Label)</label>
          <input 
            type="text" 
            className="sr-input" 
            value={component.title || ''} 
            onChange={(e) => updateComponent({ title: e.target.value })} 
            placeholder="e.g. Candidates Table"
          />
        </div>
        <div className="sr-form-group">
          <label className="sr-label">Component ID</label>
          <input 
            type="text" 
            className="sr-input" 
            value={component.id || ''} 
            onChange={(e) => updateComponent({ id: e.target.value })} 
          />
        </div>
        <div className="sr-form-group">
          <label className="sr-label">Database Table Name</label>
          <input 
            type="text" 
            className="sr-input" 
            value={component.tableName || ''} 
            onChange={(e) => updateComponent({ tableName: e.target.value })} 
          />
        </div>
      </div>

      {/* Columns Section */}
      <div>
        <div className="sr-flex-between" style={{ marginBottom: '0.5rem' }}>
          <span className="sr-label">DATABASE COLUMNS ({columns.length})</span>
          <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={addColumn}>
            <Plus size={13} />
            <span>Add Column</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {columns.map((col, idx) => {
            const isFixed = idx === 0;

            return (
              <div 
                key={idx} 
                style={{ 
                  padding: '0.5rem 0.75rem', 
                  borderRadius: 'var(--sr-radius-md)', 
                  border: isFixed ? '1px dashed var(--sr-color-primary)' : '1px solid var(--sr-color-border)', 
                  backgroundColor: isFixed ? 'var(--sr-color-primary-light)' : 'var(--sr-color-bg-base)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justify: 'space-between',
                  gap: '0.75rem'
                }}
              >
                {isFixed ? (
                  <div className="sr-flex-gap" style={{ flex: 1 }}>
                    <Lock size={13} style={{ color: 'var(--sr-color-primary)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sr-color-primary)' }}>
                      0th Column: STATE (Fixed Mutation Indicator)
                    </span>
                  </div>
                ) : (
                  <div className="sr-flex-gap" style={{ flex: 1 }}>
                    <input 
                      type="text" 
                      className="sr-input" 
                      style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem', fontWeight: 600, flex: 1 }}
                      placeholder="COLUMN_NAME"
                      value={col.key || col.label || ''} 
                      onChange={(e) => handleColumnChange(idx, e.target.value)} 
                    />
                  </div>
                )}

                {!isFixed && (
                  <div className="sr-flex-gap-sm">
                    <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem' }} onClick={() => moveColumn(idx, -1)} title="Move Up">
                      <ArrowUp size={12} />
                    </button>
                    <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem' }} onClick={() => moveColumn(idx, 1)} title="Move Down">
                      <ArrowDown size={12} />
                    </button>
                    <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem', color: '#ef4444' }} onClick={() => removeColumn(idx)} title="Remove Column">
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}