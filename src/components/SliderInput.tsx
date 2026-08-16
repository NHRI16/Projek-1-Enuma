import React from 'react';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}

const SliderInput: React.FC<Props> = ({ label, value, min, max, step, unit, onChange }) => (
  <div style={{ marginBottom: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {label}
      </label>
      <span style={{
        fontSize: '12px', fontWeight: 600, color: 'var(--accent)',
        background: 'var(--accent-bg)', padding: '2px 8px', borderRadius: '4px',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}{unit && ` ${unit}`}
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

export default SliderInput;
