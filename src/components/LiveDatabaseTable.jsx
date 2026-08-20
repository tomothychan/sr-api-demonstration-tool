import React from 'react';
import { Database, Plus, Edit2, Minus, Check } from 'lucide-react';

export default function LiveDatabaseTable({ 
  tableName = "SmartRecruiters DB (candidates_records)", 
  records = [], 
  columns = [] 
}) {
  const getRowStyle = (status) => {
    switch (status) {
      case 'added':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          borderLeft: '4px solid #10b981',
          color: 'var(--sr-color-text-main, #e2e8f0)'
        };
      case 'updated':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          borderLeft: '4px solid #f59e0b',
          color: 'var(--sr-color-text-main, #e2e8f0)'
        };
      case 'deleted':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          borderLeft: '4px solid #ef4444',
          color: 'var(--sr-color-text-subtle, #94a3b8)',
          textDecoration: 'line-through'
        };
      default:
        return {
          backgroundColor: 'transparent',
          borderLeft: '4px solid transparent',
          color: 'var(--sr-color-text-main, #cbd5e1)'
        };
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'added':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#10b981', color: '#ffffff', fontSize: '0.68rem', fontWeight: 700 }}>
            <Plus size={12} /> ADDED
          </span>
        );
      case 'updated':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#f59e0b', color: '#ffffff', fontSize: '0.68rem', fontWeight: 700 }}>
            <Edit2 size={12} /> &gt; UPDATED
          </span>
        );
      case 'deleted':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '0.68rem', fontWeight: 700 }}>
            <Minus size={12} /> DELETED
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'var(--sr-color-border, #334155)', color: 'var(--sr-color-text-muted, #94a3b8)', fontSize: '0.68rem' }}>
            <Check size={12} /> SYNCHRONIZED
          </span>
        );
    }
  };

  return (
    <div 
      style={{ 
        backgroundColor: 'var(--sr-color-bg-base, #0f172a)', 
        borderRadius: '10px', 
        border: '1px solid var(--sr-color-border, #334155)', 
        overflow: 'hidden',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}
    >
      {/* Table Header Banner */}
      <div 
        style={{ 
          padding: '0.875rem 1.25rem', 
          backgroundColor: 'var(--sr-color-bg-surface, #1e293b)', 
          borderBottom: '1px solid var(--sr-color-border, #334155)', 
          display: 'flex', 
          alignItems: 'center', 
          justify: 'space-between' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={18} style={{ color: '#10b981' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--sr-color-text-main, #f8fafc)' }}>
            {tableName}
          </span>
        </div>
        <span style={{ fontSize: '0.725rem', color: 'var(--sr-color-text-muted, #64748b)' }}>
          {records.length} records total
        </span>
      </div>

      {/* Database Table Container */}
      <div style={{ overflowX: 'auto', maxHeight: '340px', paddingBottom: '0.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.775rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--sr-color-bg-base, #0f172a)', borderBottom: '1px solid var(--sr-color-border, #334155)', color: 'var(--sr-color-text-muted, #94a3b8)' }}>
              <th style={{ padding: '0.65rem 0.85rem', width: '110px' }}>STATE</th>
              {columns.map((col, idx) => (
                <th key={idx} style={{ padding: '0.65rem 0.85rem' }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--sr-color-text-subtle, #64748b)' }}>
                  No database entries created yet. Run the simulation to insert records.
                </td>
              </tr>
            ) : (
              records.map((row) => (
                <tr 
                  key={row.id} 
                  style={{ 
                    ...getRowStyle(row._rowStatus), 
                    borderBottom: '1px solid var(--sr-color-border-subtle, var(--sr-color-border, #1e293b))', 
                    transition: 'all 0.3s ease' 
                  }}
                >
                  <td style={{ padding: '0.65rem 0.85rem' }}>
                    {renderStatusBadge(row._rowStatus)}
                  </td>
                  {columns.map((col, idx) => (
                    <td 
                      key={idx} 
                      style={{ 
                        padding: '0.65rem 0.85rem',
                        backgroundColor: row._updatedFields?.includes(col.key) ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                        fontWeight: row._updatedFields?.includes(col.key) ? 700 : 400
                      }}
                    >
                      {row[col.key] !== undefined ? String(row[col.key]) : '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}