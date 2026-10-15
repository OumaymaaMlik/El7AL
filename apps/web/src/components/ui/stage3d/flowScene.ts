/* eslint-disable @typescript-eslint/no-explicit-any */
import { ease, makeCheckBadge, makeMannequin, makeShadow, seg } from './mannequin';

/** Length of the loop in seconds. */
export const FLOW_SECONDS = 14;

/** Which of the four captions is active at time `t`. */
export const flowStep = (t: number) => (t < 3.5 ? 0 : t < 7 ? 1 : t < 10.5 ? 2 : 3);

/**
 * The request told as a scene (a car breakdown and a mechanic): the client describes the problem on the phone, an artisan appears,
 * walks to the broken-down car, opens the hood and repairs it, and the client cheers when the job is done.
 */
export function buildFlowScene(T: any) {
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(36, 1, 0.1, 50);
  cam.position.set(0, 1.6, 7.4);
  scene.add(new T.HemisphereLight(0xe9ffe0, 0x063a24, 0.95));
  const key = new T.DirectionalLight(0xffffff, 0.9);
  key.position.set(2.5, 5, 4);
  scene.add(key);
  const rim = new T.DirectionalLight(0xa3e635, 0.65);
  rim.position.set(-4, 2.5, -3);
  scene.add(rim);

  const matClient = new T.MeshStandardMaterial({ color: 0x20b070, roughness: 0.42, metalness: 0.05 });
  const matPro = new T.MeshStandardMaterial({ color: 0x39c47f, roughness: 0.42, metalness: 0.05 });
  const matJoint = new T.MeshStandardMaterial({ color: 0x0b3d28, roughness: 0.6 });
  const matHat = new T.MeshStandardMaterial({ color: 0xa3e635, roughness: 0.35 });
  const matDark = new T.MeshStandardMaterial({ color: 0x10261c, roughness: 0.5 });

  const ground = new T.Mesh(
    new T.CylinderGeometry(3.0, 3.0, 0.08, 48),
    new T.MeshStandardMaterial({ color: 0x0a4a2f, roughness: 1 }),
  );
  ground.position.y = -0.04;
  scene.add(ground);
  // A broken-down car (side view, front toward +x) with a hood that opens, smoke and hazard lights.
  const matCar = new T.MeshStandardMaterial({ color: 0xe6eee2, roughness: 0.35, metalness: 0.25 });
  const matGlass = new T.MeshStandardMaterial({ color: 0x10261c, roughness: 0.2, metalness: 0.4 });
  const matTyre = new T.MeshStandardMaterial({ color: 0x0a1410, roughness: 0.9 });
  const matLamp = new T.MeshStandardMaterial({
    color: 0x3a3a22,
    emissive: 0xfff2a8,
    emissiveIntensity: 0,
    roughness: 0.3,
  });
  const matHazard = new T.MeshStandardMaterial({
    color: 0x553300,
    emissive: 0xffa500,
    emissiveIntensity: 0,
    roughness: 0.4,
  });
  const car = new T.Group();
  car.position.set(-0.45, 0, -1.9);
  scene.add(car);
  const body = new T.Mesh(new T.BoxGeometry(2.6, 0.5, 1.2), matCar);
  body.position.y = 0.55;
  car.add(body);
  const cabin = new T.Mesh(new T.BoxGeometry(1.15, 0.42, 1.04), matCar);
  cabin.position.set(-0.4, 1.0, 0);
  car.add(cabin);
  const glass = new T.Mesh(new T.BoxGeometry(1.0, 0.28, 1.08), matGlass);
  glass.position.set(-0.4, 1.02, 0);
  car.add(glass);
  [
    [0.8, 0.62],
    [0.8, -0.62],
    [-0.8, 0.62],
    [-0.8, -0.62],
  ].forEach(([x, z]) => {
    const wheel = new T.Mesh(new T.CylinderGeometry(0.28, 0.28, 0.2, 24), matTyre);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.28, z);
    car.add(wheel);
  });
  // Hood hinged at its rear edge: rotating around z lifts the front.
  const hood = new T.Group();
  hood.position.set(0.1, 0.81, 0);
  const hoodPanel = new T.Mesh(new T.BoxGeometry(0.9, 0.07, 1.1), matCar);
  hoodPanel.position.x = 0.45;
  hood.add(hoodPanel);
  car.add(hood);
  const lamps: any[] = [];
  [0.38, -0.38].forEach((z) => {
    const lamp = new T.Mesh(new T.SphereGeometry(0.1, 12, 8), matLamp);
    lamp.position.set(1.3, 0.62, z);
    car.add(lamp);
    lamps.push(lamp);
  });
  const hazards: any[] = [];
  [
    [1.3, 0.55],
    [-1.3, 0.55],
  ].forEach(([x, y]) => {
    [0.5, -0.5].forEach((z) => {
      const h = new T.Mesh(new T.SphereGeometry(0.07, 10, 8), matHazard);
      h.position.set(x, y, z);
      car.add(h);
      hazards.push(h);
    });
  });
  const smoke: any[] = [];
  for (let i = 0; i < 5; i++) {
    const puff = new T.Mesh(
      new T.SphereGeometry(0.16, 12, 10),
      new T.MeshBasicMaterial({ color: 0xdfe8dc, transparent: true, opacity: 0, depthWrite: false }),
    );
    puff.position.set(0.55, 0.9, 0);
    car.add(puff);
    smoke.push(puff);
  }

  const client = makeMannequin(T, matClient, matJoint);
  const swap = client.L;
  client.L = client.R;
  client.R = swap;
  client.root.position.set(-1.05, 0, 0.2);
  client.root.rotation.y = 0.85;
  scene.add(client.root);
  const cs = makeShadow(T);
  cs.scale.set(1.2, 1.2, 1);
  cs.position.set(-1.05, 0.01, 0.2);
  scene.add(cs);
  const pro = makeMannequin(T, matPro, matJoint);
  scene.add(pro.root);
  const ps = makeShadow(T);
  ps.scale.set(1.2, 1.2, 1);
  scene.add(ps);

  const phone = new T.Mesh(new T.BoxGeometry(0.2, 0.34, 0.035), matDark);
  phone.position.set(0, -0.1, 0);
  phone.rotation.x = -1.25;
  client.R.hand.add(phone);
  const screen = new T.Mesh(
    new T.PlaneGeometry(0.16, 0.29),
    new T.MeshBasicMaterial({ color: 0xa3e635, side: T.DoubleSide }),
  );
  screen.position.set(0, 0, 0.017);
  phone.add(screen);

  const hat = new T.Mesh(new T.SphereGeometry(0.245, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), matHat);
  hat.position.y = 2.07;
  hat.scale.set(1, 0.95, 1.05);
  pro.body.add(hat);
  const brim = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 0.03, 24), matHat);
  brim.position.y = 2.07;
  pro.body.add(brim);
  const tb = new T.Mesh(new T.BoxGeometry(0.34, 0.24, 0.16), matDark);
  tb.position.set(0, -0.2, 0);
  pro.R.hand.add(tb);
  const tbBand = new T.Mesh(new T.BoxGeometry(0.36, 0.05, 0.17), matHat);
  tbBand.position.set(0, -0.14, 0);
  pro.R.hand.add(tbBand);

  const rings: any[] = [];
  for (let i = 0; i < 3; i++) {
    const rg = new T.Mesh(
      new T.RingGeometry(0.9, 1, 48),
      new T.MeshBasicMaterial({
        color: 0xa3e635,
        transparent: true,
        opacity: 0,
        side: T.DoubleSide,
        depthWrite: false,
      }),
    );
    rg.rotation.x = -Math.PI / 2;
    rg.position.set(-1.05, 0.03, 0.2);
    scene.add(rg);
    rings.push(rg);
  }

  const pin = new T.Group();
  const pinHead = new T.Mesh(
    new T.SphereGeometry(0.17, 16, 12),
    new T.MeshStandardMaterial({ color: 0xa3e635, emissive: 0x5a8a10, roughness: 0.3 }),
  );
  pin.add(pinHead);
  const pinTip = new T.Mesh(new T.ConeGeometry(0.12, 0.3, 16), pinHead.material);
  pinTip.rotation.x = Math.PI;
  pinTip.position.y = -0.2;
  pin.add(pinTip);
  const pinDot = new T.Mesh(new T.SphereGeometry(0.06, 12, 8), matDark);
  pinDot.position.z = 0.12;
  pinHead.add(pinDot);
  pin.position.set(-1.05, 3.1, 0.2);
  pin.scale.setScalar(0);
  scene.add(pin);

  const badge = makeCheckBadge(T);
  badge.position.set(-0.4, 2.95, 0.4);
  badge.scale.setScalar(0);
  scene.add(badge);

  return { scene, cam, client, pro, cs, ps, rings, pin, badge, car, hood, hazards, lamps, smoke, phone };
}

export function poseFlowScene(o: any, t: number) {
  const c = o.client;
  const p = o.pro;
  const breathe = Math.sin(t * 2) * 0.012;

  c.torso.scale.y = 1 + breathe;
  c.head.rotation.y = Math.sin(t * 0.9) * 0.12;
  const lift = ease(seg(t, 0, 0.7)) * (1 - ease(seg(t, 10.3, 11)));
  const tap = t < 3.5 ? Math.sin(t * 11) * 0.05 : 0;
  c.R.sh.rotation.set(0.15 + lift * 0.75, 0, -(0.05 - 0.3 * lift));
  c.R.el.rotation.set(0.1 + lift * 0.6 + tap, 0, 0);
  const cheer = ease(seg(t, 10.5, 11.1)) * (1 - ease(seg(t, 13.4, 14)));
  o.phone.visible = cheer < 0.2;
  c.R.sh.rotation.z -= cheer * 1.9;
  c.R.sh.rotation.x -= cheer * 0.2;
  c.R.el.rotation.x -= cheer * 0.9;
  c.L.sh.rotation.set(0.05, 0, 0.1);
  c.L.el.rotation.set(0.05, 0, 0);
  const wave = ease(seg(t, 8.6, 9.2)) * (1 - ease(seg(t, 10.4, 11)));
  c.L.sh.rotation.z = 0.1 + wave * 2.5;
  c.L.el.rotation.z = Math.sin(t * 9) * 0.35 * wave;
  c.root.rotation.y = 0.85 + ease(seg(t, 8, 9.5)) * 0.15;
  c.body.position.y = breathe * 0.5;

  const walkP = seg(t, 3.5, 9);
  const e = ease(walkP);
  // The mechanic walks in from the right and stops at the nose of the car, in front of the hood.
  const x = 2.9 + (1.75 - 2.9) * e;
  const z = 0.35 + (-1.9 - 0.35) * e;
  const appear = ease(seg(t, 3.4, 4.2)) * (1 - ease(seg(t, 13.4, 14)));
  const scale = Math.max(0.001, appear);
  p.root.position.set(x, 0, z);
  p.root.scale.setScalar(scale);
  o.ps.position.set(x, 0.01, z);
  o.ps.scale.set(1.2 * scale, 1.2 * scale, 1);
  const walking = walkP > 0 && walkP < 1;
  const ph = t * 7.2;
  const sw = walking ? 1 : 0;
  p.lL.hip.rotation.x = Math.sin(ph) * 0.55 * sw;
  p.lR.hip.rotation.x = -Math.sin(ph) * 0.55 * sw;
  p.lL.kn.rotation.x = Math.max(0, -Math.sin(ph)) * 0.8 * sw;
  p.lR.kn.rotation.x = Math.max(0, Math.sin(ph)) * 0.8 * sw;
  p.body.position.y = walking ? Math.abs(Math.cos(ph)) * 0.05 : 0;
  p.L.sh.rotation.set(-Math.sin(ph) * 0.5 * sw, 0, -0.08);
  p.L.el.rotation.x = 0.15 + Math.max(0, Math.sin(ph)) * 0.3 * sw;
  p.R.sh.rotation.set(Math.sin(ph) * 0.25 * sw, 0, 0.08);
  p.R.el.rotation.x = 0.1;
  // He keeps facing left: toward the nose of the car where the hood opens.
  p.root.rotation.y = -Math.PI / 2;
  // Working on the engine: both arms reach forward and tinker.
  const work = ease(seg(t, 9.8, 10.4)) * (1 - ease(seg(t, 12.6, 13.2)));
  if (work > 0) {
    const tinker = Math.sin(t * 9) * 0.18 * work;
    p.L.sh.rotation.set(-1.15 * work + tinker, 0, -0.1);
    p.R.sh.rotation.set(-1.25 * work - tinker, 0, 0.1);
    p.L.el.rotation.x = 0.5 * work;
    p.R.el.rotation.x = 0.5 * work;
    p.body.rotation.x = 0.18 * work;
  } else {
    p.body.rotation.x = 0;
  }

  // The hood lifts when the mechanic arrives and closes when the car is fixed.
  o.hood.rotation.z = 1.05 * ease(seg(t, 9.0, 9.9)) * (1 - ease(seg(t, 12.4, 13.0)));
  // Hazard lights blink while the car is broken down; headlights come on once it is fixed.
  const broken = t < 11.2;
  const blink = Math.sin(t * 9) > 0 ? 1 : 0.1;
  o.hazards.forEach((h: any) => (h.material.emissiveIntensity = broken ? blink * 1.4 : 0));
  const fixed = ease(seg(t, 11.2, 11.8));
  o.lamps.forEach((l: any) => (l.material.emissiveIntensity = fixed * 1.6));
  // Smoke curls up from the hood until the repair is done.
  o.smoke.forEach((puff: any, i: number) => {
    const k = (t * 0.5 + i / o.smoke.length) % 1;
    const on = t < 11.0 ? 1 : 1 - ease(seg(t, 11.0, 11.8));
    puff.position.set(0.55 + Math.sin(k * 6 + i) * 0.08, 0.9 + k * 1.2, Math.cos(k * 5 + i) * 0.1);
    puff.scale.setScalar(0.6 + k * 1.4);
    puff.material.opacity = (1 - k) * 0.5 * on;
  });

  o.rings.forEach((r: any, i: number) => {
    const k = (t * 0.9 + i / 3) % 1;
    const on = t > 0.3 && t < 3.6 ? 1 : 0;
    r.scale.setScalar(0.4 + k * 2.2);
    r.material.opacity = on * (1 - k) * 0.7;
  });
  const pinS = ease(seg(t, 3.2, 3.8)) * (1 - ease(seg(t, 10.2, 10.8)));
  o.pin.scale.setScalar(Math.max(0.0001, pinS));
  o.pin.position.y = 3.0 + Math.sin(t * 3) * 0.07;
  o.pin.rotation.y = t * 1.2;
  const bS = ease(seg(t, 11.1, 11.6)) * (1 - ease(seg(t, 13.4, 14)));
  o.badge.scale.setScalar(Math.max(0.0001, bS * 0.75));
  o.badge.position.y = 2.95 + Math.sin(t * 3) * 0.04;
}
