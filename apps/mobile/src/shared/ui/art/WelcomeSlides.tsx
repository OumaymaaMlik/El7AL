import { useEffect, useState } from 'react';
import { Easing } from 'react-native';
import { Circle, ClipPath, Defs, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { numeralFont } from '../../theme/typography';
import { keyframes, useLoop } from './useLoop';
import { LIME, INK, GLASS, GREY, W, AnimatedPath, Layer, Canvas } from './slideKit';

export { OrbitSlide } from './OrbitSlide';

/**
 * The welcome illustrations after the orbit: a pipe with dripping water, an ID card with a check that pops,
 * and a map with a route, a bouncing pin and a changing arrival time. Only the slide on screen animates.
 */

/* ---------------------------------------------------------------- 2. pipe */

function Drop({ d, delay, active }: { d: string; delay: number; active: boolean }) {
  const t = useLoop(1800, { delay, easing: Easing.in(Easing.quad), enabled: active });
  const translateY = keyframes(t, [
    [0, -14],
    [1, 46],
  ]);
  // drip: fades in over the first 15 percent, stays, fades out over the last 20 percent.
  const opacity = keyframes(t, [
    [0, 0],
    [0.15, 1],
    [0.8, 1],
    [1, 0],
  ]);
  return (
    <Layer style={{ opacity, transform: [{ translateY }] }}>
      <Path d={d} fill={LIME} stroke={INK} strokeWidth={2} />
    </Layer>
  );
}

export function PipeSlide({ size = W, active = true }: { size?: number; active?: boolean }) {
  return (
    <Canvas size={size}>
      <Layer>
        <Circle cx="130" cy="125" r="112" fill="#fff" fillOpacity={0.05} />
        <Rect x="20" y="57" width="92" height="26" fill={GLASS} stroke={INK} strokeWidth={2.4} />
        <Rect x="104" y="50" width="22" height="40" rx="4" fill={GREY} stroke={INK} strokeWidth={2.4} />
        <Path
          d="M126 57H150a26 26 0 0 1 26 26V120H150V83H126Z"
          fill={GLASS}
          stroke={INK}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
        <Rect x="144" y="118" width="38" height="12" rx="3" fill={GREY} stroke={INK} strokeWidth={2.4} />
        <Path d="M110 72l6-8 4 10 6-6" stroke={INK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Ellipse cx="163" cy="226" rx="38" ry="7" fill={LIME} fillOpacity={0.35} />
      </Layer>
      <Drop d="M163 142c-6 9-9 14-9 19a9 9 0 0 0 18 0c0-5-3-10-9-19z" delay={0} active={active} />
      <Drop d="M163 142c-4 6-6 9-6 12a6 6 0 0 0 12 0c0-3-2-6-6-12z" delay={600} active={active} />
      <Drop d="M118 100c-4 5-6 8-6 11a6 6 0 0 0 12 0c0-3-2-6-6-11z" delay={1200} active={active} />
    </Canvas>
  );
}

/* ---------------------------------------------------------------- 3. ID card */

export function IdCardSlide({ size = W, active = true }: { size?: number; active?: boolean }) {
  const float = useLoop(3600, { easing: Easing.inOut(Easing.quad), enabled: active });
  const pop = useLoop(2400, { enabled: active });
  const translateY = keyframes(float, [
    [0, 0],
    [0.5, -6],
    [1, 0],
  ]);
  const rotate = keyframes(float, [
    [0, '-6deg'],
    [0.5, '-4deg'],
    [1, '-6deg'],
  ]);
  // ckpop: hidden until 15 percent, springs up by 35 percent, then stays until the loop restarts.
  const scale = keyframes(
    pop,
    [
      [0, 0],
      [0.15, 0],
      [0.35, 1],
      [1, 1],
    ],
    Easing.bezier(0.2, 0.9, 0.3, 1.4),
  );
  return (
    <Canvas size={size}>
      <Layer>
        <Circle cx="130" cy="125" r="112" fill="#fff" fillOpacity={0.05} />
      </Layer>
      <Layer style={{ transformOrigin: '133px 118px', transform: [{ translateY }, { rotate }] }}>
        <Rect x="58" y="62" width="150" height="112" rx="14" fill={GLASS} stroke={INK} strokeWidth={2.4} />
        <Path d="M58 76a14 14 0 0 1 14-14h122a14 14 0 0 1 14 14v12H58z" fill="#0D5E3E" />
        <Path d="M58 88H208" stroke={INK} strokeWidth={2.4} />
        <Circle cx="94" cy="124" r="20" fill={GREY} stroke={INK} strokeWidth={2.2} />
        <Circle cx="94" cy="118" r="7" fill={GLASS} stroke={INK} strokeWidth={2} />
        <Path d="M81 138c3-7 8-10 13-10s10 3 13 10" stroke={INK} strokeWidth={2} fill={GLASS} />
        <Rect x="124" y="108" width="62" height="8" rx="4" fill={INK} fillOpacity={0.7} />
        <Rect x="124" y="124" width="46" height="6" rx="3" fill={INK} fillOpacity={0.3} />
        <Rect x="124" y="138" width="54" height="6" rx="3" fill={INK} fillOpacity={0.3} />
        <Circle cx="74" cy="75" r="4" fill={LIME} />
      </Layer>
      <Layer style={{ transformOrigin: '196px 172px', transform: [{ scale }] }}>
        <Circle cx="196" cy="172" r="30" fill={LIME} stroke={INK} strokeWidth={2.4} />
        <Path d="M182 172l10 10 19-20" stroke={INK} strokeWidth={4.4} strokeLinecap="round" strokeLinejoin="round" />
      </Layer>
    </Canvas>
  );
}

/* ---------------------------------------------------------------- 4. map */

export function MapSlide({ size = W, active = true }: { size?: number; active?: boolean }) {
  const dash = useLoop(1200, { js: true, enabled: active });
  const ring = useLoop(2000, { easing: Easing.out(Easing.quad), enabled: active });
  const bounce = useLoop(1600, { easing: Easing.inOut(Easing.quad), enabled: active });
  const offset = dash.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const ringScale = keyframes(ring, [
    [0, 0.6],
    [1, 1.5],
  ]);
  const ringOpacity = keyframes(ring, [
    [0, 0.9],
    [1, 0],
  ]);
  const pinY = keyframes(bounce, [
    [0, 0],
    [0.5, -8],
    [1, 0],
  ]);

  const [minutes, setMinutes] = useState(8);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setMinutes((m) => (m > 2 ? m - 1 : 8)), 1600);
    return () => clearInterval(id);
  }, [active]);

  return (
    <Canvas size={size}>
      <Layer>
        <Defs>
          <ClipPath id="mapClip">
            <Circle cx="130" cy="125" r="112" />
          </ClipPath>
        </Defs>
        <Circle cx="130" cy="125" r="112" fill="#fff" fillOpacity={0.05} />
        <G clipPath="url(#mapClip)">
          <Path
            d="M10 82L250 58M10 172L250 148M90 0L106 250M178 0L164 250"
            stroke="#fff"
            strokeOpacity={0.1}
            strokeWidth={10}
          />
        </G>
        <AnimatedPath
          d="M58 196C88 170 96 150 120 132C140 118 150 110 160 92"
          stroke={LIME}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray="1 9"
          strokeDashoffset={offset as unknown as number}
        />
        <Circle cx="58" cy="196" r="24" fill={LIME} fillOpacity={0.2} />
        <Circle cx="58" cy="196" r="14" fill={LIME} stroke={INK} strokeWidth={2.2} />
        <Circle cx="58" cy="196" r="5" fill="#0D5C3A" />
      </Layer>
      <Layer style={{ opacity: ringOpacity, transformOrigin: '160px 78px', transform: [{ scale: ringScale }] }}>
        <Circle cx="160" cy="78" r="40" fill={LIME} fillOpacity={0.18} />
      </Layer>
      <Layer style={{ transform: [{ translateY: pinY }] }}>
        <Path
          d="M160 34c-19 0-32 14-32 31 0 22 32 51 32 51s32-29 32-51c0-17-13-31-32-31z"
          fill={GLASS}
          stroke={INK}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
        <Circle cx="160" cy="64" r="11" fill="#0D5E3E" stroke={INK} strokeWidth={2.2} />
      </Layer>
      <Layer>
        <Rect x="196" y="164" width="56" height="30" rx="15" fill="#fff" />
        <SvgText x="224" y="184" textAnchor="middle" fontFamily={numeralFont} fontSize="15" fill="#0D5C3A">
          {`${minutes} min`}
        </SvgText>
      </Layer>
    </Canvas>
  );
}
