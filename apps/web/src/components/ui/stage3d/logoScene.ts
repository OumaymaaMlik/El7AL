/* eslint-disable @typescript-eslint/no-explicit-any */
import { SEVEN_ASPECT, SEVEN_POINTS } from '../../../lib/sevenGlyph';

/**
 * The El 7al "7" as a solid slab: the outline of lib/sevenGlyph.ts (the same shape as the header logo), extruded and
 * bevelled. Scene units, y up, centred on the origin.
 */
function build7(T: any, material: any) {
  const height = 2.7;
  const width = height * SEVEN_ASPECT;
  const shape = new T.Shape();
  SEVEN_POINTS.forEach(([x, y], i) => {
    const sx = (x - 0.5) * width;
    const sy = (0.5 - y) * height;
    if (i === 0) shape.moveTo(sx, sy);
    else shape.lineTo(sx, sy);
  });
  shape.closePath();

  const geometry = new T.ExtrudeGeometry(shape, {
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 4,
  });
  geometry.translate(0, 0, -0.25);
  return new T.Mesh(geometry, material);
}

/** The 7 spinning around its vertical axis over a floor of expanding rings, in the colours of the other scenes. */
export function buildLogoScene(T: any) {
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(34, 1, 0.1, 50);
  cam.position.set(0, 0.5, 7.2);
  scene.add(new T.HemisphereLight(0xe9ffe0, 0x063a24, 1.0));
  const key = new T.DirectionalLight(0xffffff, 1.0);
  key.position.set(2.5, 4, 5);
  scene.add(key);
  const rim = new T.DirectionalLight(0xa3e635, 0.8);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  const lime = new T.MeshStandardMaterial({ color: 0xa3e635, roughness: 0.3, metalness: 0.12 });

  const logo = new T.Group();
  logo.add(build7(T, lime));
  logo.position.y = 0.55;
  logo.scale.setScalar(0.85);
  scene.add(logo);

  const floor = new T.Mesh(
    new T.CylinderGeometry(3.4, 3.4, 0.08, 64),
    new T.MeshStandardMaterial({ color: 0x0a4a2f, roughness: 1 }),
  );
  floor.position.y = -1.55;
  scene.add(floor);

  const rings: any[] = [];
  for (let i = 0; i < 3; i++) {
    const rg = new T.Mesh(
      new T.RingGeometry(0.92, 1, 64),
      new T.MeshBasicMaterial({
        color: 0xa3e635,
        transparent: true,
        opacity: 0,
        side: T.DoubleSide,
        depthWrite: false,
      }),
    );
    rg.rotation.x = -Math.PI / 2;
    rg.position.y = -1.5;
    scene.add(rg);
    rings.push(rg);
  }

  // A soft shadow under the logo.
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g2 = c.getContext('2d')!;
  const gr = g2.createRadialGradient(32, 32, 2, 32, 32, 32);
  gr.addColorStop(0, 'rgba(0,0,0,.5)');
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g2.fillStyle = gr;
  g2.fillRect(0, 0, 64, 64);
  const shadow = new T.Mesh(
    new T.PlaneGeometry(1, 1),
    new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.49;
  scene.add(shadow);

  return { scene, cam, logo, rings, shadow };
}

/** Turns at one revolution every 8 seconds, with a gentle float. */
export function poseLogoScene(o: any, t: number, still: boolean) {
  const angle = still ? 0.55 : (t / 8) * Math.PI * 2;
  const bob = still ? 0 : Math.sin(t * 1.3) * 0.08;
  o.logo.rotation.y = angle;
  o.logo.position.y = 0.55 + bob;
  const s = 1.7 - bob * 1.5;
  o.shadow.scale.set(s, s, 1);
  o.rings.forEach((r: any, i: number) => {
    const k = still ? 0.4 : (t * 0.28 + i / 3) % 1;
    r.scale.setScalar(0.6 + k * 2.6);
    r.material.opacity = (1 - k) * 0.55;
  });
}
