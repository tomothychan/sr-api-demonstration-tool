import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const ROW_STATUSES = [
  { id: 'added', label: 'ADDED', color: '#10b981' },
  { id: 'updated', label: 'UPDATED', color: '#f59e0b' },
  { id: 'deleted', label: 'DELETED', color: '#ef4444' },
  { id: 'synchronized', label: 'SYNCHRONIZED', color: '#64748b' }
];

export default function DbMutationsActivityEditor({ activity, baseComponents = [], onChange }) {
  const config = activity.config || {};
  const dbTables = baseComponents.filter((c) => c.type === 'dbTable');

  const selectedTable = dbTables.find((t) => t.id === config.dbTableId) || dbTables[0];
  const columns = selectedTable?.dbColumns || [{ key: 'STATE', label: 'STATE' }];
  const records = config.records || [];

  const updateConfig = (updates) => {
    onChange({
      ...activity,
      config: { ...config, ...updates }
    });
  };

  const addRecord = () => {
    const newRecord = {
      id: Date.now(),
      _rowStatus: 'added',
      _updatedFields: []
    };
    columns.forEach((col) => {
      if (col.key !== 'STATE') {
        newRecord[col.key] = `Value_${records.length + 1}`;
      }
    });
    updateConfig({ records: [...records, newRecord] });
  };

  const updateRecord = (recordIndex, key, value) => {
    const updatedRecords = [...records];
    updatedRecords[recordIndex] = { ...updatedRecords[recordIndex], [key]: value };
    updateConfig({ records: updatedRecords });
  };

  const toggleUpdatedField = (recordIndex, fieldKey) => {
    const record = records[recordIndex];
    const currentFields = record._updatedFields || [];
    const exists = currentFields.includes(fieldKey);
    const nextFields = exists
      ? currentFields.filter((f) => f !== fieldKey)
      : [...currentFields, fieldKey];

    updateRecord(recordIndex, '_updatedFields', nextFields);
  };

  const removeRecord = (recordIndex) => {
    const updatedRecords = records.filter((_, idx) => idx !== recordIndex);
    updateConfig({ records: updatedRecords });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', minWidth: 0 }}>
      {/* Target Table Selector */}
      <div className="sr-form-group" style={{ minWidth: 0 }}>
        <label className="sr-label" style={{ fontSize: '0.65rem' }}>Target Database Table</label>
        <select
          className="sr-input"
          style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '100%' }}
          value={config.dbTableId || selectedTable?.id || ''}
          onChange={(e) => updateConfig({ dbTableId: e.target.value })}
        >
          <option value="">Select Database Table...</option>
          {dbTables.map((t) => (
            <option key={t.id} value={t.id}>{t.title || t.tableName || t.id}</option>
          ))}
        </select>
      </div>

      {/* Record State Snapshot Builder */}
      <div>
        <div className="sr-flex-between" style={{ marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className="sr-label" style={{ fontSize: '0.65rem' }}>TABLE RECORD SNAPSHOTS ({records.length})</span>
          <button className="sr-btn sr-btn-secondary" style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }} onClick={addRecord}>
            <Plus size={12} />
            <span>Add Row Snapshot</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
          {records.length === 0 ? (
            <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.725rem', color: 'var(--sr-color-text-subtle)', border: '1px dashed var(--sr-color-border)', borderRadius: 'var(--sr-radius-sm)' }}>
              No database row snapshots defined for this step. Click "Add Row Snapshot".
            </div>
          ) : (
            records.map((rec, rIdx) => (
              <div key={rec.id || rIdx} style={{ padding: '0.5rem', borderRadius: 'var(--sr-radius-sm)', border: '1px solid var(--sr-color-border-subtle)', backgroundColor: 'var(--sr-color-bg-surface)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div className="sr-flex-between" style={{ flexWrap: 'wrap', gap: '0.35rem' }}>
                  <div className="sr-flex-gap-sm">
                    <span className="sr-label" style={{ fontSize: '0.65rem' }}>Row #{rIdx + 1} State:</span>
                    <select
                      className="sr-input"
                      style={{ padding: '0.15rem 0.35rem', fontSize: '0.7rem', fontWeight: 700 }}
                      value={rec._rowStatus || 'synchronized'}
                      onChange={(e) => updateRecord(rIdx, '_rowStatus', e.target.value)}
                    >
                      {ROW_STATUSES.map((st) => (
                        <option key={st.id} value={st.id}>{st.label}</option>
                      ))}
                    </select>
                  </div>

                  <button className="sr-btn sr-btn-secondary" style={{ padding: '0.15rem', color: '#ef4444' }} onClick={() => removeRecord(rIdx)} title="Delete Record">
                    <Trash2 size={11} />
                  </button>
                </div>

                {/* Field Values Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.35rem' }}>
                  {columns.filter((c) => c.key !== 'STATE').map((col) => {
                    const isUpdated = (rec._updatedFields || []).includes(col.key);

                    return (
                      <div key={col.key} style={{ minWidth: 0 }}>
                        <div className="sr-flex-between" style={{ marginBottom: '2px' }}>
                          <span className="sr-label" style={{ fontSize: '0.6rem' }}>{col.label || col.key}</span>
                          <label style={{ fontSize: '0.58rem', display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer', color: isUpdated ? '#f59e0b' : 'var(--sr-color-text-subtle)' }}>
                            <input
                              type="checkbox"
                              checked={isUpdated}
                              onChange={() => toggleUpdatedField(rIdx, col.key)}
                              style={{ margin: 0, width: '10px', height: '10px' }}
                            />
                            <span>Highlight</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          className="sr-input"
                          style={{ padding: '0.15rem 0.3rem', fontSize: '0.7rem', width: '100%', borderColor: isUpdated ? '#f59e0b' : undefined }}
                          value={rec[col.key] !== undefined ? rec[col.key] : ''}
                          onChange={(e) => updateRecord(rIdx, col.key, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}