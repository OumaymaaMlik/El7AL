/* eslint-disable @typescript-eslint/no-explicit-any */
import { clamp, makeCheckBadge, makeMannequin, makeShadow } from './mannequin';

export interface StairsState {
  /** Stairs climbed so far (0 to 3). */
  level: number;
  /** Account created: the mannequin jumps for joy. */
  done: boolean;
  /** Artisan sign-up: hard hat and toolbox instead of a phone. */
  pro: boolean;
}

const ease2 = (x: number) => {
  x = clamp(x, 0, 1);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};

/** The sign-up told as a staircase: one stair lit and climbed for each step completed. */
export function buildStairsScene(T: any) {
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(36, 1, 0.1, 60);
  scene.add(new T.HemisphereLight(0xe9ffe0, 0x063a24, 0.95));
  const key = new T.DirectionalLight(0xffffff, 0.9);
  key.position.set(3, 6, 5);
  scene.add(key);
  const rim = new T.DirectionalLight(0xa3e635, 0.7);
  rim.position.set(-5, 3, -3);
  scene.add(rim);

  const mat = new T.MeshStandardMaterial({ color: 0x2fbf7c, roughness: 0.42, metalness: 0.05 });
  const matJoint = new T.MeshStandardMaterial({ color: 0x0b3d28, roughness: 0.6 });
  const matHat = new T.MeshStandardMaterial({ color: 0xa3e635, roughness: 0.35 });
  const matDark = new T.MeshStandardMaterial({ color: 0x10261c, roughness: 0.5 });

  const m = makeMannequin(T, mat, matJoint);
  const proGear = new T.Group();
  m.body.add(proGear);
  const hat = new T.Mesh(new T.SphereGeometry(0.245, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), matHat);
  hat.position.y = 2.07;
  hat.scale.set(1, 0.95, 1.05);
  proGear.add(hat);
  const brim = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 0.03, 24), matHat);
  brim.position.y = 2.07;
  proGear.add(brim);
  const tb = new T.Mesh(new T.BoxGeometry(0.34, 0.24, 0.16), matDark);
  tb.position.set(0, -0.2, 0);
  m.R.hand.add(tb);
  const phone = new T.Mesh(new T.BoxGeometry(0.2, 0.34, 0.035), matDark);
  phone.position.set(0, -0.1, 0);
  phone.rotation.x = -1.25;
  m.L.hand.add(phone);
  m.root.scale.setScalar(0.82);
  scene.add(m.root);

  const steps: { mesh: any; mat: any; x: number; y: number }[] = [];
  const W = 1.1;
  for (let i = 0; i < 4; i++) {
    const h = 0.55 * (i + 1);
    const sm = new T.MeshStandardMaterial({
      color: 0x0b4a2e,
      roughness: 0.85,
      emissive: 0xa3e635,
      emissiveIntensity: 0,
    });
    const b = new T.Mesh(new T.BoxGeometry(W - 0.06, h, 1.7), sm);
    b.position.set(-1.65 + i * W, h / 2, 0);
    scene.add(b);
    steps.push({ mesh: b, mat: sm, x: -1.65 + i * W, y: h });
  }
  const floor = new T.Mesh(
    new T.CylinderGeometry(3.6, 3.6, 0.08, 48),
    new T.MeshStandardMaterial({ color: 0x094027, roughness: 1 }),
  );
  floor.position.y = -0.04;
  scene.add(floor);

  const flag = new T.Group();
  const pole = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, 1.1, 8), matDark);
  pole.position.y = 0.55;
  flag.add(pole);
  const cloth = new T.Mesh(
    new T.PlaneGeometry(0.55, 0.34),
    new T.MeshStandardMaterial({ color: 0xa3e635, side: T.DoubleSide, roughness: 0.5 }),
  );
  cloth.position.set(0.28, 0.92, 0);
  flag.add(cloth);
  flag.position.set(steps[3].x + 0.3, steps[3].y, -0.5);
  flag.scale.setScalar(0.0001);
  scene.add(flag);

  const badge = makeCheckBadge(T);
  badge.scale.setScalar(0.0001);
  scene.add(badge);
  const shadow = makeShadow(T);
  scene.add(shadow);

  return {
    scene,
    cam,
    m,
    steps,
    flag,
    cloth,
    badge,
    shadow,
    proGear,
    phone,
    pos: { x: steps[0].x, y: steps[0].y },
    hop: null as any,
    cur: 0,
  };
}

export function poseStairsScene(o: any, t: number, dt: number, st: StairsState) {
  const lv = st.level;
  const m = o.m;
  if (lv !== o.cur) {
    o.hop = { t0: t, from: { x: o.pos.x, y: o.pos.y }, to: { x: o.steps[lv].x, y: o.steps[lv].y } };
    o.cur = lv;
  }
  let hopping = false;
  let hp = 0;
  if (o.hop) {
    hp = (t - o.hop.t0) / 0.85;
    if (hp >= 1) {
      o.pos.x = o.hop.to.x;
      o.pos.y = o.hop.to.y;
      o.hop = null;
    } else {
      hopping = true;
      const e = ease2(hp);
      o.pos.x = o.hop.from.x + (o.hop.to.x - o.hop.from.x) * e;
      o.pos.y = o.hop.from.y + (o.hop.to.y - o.hop.from.y) * e + Math.sin(hp * Math.PI) * 0.55;
    }
  }
  const jump = st.done && !hopping ? Math.abs(Math.sin(t * 3.2)) * 0.12 : 0;
  m.root.position.set(o.pos.x, o.pos.y + jump, 0);
  o.shadow.position.set(o.pos.x, o.pos.y + 0.01, 0);
  o.shadow.scale.set(1.1 - jump, 1.1 - jump, 1);
  m.root.rotation.y = 1.0 + Math.sin(t * 0.7) * 0.08;
  o.proGear.visible = st.pro;
  o.phone.visible = !st.pro;
  const br = Math.sin(t * 2) * 0.012;
  m.torso.scale.y = 1 + br;
  m.head.rotation.y = Math.sin(t * 0.9) * 0.15;
  m.head.rotation.x = hopping ? -0.15 : 0;

  const s = hopping ? Math.sin(hp * Math.PI) : 0;
  m.lL.hip.rotation.x = -s * 1.0;
  m.lL.kn.rotation.x = s * 1.2;
  m.lR.hip.rotation.x = s * 0.2;
  m.lR.kn.rotation.x = s * 0.3;
  m.L.sh.rotation.set(0.1 + s * 0.6, 0, 0.1);
  m.L.el.rotation.set(0.1, 0, 0);
  m.R.sh.rotation.set(0.1 - s * 0.5, 0, -0.1);
  m.R.el.rotation.set(0.1, 0, 0);
  if (st.pro && !hopping && !st.done) m.R.sh.rotation.x = 0.1 + Math.sin(t * 2.2) * 0.08;
  if (!st.pro && !hopping && !st.done) {
    m.L.sh.rotation.set(0.9, 0, 0.3);
    m.L.el.rotation.set(0.7 + Math.sin(t * 10) * 0.03, 0, 0);
  }
  if (st.done) {
    m.L.sh.rotation.set(0, 0, 2.7 + Math.sin(t * 8) * 0.15);
    m.R.sh.rotation.set(0, 0, -2.7 - Math.sin(t * 8) * 0.15);
    m.L.el.rotation.set(0, 0, 0.2);
    m.R.el.rotation.set(0, 0, -0.2);
    o.phone.visible = false;
  }
  o.steps.forEach((step: any, i: number) => {
    const want = i <= lv ? 0.38 : 0;
    step.mat.emissiveIntensity += (want - step.mat.emissiveIntensity) * Math.min(1, dt * 6);
  });
  const fl = lv >= 3 || st.done ? 1 : 0;
  let fs = o.flag.scale.x;
  fs += (fl - fs) * Math.min(1, dt * 5);
  o.flag.scale.setScalar(Math.max(0.0001, fs));
  o.cloth.rotation.y = Math.sin(t * 3) * 0.25;
  let bs = o.badge.scale.x;
  bs += ((st.done ? 0.9 : 0) - bs) * Math.min(1, dt * 6);
  o.badge.scale.setScalar(Math.max(0.0001, bs));
  o.badge.position.set(o.pos.x, o.pos.y + 2.9 + Math.sin(t * 3) * 0.05, 0.3);
}
