import type { SimulationConfig } from './types';

export const simulationConfigs: SimulationConfig[] = [
  {
    id: 'projectile',
    name: 'Gerak Proyektil',
    shortName: 'Proyektil',
    description: 'Simulasi gerak parabola benda yang dilempar dengan sudut dan kecepatan tertentu terhadap horizontal.',
    formula: [
      'x = v₀ cos(θ) · t',
      'y = v₀ sin(θ) · t − ½ g t²',
      'H = v₀² sin²(θ) / 2g',
      'R = v₀² sin(2θ) / g',
    ],
    notes: [
      'Sudut 45° menghasilkan jangkauan maksimum pada kondisi ideal.',
      'Komponen horizontal bergerak konstan, vertikal mengalami percepatan gravitasi.',
      'Massa tidak mempengaruhi lintasan jika hambatan udara diabaikan.',
    ],
  },
  {
    id: 'freefall',
    name: 'Jatuh Bebas',
    shortName: 'Jatuh Bebas',
    description: 'Simulasi benda jatuh dari ketinggian tertentu hanya dipengaruhi gaya gravitasi.',
    formula: [
      'h = ½ g t²',
      'v = g · t',
      't = √(2h / g)',
      'Ek = ½ m v²',
    ],
    notes: [
      'Semua benda jatuh dengan percepatan sama tanpa hambatan udara.',
      'Energi potensial berkonversi menjadi energi kinetik selama jatuh.',
      'Hambatan udara menyebabkan benda mencapai kecepatan terminal.',
    ],
  },
  {
    id: 'pendulum',
    name: 'Bandul Sederhana',
    shortName: 'Bandul',
    description: 'Simulasi osilasi bandul yang berayun akibat gaya gravitasi pada sudut kecil.',
    formula: [
      'T = 2π √(L / g)',
      'f = 1 / T',
      'θ(t) = θ₀ cos(ωt) · e^(−γt)',
      'v_max = √(2gL(1 − cos θ₀))',
    ],
    notes: [
      'Periode bandul bergantung pada panjang tali dan gravitasi, bukan massa.',
      'Rumus T = 2π√(L/g) akurat untuk osilasi sudut kecil (< 15°).',
      'Redaman menyebabkan amplitudo berkurang secara eksponensial.',
    ],
  },
  {
    id: 'spring',
    name: 'Osilasi Pegas',
    shortName: 'Pegas',
    description: 'Simulasi osilasi harmonik pegas berdasarkan Hukum Hooke.',
    formula: [
      'F = −k · x',
      'T = 2π √(m / k)',
      'x(t) = A cos(ωt) · e^(−γt)',
      'Ep = ½ k x²',
    ],
    notes: [
      'Gaya pemulih pegas selalu berlawanan arah dengan simpangan.',
      'Periode bergantung pada massa dan konstanta pegas.',
      'Energi total = energi kinetik + energi potensial elastis.',
    ],
  },
  {
    id: 'inclinedPlane',
    name: 'Bidang Miring',
    shortName: 'Bidang Miring',
    description: 'Simulasi benda meluncur pada bidang miring dengan gaya gesek.',
    formula: [
      'F∥ = mg sin(θ)',
      'N = mg cos(θ)',
      'f = μN',
      'a = g(sin θ − μ cos θ)',
    ],
    notes: [
      'Benda meluncur jika komponen gravitasi sejajar bidang melebihi gaya gesek.',
      'Sudut kritis θ_c = arctan(μ) menentukan batas gerak.',
      'Gaya normal pada bidang miring selalu lebih kecil dari berat benda.',
    ],
  },
];
