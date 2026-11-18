/**
 * The six trade tools, drawn exactly as in the El 7al prototype (a pipe wrench, a screwdriver, a spanner,
 * a gauge, a key and a paint roller). Each is an SVG fragment on a 100 x 160 canvas; the colours are
 * placeholders replaced per palette by `toolXml`.
 */
export type ToolKey = 'plomb' | 'elec' | 'meca' | 'clim' | 'serr' | 'peint';
export type ToolPalette = 'light' | 'dark' | 'grey';

const TOOLS: Record<ToolKey, string> = {
  plomb: `<rect x="43" y="4" width="14" height="106" rx="7" fill="var(--color-forest)" stroke="var(--color-ink)" stroke-width="1.6" stroke-linejoin="round"/><circle cx="50" cy="14" r="5" fill="var(--color-tile)"/><path d="M34 104h32v16h-7v10h9v18H34z" fill="var(--color-steel)" stroke="var(--color-ink)" stroke-width="1.6" stroke-linejoin="round"/><rect x="38" y="120" width="21" height="8" rx="2" fill="var(--color-steel-dark)" stroke="var(--color-ink)" stroke-width="1.6" stroke-linejoin="round"/><path d="M40 140h4M47 140h4M54 140h4" stroke="var(--color-ink)" stroke-width="1.4"/><circle cx="50" cy="14" r="3.6" fill="var(--color-ink)"/>`,
  elec: `<rect x="39" y="4" width="22" height="66" rx="10" fill="var(--color-forest)" stroke="var(--color-ink)" stroke-width="1.6" stroke-linejoin="round"/><circle cx="50" cy="14" r="5" fill="var(--color-tile)"/><path d="M43 30v30M50 30v30M57 30v30" stroke="var(--color-ink)" stroke-width="1.2" opacity=".45"/><rect x="46.5" y="70" width="7" height="72" fill="var(--color-steel)" stroke="var(--color-ink)" stroke-width="1.6" stroke-linejoin="round"/><path d="M46.5 142h7l-1.5 12h-4z" fill="var(--color-steel-dark)" stroke="var(--color-ink)" stroke-width="1.6" stroke-linejoin="round"/><circle cx="50" cy="14" r="3.6" fill="var(--color-ink)"/>`,
  meca: `<path d="M50 4a16 16 0 0 1 7 30.4V118a17 17 0 1 1-14 0V34.4A16 16 0 0 1 50 4z" fill="var(--color-steel)" stroke="var(--color-ink)" stroke-width="1.6" stroke-linejoin="round"/><circle cx="50" cy="20" r="7.5" fill="var(--color-tile)" stroke="var(--color-ink)" stroke-width="1.6" stroke-linejoin="round"/><path d="M43 124h14v34H43z" fill="var(--color-tile)"/><path d="M43 124h14" stroke="var(--color-ink)" stroke-width="1.6"/><rect x="45" y="48" width="10" height="56" rx="3" fill="var(--color-steel-dark)" opacity=".5"/><circle cx="50" cy="14" r="3.6" fill="var(--color-ink)"/>`,
  clim: `<circle cx="50" cy="14" r="8" fill="none" stroke="var(--color-steel-dark)" stroke-width="4"/><rect x="45" y="20" width="10" height="20" fill="var(--color-steel)" stroke="var(--color-ink)" stroke-width="1.6" stroke-linejoin="round"/><circle cx="50" cy="72" r="32" fill="var(--color-surface)" stroke="var(--color-forest)" stroke-width="7"/><circle cx="50" cy="72" r="32" fill="none" stroke="var(--color-ink)" stroke-width="1.6" stroke-linejoin="round"/><path d="M30 84a22 22 0 0 1 40 0" fill="none" stroke="var(--color-steel-dark)" stroke-width="2" stroke-dasharray="2 4"/><path d="M50 76 66 60" stroke="var(--color-ink)" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="76" r="4" fill="var(--color-ink)"/><path d="M50 104c0 26-30 18-26 44" fill="none" stroke="var(--color-forest)" stroke-width="7" stroke-linecap="round"/>`,
  serr: `<circle cx="50" cy="26" r="20" fill="var(--color-forest)" stroke="var(--color-ink)" stroke-width="1.6" stroke-linejoin="round"/><circle cx="50" cy="20" r="6" fill="var(--color-tile)" stroke="var(--color-ink)" stroke-width="1.6" stroke-linejoin="round"/><rect x="45" y="44" width="10" height="104" rx="2" fill="var(--color-steel)" stroke="var(--color-ink)" stroke-width="1.6" stroke-linejoin="round"/><path d="M55 118h14v8h-14M55 132h10v8h-10" fill="var(--color-steel-dark)" stroke="var(--color-ink)" stroke-width="1.6" stroke-linejoin="round"/><circle cx="50" cy="14" r="3.6" fill="var(--color-ink)"/>`,
  peint: `<rect x="43" y="4" width="14" height="52" rx="7" fill="var(--color-forest)" stroke="var(--color-ink)" stroke-width="1.6" stroke-linejoin="round"/><circle cx="50" cy="14" r="5" fill="var(--color-tile)"/><path d="M50 56v18h26v18H50v8" fill="none" stroke="var(--color-steel-dark)" stroke-width="4" stroke-linejoin="round"/><rect x="18" y="100" width="64" height="42" rx="10" fill="var(--color-steel)" stroke="var(--color-ink)" stroke-width="1.6" stroke-linejoin="round"/><path d="M26 110v22M36 110v22M46 110v22M56 110v22M66 110v22M74 110v22" stroke="var(--color-ink)" stroke-width="1" opacity=".25"/><circle cx="50" cy="14" r="3.6" fill="var(--color-ink)"/>`,
};

const PALETTES: Record<ToolPalette, Record<string, string>> = {
  light: {
    'var(--color-forest)': '#0D5C3A',
    'var(--color-steel)': '#B9C2BC',
    'var(--color-steel-dark)': '#8E9A93',
    'var(--color-ink)': '#0B1F16',
    'var(--color-tile)': '#EFEADC',
    'var(--color-surface)': '#FFFFFF',
  },
  dark: {
    'var(--color-forest)': '#A3E635',
    'var(--color-steel)': '#DDE5DF',
    'var(--color-steel-dark)': '#A9B8AF',
    'var(--color-ink)': '#06140D',
    'var(--color-tile)': '#0D5C3A',
    'var(--color-surface)': '#FFFFFF',
  },
  grey: {
    'var(--color-forest)': '#D3DAD5',
    'var(--color-steel)': '#E4E9E5',
    'var(--color-steel-dark)': '#C9D1CB',
    'var(--color-ink)': '#9AA59F',
    'var(--color-tile)': '#FFFFFF',
    'var(--color-surface)': '#FFFFFF',
  },
};

const TOOL_WORDS: [ToolKey, string[]][] = [
  ['plomb', ['plomb', 'plumb', 'droplet', 'سباك']],
  ['elec', ['élec', 'elec', 'zap', 'كهرب']],
  ['meca', ['méca', 'meca', 'car', 'ميكان']],
  ['clim', ['clim', 'air', 'snow', 'fan', 'تكييف']],
  ['serr', ['serr', 'lock', 'key', 'قفل']],
  ['peint', ['peint', 'paint', 'دهان']],
];

/** The prototype tool that stands for a category (by its name or icon), or null when none of the six fits. */
export function toolForCategory(name?: string | null, icon?: string | null): ToolKey | null {
  const hay = `${name ?? ''} ${icon ?? ''}`.toLowerCase();
  for (const [key, words] of TOOL_WORDS) if (words.some((w) => hay.includes(w))) return key;
  return null;
}

/** A tool as a standalone SVG document string, in the chosen palette. */
export function toolXml(key: ToolKey, palette: ToolPalette = 'light'): string {
  let body = TOOLS[key];
  for (const [token, value] of Object.entries(PALETTES[palette])) body = body.split(token).join(value);
  // Strokes are drawn thicker on dark and grey palettes, and a little thicker than the source on light.
  body = body.replace(/stroke-width="1.6"/g, palette === 'light' ? 'stroke-width="2.4"' : 'stroke-width="2.6"');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 160" fill="none">${body}</svg>`;
}
