/* eslint-disable @typescript-eslint/no-explicit-any */
/** A faceless green mannequin built from capsules and spheres (shared by the 3D scenes). */
export interface Mannequin {
  root: any;
  body: any;
  head: any;
  torso: any;
  L: { sh: any; el: any; hand: any };
  R: { sh: any; el: any; hand: any };
  lL: { hip: any; kn: any };
  lR: { hip: any; kn: any };
}

export function makeMannequin(T: any, mat: any, matJoint: any): Mannequin {
  const cap = (r: number, len: number, m: any) =>
    new T.Mesh(new T.CapsuleGeometry(r, Math.max(0.001, len - 2 * r), 6, 14), m);
  const limb = (r: number, len: number, m: any) => {
    const q = cap(r, len, m);
    q.position.y = -len / 2;
    return q;
  };
  const ball = (r: number, m: any) => new T.Mesh(new T.SphereGeometry(r, 16, 12), m);

  const root = new T.Group();
  const body = new T.Group();
  root.add(body);
  const pelvis = ball(0.23, mat);
  pelvis.scale.set(1.15, 0.8, 0.85);
  pelvis.position.y = 1.0;
  body.add(pelvis);
  const torso = cap(0.27, 0.62, mat);
  torso.scale.set(1.12, 1, 0.78);
  torso.position.y = 1.42;
  body.add(torso);
  const neck = new T.Mesh(new T.CylinderGeometry(0.07, 0.08, 0.14, 10), matJoint);
  neck.position.y = 1.82;
  body.add(neck);
  const head = ball(0.22, mat);
  head.scale.set(0.94, 1.2, 1);
  head.position.y = 2.02;
  body.add(head);

  const arm = (side: number) => {
    const sh = new T.Group();
    sh.position.set(side * 0.4, 1.62, 0);
    body.add(sh);
    sh.add(ball(0.1, matJoint));
    sh.add(limb(0.08, 0.42, mat));
    const el = new T.Group();
    el.position.y = -0.42;
    sh.add(el);
    el.add(ball(0.075, matJoint));
    el.add(limb(0.07, 0.4, mat));
    const hand = new T.Group();
    hand.position.y = -0.43;
    el.add(hand);
    hand.add(ball(0.085, mat));
    return { sh, el, hand };
  };
  const leg = (side: number) => {
    const hip = new T.Group();
    hip.position.set(side * 0.14, 0.98, 0);
    body.add(hip);
    hip.add(ball(0.1, matJoint));
    hip.add(limb(0.1, 0.5, mat));
    const kn = new T.Group();
    kn.position.y = -0.5;
    hip.add(kn);
    kn.add(ball(0.08, matJoint));
    kn.add(limb(0.085, 0.5, mat));
    const foot = new T.Mesh(new T.BoxGeometry(0.16, 0.08, 0.3), mat);
    foot.position.set(0, -0.54, 0.06);
    kn.add(foot);
    return { hip, kn };
  };

  return { root, body, head, torso, L: arm(-1), R: arm(1), lL: leg(-1), lR: leg(1) };
}

/** A soft round shadow on the floor. */
export function makeShadow(T: any) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(32, 32, 2, 32, 32, 32);
  gr.addColorStop(0, 'rgba(0,0,0,.45)');
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  const m = new T.Mesh(
    new T.PlaneGeometry(1, 1),
    new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false }),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.01;
  return m;
}

/** A lime round badge with a check mark, drawn once on a canvas. */
export function makeCheckBadge(T: any) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#a3e635';
  g.beginPath();
  g.arc(64, 64, 60, 0, 7);
  g.fill();
  g.strokeStyle = '#12260a';
  g.lineWidth = 14;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(38, 66);
  g.lineTo(57, 85);
  g.lineTo(92, 45);
  g.stroke();
  return new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true }));
}

export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
export const ease = (x: number) => {
  x = clamp(x, 0, 1);
  return x * x * (3 - 2 * x);
};
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1);
