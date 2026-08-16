import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import type { SpringParams } from '../physics/types';

function makeCoilPoints(topY: number, botY: number, coils: number, r: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const segs = coils * 16;
  const h = topY - botY;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const y = topY - t * h;
    const a = t * coils * Math.PI * 2;
    if (i < 2 || i > segs - 2) {
      pts.push(new THREE.Vector3(0, y, 0));
    } else {
      pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
  }
  return pts;
}

export function createSpringScene(
  m: SceneManager,
  p: SpringParams,
  onProgress?: (v: number) => void
) {
  m.clearScene();
  m.setupEnvironment();
  m.setupLighting();

  const omega = Math.sqrt(p.springConstant / p.mass);
  const sc = 3;
  const topH = 10;
  const eqY = topH - 3.5;

  // Ground
  const gnd = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: m.theme.ground, roughness: 0.85 })
  );
  gnd.rotation.x = -Math.PI / 2;
  gnd.receiveShadow = true;
  m.scene.add(gnd);
  const grid = new THREE.GridHelper(40, 20, m.theme.gridStrong, m.theme.gridWeak);
  grid.position.y = 0.01;
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.35;
  m.scene.add(grid);

  // Support
  const support = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 0.3, 3),
    new THREE.MeshStandardMaterial({ color: m.theme.structure, roughness: 0.4, metalness: 0.5 })
  );
  support.position.set(0, topH, 0);
  support.castShadow = true;
  m.scene.add(support);

  for (const xo of [-1.8, 1.8]) {
    const pil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, topH, 8),
      new THREE.MeshStandardMaterial({ color: m.theme.structure, roughness: 0.4, metalness: 0.5 })
    );
    pil.position.set(xo, topH / 2, 0);
    pil.castShadow = true;
    m.scene.add(pil);
  }

  // Mass block
  const bSize = 0.5 + p.mass * 0.09;
  const blockGeo = new THREE.BoxGeometry(bSize, bSize, bSize);
  const blockMat = new THREE.MeshStandardMaterial({
    color: m.theme.object,
    roughness: 0.15,
    metalness: 0.6,
    emissive: m.theme.object,
    emissiveIntensity: 0.3,
  });
  const block = new THREE.Mesh(blockGeo, blockMat);
  block.castShadow = true;
  m.scene.add(block);

  // Spring line (will update each frame)
  const springMat = new THREE.LineBasicMaterial({ color: m.theme.trail });
  let springLine: THREE.Line | null = null;

  // Equilibrium dashed line
  const eqDash = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-3, eqY, 0), new THREE.Vector3(3, eqY, 0),
    ]),
    new THREE.LineDashedMaterial({
      color: 0x22c55e, dashSize: 0.2, gapSize: 0.15, transparent: true, opacity: 0.4,
    })
  );
  eqDash.computeLineDistances();
  m.scene.add(eqDash);

  // Setup camera follow
  m.setCameraFollowTarget(block, new THREE.Vector3(5, 2, 9), new THREE.Vector3(0, 1, 0));

  // Camera
  m.camera.position.set(5, topH * 0.45, 10);
  m.camera.lookAt(new THREE.Vector3(0, eqY, 0));

  let simT = 0;
  const period = (2 * Math.PI) / omega;

  const animate = () => {
    m.animationId = requestAnimationFrame(animate);
    simT += 0.016;

    const x = p.displacement * Math.cos(omega * simT) * Math.exp(-p.damping * simT * 0.3) * sc;
    const blockY = eqY - x;
    block.position.set(0, blockY - bSize / 2, 0);

    // Rebuild spring coil
    if (springLine) {
      m.scene.remove(springLine);
      springLine.geometry.dispose();
    }
    const coilPts = makeCoilPoints(topH - 0.15, blockY, 7, 0.4);
    springLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(coilPts), springMat);
    m.scene.add(springLine);

    // Squash/stretch
    const comp = 1 - x * 0.025;
    block.scale.set(1 + (1 - comp) * 0.2, comp, 1 + (1 - comp) * 0.2);

    if (onProgress) onProgress(Math.min(simT / (period * 3), 1));
    m.updateFollowCamera(0.04);
    m.renderer.render(m.scene, m.camera);
  };
  animate();
}
