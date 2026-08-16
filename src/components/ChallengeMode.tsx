import React, { useState, useCallback } from 'react';
import type { SimulationType } from '../physics/types';

interface Challenge {
  id: number;
  title: string;
  desc: string;
  simType: SimulationType;
  target: { resultLabel: string; value: number; tolerance: number; unit: string };
  hint: string;
  level: string;
}

const challenges: Challenge[] = [
  { id: 1, title: 'Penembak Jitu', desc: 'Buat proyektil mencapai jarak horizontal 40 m.', simType: 'projectile', target: { resultLabel: 'Jarak Horizontal', value: 40, tolerance: 3, unit: 'm' }, hint: 'Sudut 45° memberikan jangkauan maksimum.', level: 'Dasar' },
  { id: 2, title: 'Pendulum Presisi', desc: 'Atur panjang tali agar periode bandul tepat 2 detik.', simType: 'pendulum', target: { resultLabel: 'Periode', value: 2, tolerance: 0.1, unit: 's' }, hint: 'T = 2π√(L/g) → L ≈ 1.0 m untuk g = 9.8', level: 'Menengah' },
  { id: 3, title: 'Jatuh Tepat Waktu', desc: 'Atur ketinggian agar benda jatuh dalam 3 detik.', simType: 'freefall', target: { resultLabel: 'Waktu Jatuh', value: 3, tolerance: 0.2, unit: 's' }, hint: 'h = ½gt² → h ≈ 44 m', level: 'Dasar' },
  { id: 4, title: 'Resonansi Pegas', desc: 'Atur konstanta pegas agar frekuensi = 1 Hz.', simType: 'spring', target: { resultLabel: 'Frekuensi', value: 1, tolerance: 0.1, unit: 'Hz' }, hint: 'f = (1/2π)√(k/m). Untuk m=2kg → k ≈ 79 N/m', level: 'Lanjut' },
  { id: 5, title: 'Luncuran Terkendali', desc: 'Atur agar percepatan di bidang miring = 3 m/s².', simType: 'inclinedPlane', target: { resultLabel: 'Percepatan', value: 3, tolerance: 0.3, unit: 'm/s²' }, hint: 'a = g(sinθ − μcosθ). Coba θ ≈ 35°, μ kecil.', level: 'Menengah' },
];

interface Props {
  onSelectChallenge: (s: SimulationType) => void;
  currentResults: { label: string; value: string; unit: string }[];
}

const ChallengeMode: React.FC<Props> = ({ onSelectChallenge, currentResults }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Challenge | null>(null);
  const [showHint, setShowHint] = useState(false);

  const check = useCallback(() => {
    if (!active) return null;
    const r = currentResults.find((x) => x.label === active.target.resultLabel);
    if (!r) return null;
    const v = parseFloat(r.value);
    if (isNaN(v)) return null;
    const diff = Math.abs(v - active.target.value);
    if (diff <= active.target.tolerance) return 'pass';
    if (diff <= active.target.tolerance * 3) return 'close';
    return 'far';
  }, [active, currentResults]);

  const status = check();

  const levelColor = (l: string) => l === 'Dasar' ? 'var(--success)' : l === 'Menengah' ? 'var(--accent)' : 'var(--danger)';

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer"
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'none', border: 'none', padding: 0,
          fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)',
        }}
      >
        <span>Tantangan</span>
        <span style={{ fontSize: '10px', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)', color: 'var(--text-tertiary)' }}>▾</span>
      </button>

      {open && !active && (
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {challenges.map((ch) => (
            <button
              key={ch.id}
              onClick={() => { setActive(ch); setShowHint(false); onSelectChallenge(ch.simType); }}
              className="cursor-pointer"
              style={{
                textAlign: 'left', padding: '10px', borderRadius: '6px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{ch.title}</span>
                <span style={{ fontSize: '9px', fontWeight: 600, color: levelColor(ch.level), background: 'var(--accent-bg)', padding: '1px 6px', borderRadius: '3px' }}>{ch.level}</span>
              </div>
              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0 }}>{ch.desc}</p>
            </button>
          ))}
        </div>
      )}

      {open && active && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{active.title}</span>
              <span style={{ fontSize: '9px', fontWeight: 600, color: levelColor(active.level) }}>{active.level}</span>
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '0 0 8px' }}>{active.desc}</p>
            <div style={{ textAlign: 'center', padding: '8px', background: 'var(--accent-bg)', borderRadius: '4px', border: '1px solid var(--accent-border)' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Target</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)' }}>
                {active.target.resultLabel} = {active.target.value} {active.target.unit}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', marginTop: '2px' }}>toleransi ±{active.target.tolerance}</div>
            </div>
          </div>

          {status && (
            <div style={{
              padding: '8px', borderRadius: '6px', textAlign: 'center', marginBottom: '8px',
              background: status === 'pass' ? 'rgba(22,163,74,0.1)' : status === 'close' ? 'var(--accent-bg)' : 'rgba(220,38,38,0.06)',
              border: `1px solid ${status === 'pass' ? 'rgba(22,163,74,0.3)' : status === 'close' ? 'var(--accent-border)' : 'rgba(220,38,38,0.15)'}`,
            }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: status === 'pass' ? 'var(--success)' : status === 'close' ? 'var(--accent)' : 'var(--danger)' }}>
                {status === 'pass' ? 'Berhasil! Target tercapai.' : status === 'close' ? 'Hampir! Sedikit lagi.' : 'Belum tepat. Coba ubah parameter.'}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setShowHint(!showHint)} className="cursor-pointer" style={{
              flex: 1, padding: '7px', borderRadius: '5px', fontSize: '10px', fontWeight: 500,
              background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
            }}>
              {showHint ? 'Tutup Petunjuk' : 'Petunjuk'}
            </button>
            <button onClick={() => { setActive(null); setShowHint(false); }} className="cursor-pointer" style={{
              flex: 1, padding: '7px', borderRadius: '5px', fontSize: '10px', fontWeight: 500,
              background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
            }}>
              Kembali
            </button>
          </div>

          {showHint && (
            <div style={{ marginTop: '6px', padding: '8px', borderRadius: '4px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
              <p style={{ fontSize: '10px', color: 'var(--accent)', margin: 0 }}>{active.hint}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChallengeMode;
