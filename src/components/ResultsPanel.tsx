import React from 'react';
import type { PhysicsResult } from '../physics/types';

interface Props {
  results: PhysicsResult[];
  progress: number;
}

const ResultsPanel: React.FC<Props> = ({ results, progress }) => (
  <div>
    <div style={{
      height: '3px', background: 'var(--border)', borderRadius: '2px',
      overflow: 'hidden', marginBottom: '12px',
    }}>
      <div style={{
        height: '100%', width: `${Math.min(progress * 100, 100)}%`,
        background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.3s',
      }} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
      {results.map((r, i) => (
        <div key={i} style={{
          padding: '10px', borderRadius: '8px',
          background: 'var(--bg)', border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginBottom: '3px' }}>
            {r.label}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {r.value}
            {r.unit && <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '3px' }}>{r.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ResultsPanel;
