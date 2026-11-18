import { useMemo } from 'react';
import { SvgXml } from 'react-native-svg';
import { toolXml, type ToolKey, type ToolPalette } from './toolArt';

interface ToolIconProps {
  tool: ToolKey;
  palette?: ToolPalette;
  width: number;
  height: number;
}

/** One of the six trade tools, drawn as in the prototype. */
export function ToolIcon({ tool, palette = 'light', width, height }: ToolIconProps) {
  const xml = useMemo(() => toolXml(tool, palette), [tool, palette]);
  return <SvgXml xml={xml} width={width} height={height} />;
}
