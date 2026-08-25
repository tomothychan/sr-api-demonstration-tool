import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Type, Hash, Mail, Calendar, ToggleLeft, List } from 'lucide-react';

const FIELD_TYPES = [
  { id: 'string', label: 'String / Text', icon: Type },
  { id: 'email', label: 'Email Address', icon: Mail },
  { id: 'int', label: 'Integer / Number', icon: Hash },
  { id: 'date', label: 'Date', icon: Calendar },
  { id: 'boolean', label: 'Boolean', icon: ToggleLeft },
  { id: 'select', label: 'Dropdown / Select', icon: List }
];

export default function FormEditor({ component, onChange }) {
  const fields = component.fields || [];

  const updateComponent = (updates) => {
    onChange({ ...component, ...updates });
  };

  const handleFieldChange = (index, key, value) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], [key]: value };
    updateComponent({ fields: updatedFields });
  };

  const addField = () => {
    const newField = {
      name: `field_${fields.length + 1}`,
      label: `Field ${fields.length + 1}`,
      type: 'string',
      defaultValue: ''
    };
    updateComponent({ fields: [...fields, newField] });
  };

  const moveField = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const updatedFields = [...fields];
    const [moved] = updatedFields.splice(index, 1);
    updatedFields.splice(targetIdx, 0, moved);
    updateComponent({ fields: updatedFields });
  };

  const removeField = (index) => {
    const updatedFields = fields.filter((_, idx) => idx !== index);
    updateComponent({ fields: updatedFields });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', minWidth: 0 }}>
      {/* Simulation Title at the top */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', width: '100%' }}>
        <div className="sr-form-group" style={{ minWidth: 0 }}>
          <label className="sr-label">Simulation Title (Label)</label>
          <input 
            type="text" 
            className="sr-input" 
            value={component.title || ''} 
            onChange={(e) => updateComponent({ title: e.target.value })} 
            placeholder="e.g. Interactive Form Input"
          />
        </div>
        <div className="sr-form-group" style={{ minWidth: 0 }}>
          <label className="sr-label">Component ID (Target Key)</label>
          <input 
            type="text" 
            className="sr-input" 
            value={component.id || ''} 
            onChange={(e) => updateComponent({ id: e.target.value })} 
          />
        </div>
      </div>

      {/* Form Fields Section */}
      <div style={{ minWidth: 0 }}>
        <div className="sr-flex-between" style={{ marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className="sr-label">FORM FIELDS ({fields.length})</span>
          <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={addField}>
            <Plus size={13} />
            <span>Add Field</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {fields.map((field, idx) => (
            <div key={idx} style={{ padding: '0.65rem', borderRadius: 'var(--sr-radius-md)', border: '1px solid var(--sr-color-border)', backgroundColor: 'var(--sr-color-bg-base)', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0 }}>
              <div className="sr-flex-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="sr-input" 
                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem', fontWeight: 600, flex: '1 1 160px', minWidth: 0 }}
                  placeholder="Field Name (key)"
                  value={field.name || ''} 
                  onChange={(e) => handleFieldChange(idx, 'name', e.target.value)} 
                />

                <div className="sr-flex-gap-sm" style={{ flexShrink: 0, marginLeft: 'auto' }}>
                  <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem' }} onClick={() => moveField(idx, -1)} title="Move Up">
                    <ArrowUp size={12} />
                  </button>
                  <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem' }} onClick={() => moveField(idx, 1)} title="Move Down">
                    <ArrowDown size={12} />
                  </button>
                  <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem', color: '#ef4444' }} onClick={() => removeField(idx)} title="Remove Field">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem', width: '100%' }}>
                <div style={{ minWidth: 0 }}>
                  <label className="sr-label" style={{ fontSize: '0.65rem' }}>Label</label>
                  <input 
                    type="text" 
                    className="sr-input" 
                    style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '100%' }}
                    value={field.label || ''} 
                    onChange={(e) => handleFieldChange(idx, 'label', e.target.value)} 
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <label className="sr-label" style={{ fontSize: '0.65rem' }}>Type</label>
                  <select 
                    className="sr-input" 
                    style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '100%' }}
                    value={field.type || 'string'} 
                    onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ minWidth: 0 }}>
                  <label className="sr-label" style={{ fontSize: '0.65rem' }}>Default Value</label>
                  <input 
                    type="text" 
                    className="sr-input" 
                    style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '100%' }}
                    value={field.defaultValue || ''} 
                    onChange={(e) => handleFieldChange(idx, 'defaultValue', e.target.value)} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}