import { FolderOpen, Plus } from 'lucide-react';

export default function NoScenarioSlate({ onNavigateToBrowser, handleCreateNewAndLoad, isEditor }) {
  return (
      <div className="sr-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="sr-empty-state" style={{ padding: '3rem', maxWidth: '440px', width: '100%', textAlign: 'center', height: 'auto' }}>
          <FolderOpen size={42} style={{ color: 'var(--sr-color-primary)', marginBottom: '1rem' }} />
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600 }}>No Scenario Selected</h2>
          <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: 'var(--sr-color-text-muted)', lineHeight: 1.5 }}>
            {isEditor
              ? 'Select an existing custom scenario from the repository to edit, or create a new one to start authoring.'
              : 'Select an existing custom scenario to Simulate.'}
            {' Alternatively, create a new scenario to start building your own custom API demonstration.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
            <button className="sr-btn sr-btn-secondary" onClick={onNavigateToBrowser} style={{ gap: '0.35rem' }}>
              <FolderOpen size={14} />
              <span>Select Existing Scenario</span>
            </button>
            {isEditor && (
              <button className="sr-btn sr-btn-primary" onClick={handleCreateNewAndLoad} style={{ gap: '0.35rem' }}>
                <Plus size={14} />
                <span>Create New Scenario</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
}