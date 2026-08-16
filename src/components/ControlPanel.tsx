import React from 'react';
import type { SimulationType } from '../physics/types';
import SliderInput from './SliderInput';

interface Props {
  simType: SimulationType;
  params: Record<string, number>;
  onChange: (key: string, value: number) => void;
  onRun: () => void;
  onReset: () => void;
  isRunning: boolean;
}

const ControlPanel: React.FC<Props> = ({ simType, params, onChange, onRun, onReset, isRunning }) => {
  const S = (label: string, key: string, min: number, max: number, step: number, unit: string) => (
    <SliderInput key={key} label={label} value={params[key]} min={min} max={max} step={step} unit={unit} onChange={(v) => onChange(key, v)} />
  );

  const controls = () => {
    switch (simType) {
      case 'projectile':
        return <>{S('Sudut', 'angle', 5, 85, 1, '°')}{S('Kecepatan Awal', 'velocity', 5, 50, 1, 'm/s')}{S('Massa', 'mass', 0.5, 10, 0.5, 'kg')}{S('Gravitasi', 'gravity', 1, 25, 0.5, 'm/s²')}{S('Angin', 'wind', -10, 10, 0.5, 'm/s')}{S('Hambatan Udara', 'friction', 0, 1, 0.05, '')}</>;
      case 'freefall':
        return <>{S('Ketinggian', 'height', 5, 100, 5, 'm')}{S('Massa', 'mass', 0.5, 20, 0.5, 'kg')}{S('Gravitasi', 'gravity', 1, 25, 0.5, 'm/s²')}{S('Hambatan Udara', 'friction', 0, 2, 0.1, '')}</>;
      case 'pendulum':
        return <>{S('Panjang Tali', 'length', 0.5, 5, 0.1, 'm')}{S('Sudut Awal', 'angle', 5, 60, 1, '°')}{S('Massa', 'mass', 0.5, 10, 0.5, 'kg')}{S('Gravitasi', 'gravity', 1, 25, 0.5, 'm/s²')}{S('Redaman', 'damping', 0, 2, 0.05, '')}</>;
      case 'spring':
        return <>{S('Konstanta Pegas (k)', 'springConstant', 5, 100, 5, 'N/m')}{S('Massa', 'mass', 0.5, 10, 0.5, 'kg')}{S('Simpangan Awal', 'displacement', 0.1, 2, 0.1, 'm')}{S('Redaman', 'damping', 0, 2, 0.05, '')}{S('Gravitasi', 'gravity', 1, 25, 0.5, 'm/s²')}</>;
      case 'inclinedPlane':
        return <>{S('Sudut Kemiringan', 'angle', 5, 80, 1, '°')}{S('Massa', 'mass', 0.5, 20, 0.5, 'kg')}{S('Gravitasi', 'gravity', 1, 25, 0.5, 'm/s²')}{S('Koef. Gesek', 'friction', 0, 1, 0.05, '')}{S('Panjang Bidang', 'length', 2, 20, 1, 'm')}</>;
    }
  };

  return (
    <div>
      {controls()}
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button
          onClick={onRun}
          className="cursor-pointer"
          style={{
            flex: 1, padding: '12px 0', borderRadius: '8px', fontWeight: 600, fontSize: '13px',
            background: 'var(--accent)', color: '#fff', border: 'none',
          }}
        >
          {isRunning ? 'Jalankan Ulang' : 'Mulai Simulasi'}
        </button>
        <button
          onClick={onReset}
          className="cursor-pointer"
          style={{
            padding: '12px 16px', borderRadius: '8px', fontWeight: 500, fontSize: '13px',
            background: 'var(--bg)', color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
