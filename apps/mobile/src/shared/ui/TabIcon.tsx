import Svg, { Circle, Path, Rect } from 'react-native-svg';

type TabIconName = 'home' | 'list' | 'chat' | 'user';

interface Props {
  name: TabIconName;
  color: string;
  size?: number;
  strokeWidth?: number;
}

/** The four bottom-bar icons, drawn from the prototype's own paths (24px grid, round caps). */
export function TabIcon({ name, color, size = 22, strokeWidth = 2 }: Props) {
  const common = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'home' && (
        <Path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" strokeLinejoin="round" {...common} />
      )}
      {name === 'list' && (
        <>
          <Rect x={4} y={4} width={16} height={17} rx={3} {...common} />
          <Path d="M8 10h8M8 14h5" {...common} />
        </>
      )}
      {name === 'chat' && <Path d="M4 5h16v11H9l-5 4z" strokeLinejoin="round" {...common} />}
      {name === 'user' && (
        <>
          <Circle cx={12} cy={8} r={4} {...common} />
          <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" {...common} />
        </>
      )}
    </Svg>
  );
}
