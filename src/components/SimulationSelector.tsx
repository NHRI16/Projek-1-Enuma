import React from 'react';
import type { SimulationType } from '../physics/types';
import { simulationConfigs } from '../physics/configs';

interface Props {
  selected: SimulationType;
  onSelect: (s: SimulationType) => void;
}

const SimulationSelector: React.FC<Props> = ({ selected, onSelect }) => (
  <div style={{
    display: 'flex', gap: '4px', overflowX: 'auto', WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none', msOverflowStyle: 'none',
    padding: '2px 0',
  }}>
    {simulationConfigs.map((c) => {
      const active = selected === c.id;
      return (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className="cursor-pointer"
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: active ? 600 : 400,
            background: active ? 'var(--accent)' : 'var(--bg-card)',
            color: active ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'all 0.15s',
          }}
        >
          {c.shortName}
        </button>
      );
    })}
  </div>
);

export default SimulationSelector;
