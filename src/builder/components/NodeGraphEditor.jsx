import React from 'react';
import { Plus, Trash2, Network, ArrowRight } from 'lucide-react';

const PRESET_ICONS = ['globe', 'workflow', 'server', 'database', 'sheet'];

export default function NodeGraphEditor({ component, onChange, onNotification }) {
  const nodes = component.nodes || [];
  const edges = component.edges || [];

  const updateComponent = (updates) => {
    onChange({ ...component, ...updates });
  };

  const maxCol = Math.max(...nodes.map((n) => n.col || 1), 1);
  const columnCount = Math.max(maxCol, 1);

  // Node Mutations
  const addColumn = () => {
    const nextCol = columnCount + 1;
    const newNode = {
      id: `node_col_${nextCol}_${Date.now().toString().slice(-4)}`,
      label: `Node Col ${nextCol}`,
      sublabel: 'Service',
      icon: 'server',
      col: nextCol
    };
    updateComponent({ nodes: [...nodes, newNode] });
  };

  const addNodeToCol = (colNum) => {
    const newNode = {
      id: `node_${colNum}_${Date.now().toString().slice(-4)}`,
      label: `New Node`,
      sublabel: 'Service',
      icon: 'server',
      col: colNum
    };
    updateComponent({ nodes: [...nodes, newNode] });
  };

  const updateNode = (nodeId, updates) => {
    const updatedNodes = nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n));
    updateComponent({ nodes: updatedNodes });
  };

  const removeNode = (nodeId) => {
    const updatedNodes = nodes.filter((n) => n.id !== nodeId);
    const updatedEdges = edges.filter((e) => e.from !== nodeId && e.to !== nodeId);
    updateComponent({ nodes: updatedNodes, edges: updatedEdges });
  };

  // Edge Mutations
  const addEdge = () => {
    updateComponent({ edges: [...edges, { from: '---', to: '---' }] });
  };

  const updateEdge = (index, key, value) => {
    const updatedEdges = [...edges];
    const currentEdge = updatedEdges[index];
    const newEdge = { ...currentEdge, [key]: value };

    if (newEdge.from !== '---' && newEdge.to !== '---') {
      const isDuplicate = edges.some(
        (e, idx) => idx !== index && e.from === newEdge.from && e.to === newEdge.to
      );
      if (isDuplicate) {
        if (onNotification) {
          onNotification({
            type: 'warning',
            message: 'An edge between these two nodes already exists.'
          });
        }
        return;
      }

      const fromNode = nodes.find((n) => n.id === newEdge.from);
      const toNode = nodes.find((n) => n.id === newEdge.to);

      if (fromNode && toNode) {
        const colDiff = Math.abs((fromNode.col || 1) - (toNode.col || 1));
        if (colDiff !== 1) {
          if (onNotification) {
            onNotification({
              type: 'warning',
              message: 'Edges can only be placed between 2 nodes in adjacent columns.'
            });
          }
          return;
        }
      }
    }

    updatedEdges[index] = newEdge;
    updateComponent({ edges: updatedEdges });
  };

  const removeEdge = (index) => {
    const updatedEdges = edges.filter((_, idx) => idx !== index);
    updateComponent({ edges: updatedEdges });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', minWidth: 0 }}>
      {/* Component Metadata */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', width: '100%' }}>
        <div className="sr-form-group" style={{ minWidth: 0 }}>
          <label className="sr-label">Component ID</label>
          <input 
            type="text" 
            className="sr-input" 
            value={component.id || ''} 
            onChange={(e) => updateComponent({ id: e.target.value })} 
          />
        </div>
        <div className="sr-form-group" style={{ minWidth: 0 }}>
          <label className="sr-label">Simulation Title</label>
          <input 
            type="text" 
            className="sr-input" 
            value={component.title || ''} 
            onChange={(e) => updateComponent({ title: e.target.value })} 
          />
        </div>
      </div>

      {/* Horizontal Column Layout Builder */}
      <div style={{ minWidth: 0 }}>
        <div className="sr-flex-between" style={{ marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className="sr-label">GRAPH TOPOLOGY ({columnCount} COLUMNS, {nodes.length} NODES)</span>
          <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={addColumn}>
            <Plus size={13} />
            <span>Add Column</span>
          </button>
        </div>

        {/* Column Columns Flex Container */}
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', width: '100%' }}>
          {Array.from({ length: columnCount }, (_, i) => i + 1).map((colNum) => {
            const colNodes = nodes.filter((n) => (n.col || 1) === colNum);

            return (
              <div 
                key={colNum}
                style={{ 
                  flex: '1 0 190px', 
                  minWidth: '180px',
                  backgroundColor: 'var(--sr-color-bg-base)', 
                  border: '1px solid var(--sr-color-border)', 
                  borderRadius: 'var(--sr-radius-md)', 
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div className="sr-flex-between" style={{ paddingBottom: '0.35rem', borderBottom: '1px solid var(--sr-color-border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sr-color-primary)' }}>Column {colNum}</span>
                  <button className="sr-btn sr-btn-secondary" style={{ padding: '0.15rem 0.35rem', fontSize: '0.68rem' }} onClick={() => addNodeToCol(colNum)}>
                    <Plus size={11} />
                    <span>Node</span>
                  </button>
                </div>

                {colNodes.map((node) => (
                  <div key={node.id} style={{ padding: '0.5rem', backgroundColor: 'var(--sr-color-bg-surface)', border: '1px solid var(--sr-color-border-subtle)', borderRadius: 'var(--sr-radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0 }}>
                    <div className="sr-flex-between" style={{ gap: '0.25rem' }}>
                      <input 
                        type="text" 
                        className="sr-input" 
                        style={{ padding: '0.15rem 0.3rem', fontSize: '0.8rem', fontWeight: 600, flex: 1, minWidth: 0 }}
                        value={node.label || ''} 
                        onChange={(e) => updateNode(node.id, { label: e.target.value })} 
                        placeholder="Node Label"
                      />
                      <button className="sr-btn sr-btn-secondary" style={{ padding: '0.15rem', color: '#ef4444', flexShrink: 0 }} onClick={() => removeNode(node.id)}>
                        <Trash2 size={11} />
                      </button>
                    </div>

                    <input 
                      type="text" 
                      className="sr-input" 
                      style={{ padding: '0.15rem 0.3rem', fontSize: '0.7rem', width: '100%', minWidth: 0 }}
                      value={node.id} 
                      onChange={(e) => updateNode(node.id, { id: e.target.value })} 
                      placeholder="node_id"
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', width: '100%' }}>
                      <input 
                        type="text" 
                        className="sr-input" 
                        style={{ padding: '0.15rem 0.3rem', fontSize: '0.65rem', minWidth: 0 }}
                        value={node.sublabel || ''} 
                        onChange={(e) => updateNode(node.id, { sublabel: e.target.value })} 
                        placeholder="Sublabel"
                      />

                      <select 
                        className="sr-input" 
                        style={{ padding: '0.15rem 0.3rem', fontSize: '0.65rem', minWidth: 0 }}
                        value={node.icon || 'server'} 
                        onChange={(e) => updateNode(node.id, { icon: e.target.value })}
                      >
                        {PRESET_ICONS.map((iconName) => (
                          <option key={iconName} value={iconName}>{iconName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edges Configuration Section */}
      <div style={{ minWidth: 0 }}>
        <div className="sr-flex-between" style={{ marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className="sr-label">CONNECTOR EDGES ({edges.length})</span>
          <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={addEdge}>
            <Plus size={13} />
            <span>Add Edge</span>
          </button>
        </div>

        <p style={{ fontSize: '0.725rem', color: 'var(--sr-color-text-subtle)', margin: '0 0 0.5rem 0' }}>
          Edges can only be placed between 2 nodes in adjacent columns.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {edges.map((edge, idx) => (
            <div key={idx} className="sr-flex-between" style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--sr-radius-md)', border: '1px solid var(--sr-color-border)', backgroundColor: 'var(--sr-color-bg-base)', flexWrap: 'wrap', gap: '0.5rem', minWidth: 0 }}>
              <div className="sr-flex-gap" style={{ flex: '1 1 200px', minWidth: 0 }}>
                <select 
                  className="sr-input" 
                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', flex: 1, minWidth: 0 }}
                  value={edge.from}
                  onChange={(e) => updateEdge(idx, 'from', e.target.value)}
                >
                  <option value="---">---</option>
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>{n.label || n.id} (Col {n.col || 1})</option>
                  ))}
                </select>

                <ArrowRight size={14} style={{ color: 'var(--sr-color-primary)', flexShrink: 0 }} />

                <select 
                  className="sr-input" 
                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', flex: 1, minWidth: 0 }}
                  value={edge.to}
                  onChange={(e) => updateEdge(idx, 'to', e.target.value)}
                >
                  <option value="---">---</option>
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>{n.label || n.id} (Col {n.col || 1})</option>
                  ))}
                </select>
              </div>

              <button className="sr-btn sr-btn-secondary" style={{ padding: '0.2rem', color: '#ef4444', marginLeft: 'auto', flexShrink: 0 }} onClick={() => removeEdge(idx)}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}