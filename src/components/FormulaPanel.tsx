import React, { useState } from 'react';
import type { SimulationType } from '../physics/types';
import { simulationConfigs } from '../physics/configs';

interface Props {
  simType: SimulationType;
  defaultOpen?: boolean;
}

const FormulaPanel: React.FC<Props> = ({ simType, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const config = simulationConfigs.find((c) => c.id === simType)!;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer"
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'none', border: 'none', padding: '4px 0',
          fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
        }}
      >
        <span>Rumus & Edukasi</span>
        <span style={{
          fontSize: '11px', transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          color: 'var(--text-tertiary)',
        }}>
          ▾
        </span>
      </button>

      {open && (
        <div style={{ marginTop: '12px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
            {config.description}
          </p>

          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Rumus</p>
            {config.formula.map((f, i) => (
              <div key={i} style={{
                fontFamily: 'ui-monospace, monospace', fontSize: '12px', color: 'var(--text-primary)',
                background: 'var(--bg)', border: '1px solid var(--border)',
                padding: '8px 12px', borderRadius: '6px', marginBottom: '4px',
              }}>
                {f}
              </div>
            ))}
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Catatan</p>
            {config.notes.map((note, i) => (
              <div key={i} style={{
                fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6,
                paddingLeft: '12px', borderLeft: '2px solid var(--border)',
                marginBottom: '8px',
              }}>
                {note}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormulaPanel;
