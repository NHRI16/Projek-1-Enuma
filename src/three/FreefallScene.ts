import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import type { FreefallParams } from '../physics/types';

export function createFreefallScene(
  m: SceneManager,
  p: FreefallParams,
  onProgress?: (v: number) => void
) {
  m.clearScene();
  m.setupEnvironment();
  m.setupLighting();
  m.createGround(300);

  const sc = 1.0;
  const sH = p.height * sc;
  const tTotal = Math.sqrt((2 * p.height) / p.gravity);
  const radius = 0.3 + p.mass * 0.03;
  const termV = p.friction > 0 ? (p.mass * p.gravity) / (p.friction * 5) : Infinity;

  // ===== Ball with emissive glow =====
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    new THREE.MeshStandardMaterial({
      color: m.theme.object,
      roughness: 0.15,
      metalness: 0.7,
      emissive: m.theme.object,
      emissiveIntensity: 0.35,
    })
  );
  ball.castShadow = true;
  ball.position.set(0, sH, 0);
  m.scene.add(ball);

  // Glow ring around ball (sprite)
  const glowGeo = new THREE.RingGeometry(radius * 1.2, radius * 1.6, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: m.theme.object,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
  });
  const glowRing = new THREE.Mesh(glowGeo, glowMat);
  ball.add(glowRing);

  // ===== Platform at top =====
  const plat = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.2, 3),
    new THREE.MeshStandardMaterial({
      color: m.theme.structure,
      roughness: 0.4,
      metalness: 0.4,
      emissive: m.theme.structure,
      emissiveIntensity: 0.05,
    })
  );
  plat.position.set(0, sH + 0.1, 0);
  plat.castShadow = true;
  m.scene.add(plat);

  // ===== Support pillars =====
  for (const xo of [-1.2, 1.2]) {
    for (const zo of [-1.2, 1.2]) {
      const pil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, sH, 8),
        new THREE.MeshStandardMaterial({
          color: m.theme.structure,
          roughness: 0.4,
          metalness: 0.5,
          emissive: m.theme.structure,
          emissiveIntensity: 0.03,
        })
      );
      pil.position.set(xo, sH / 2, zo);
      pil.castShadow = true;
      m.scene.add(pil);
    }
  }

  // ===== Height ruler (glowing) =====
  const ruler = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, sH, 0.08),
    new THREE.MeshBasicMaterial({
      color: m.theme.trail,
      transparent: true,
      opacity: 0.6,
    })
  );
  ruler.position.set(-2.5, sH / 2, 0);
  m.scene.add(ruler);

  // ===== Height markers with labels =====
  const tickCount = Math.min(Math.floor(p.height / 5), 20);
  for (let i = 0; i <= tickCount; i++) {
    const y = (i / tickCount) * sH;
    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.03, 0.03),
      new THREE.MeshBasicMaterial({
        color: m.theme.accent,
        transparent: true,
        opacity: 0.6,
      })
    );
    tick.position.set(-2.5, y, 0);
    m.scene.add(tick);

    // Small sphere marker at each tick
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      new THREE.MeshBasicMaterial({
        color: m.theme.accent,
        transparent: true,
        opacity: 0.8,
      })
    );
    dot.position.set(-2.2, y, 0);
    m.scene.add(dot);
  }

  // ===== Trail =====
  const trailPts: THREE.Vector3[] = [];
  const trailGeo = new THREE.BufferGeometry();
  m.scene.add(new THREE.Line(trailGeo, new THREE.LineBasicMaterial({
    color: m.theme.object, transparent: true, opacity: 0.8,
  })));

  // ===== Ghost path (dashed line showing expected trajectory) =====
  const ghostPts: THREE.Vector3[] = [
    new THREE.Vector3(0, sH, 0),
    new THREE.Vector3(0, radius, 0),
  ];
  const ghostGeo = new THREE.BufferGeometry().setFromPoints(ghostPts);
  const ghostLine = new THREE.Line(ghostGeo, new THREE.LineDashedMaterial({
    color: m.theme.trail, dashSize: 0.4, gapSize: 0.2, transparent: true, opacity: 0.35,
  }));
  ghostLine.computeLineDistances();
  m.scene.add(ghostLine);

  // ===== Impact zone ring (on ground) with glow =====
  const impactRing = new THREE.Mesh(
    new THREE.RingGeometry(0.5, 0.7, 32),
    new THREE.MeshBasicMaterial({
      color: m.theme.accent,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    })
  );
  impactRing.rotation.x = -Math.PI / 2;
  impactRing.position.set(0, 0.02, 0);
  m.scene.add(impactRing);

  // Outer pulsing ring
  const outerRing = new THREE.Mesh(
    new THREE.RingGeometry(0.8, 1.0, 32),
    new THREE.MeshBasicMaterial({
      color: m.theme.accent,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    })
  );
  outerRing.rotation.x = -Math.PI / 2;
  outerRing.position.set(0, 0.015, 0);
  m.scene.add(outerRing);

  // ===== Impact zone cross =====
  const crossSize = 0.8;
  const crossLine1 = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-crossSize, 0.03, -crossSize),
      new THREE.Vector3(crossSize, 0.03, crossSize),
    ]),
    new THREE.LineBasicMaterial({ color: m.theme.accent, transparent: true, opacity: 0.4 })
  );
  const crossLine2 = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-crossSize, 0.03, crossSize),
      new THREE.Vector3(crossSize, 0.03, -crossSize),
    ]),
    new THREE.LineBasicMaterial({ color: m.theme.accent, transparent: true, opacity: 0.4 })
  );
  m.scene.add(crossLine1);
  m.scene.add(crossLine2);

  // ===== Impact particles (hidden initially) =====
  const particleCount = 40;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities: THREE.Vector3[] = [];
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = 0;
    particlePositions[i * 3 + 1] = radius;
    particlePositions[i * 3 + 2] = 0;
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 3;
    const upSpeed = 2 + Math.random() * 4;
    particleVelocities.push(new THREE.Vector3(
      Math.cos(angle) * speed,
      upSpeed,
      Math.sin(angle) * speed
    ));
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: m.theme.accent,
    size: 0.15,
    transparent: true,
    opacity: 0,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  m.scene.add(particles);

  // ===== Setup camera follow on the ball =====
  m.setCameraFollowTarget(ball, new THREE.Vector3(6, 2, 8), new THREE.Vector3(0, -1, 0));

  // ===== Initial camera — looking at full scene height =====
  const camDist = Math.max(sH * 0.8, 12);
  m.camera.position.set(camDist * 0.6, sH * 0.6, camDist * 0.85);
  m.controls.target.set(0, sH * 0.3, 0);
  m.controls.update();

  let simT = 0;
  let landed = false;
  let landT = 0;
  let postLandTime = 0;

  const animate = () => {
    m.animationId = requestAnimationFrame(animate);
    simT += 0.014;

    if (!landed) {
      const currentV = Math.min(p.gravity * simT, termV);
      let y: number;
      if (p.friction > 0) {
        y = sH - currentV * simT * sc * 0.5;
      } else {
        y = sH - 0.5 * p.gravity * simT * simT * sc;
      }

      if (y <= radius) {
        y = radius;
        landed = true;
        landT = simT;
        // Trigger impact particles
        particleMat.opacity = 1.0;
      }
      ball.position.y = y;

      // Rotate the glow ring to face camera
      glowRing.lookAt(m.camera.position);

      // Pulse glow ring
      const pulse = 0.25 + Math.sin(simT * 6) * 0.1;
      glowMat.opacity = pulse;

      trailPts.push(new THREE.Vector3(0, y, 0));
      trailGeo.setFromPoints(trailPts);
      if (onProgress) onProgress(Math.min(simT / tTotal, 1));
    } else {
      postLandTime = simT - landT;

      // Bounce effect
      if (postLandTime < 0.8) {
        ball.position.y = radius + Math.abs(Math.sin(postLandTime * 12)) * 0.5 * Math.exp(-postLandTime * 5);
      } else {
        ball.position.y = radius;
      }

      // Pulse outer ring on impact
      const ringPulse = Math.max(0, 0.5 - postLandTime * 0.5);
      (outerRing.material as THREE.MeshBasicMaterial).opacity = ringPulse;
      outerRing.scale.setScalar(1 + postLandTime * 2);

      // Animate impact particles
      if (postLandTime < 2.0) {
        const positions = particleGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < particleCount; i++) {
          const v = particleVelocities[i];
          positions.array[i * 3] = v.x * postLandTime;
          positions.array[i * 3 + 1] = radius + v.y * postLandTime - 4.9 * postLandTime * postLandTime;
          positions.array[i * 3 + 2] = v.z * postLandTime;
          // Keep above ground
          if (positions.array[i * 3 + 1] < 0.02) positions.array[i * 3 + 1] = 0.02;
        }
        positions.needsUpdate = true;
        particleMat.opacity = Math.max(0, 1 - postLandTime * 0.6);
      } else {
        particleMat.opacity = 0;
      }

      if (onProgress) onProgress(1);
    }

    // Update follow camera
    m.updateFollowCamera(0.04);

    m.renderer.render(m.scene, m.camera);
  };
  animate();
}
