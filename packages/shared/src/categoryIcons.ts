/**
 * The icons an admin can give to a trade. The name is what is stored with the category; each app draws it with
 * its own icon set (web and mobile map these names to the same pictures). The label is for the picker.
 */
export const CATEGORY_ICONS: ReadonlyArray<{ name: string; label: string }> = [
  { name: 'Droplets', label: 'Plomberie' },
  { name: 'Zap', label: 'Électricité' },
  { name: 'Car', label: 'Remorquage' },
  { name: 'Snowflake', label: 'Climatisation' },
  { name: 'Flame', label: 'Chauffage' },
  { name: 'Key', label: 'Serrurerie' },
  { name: 'Paintbrush', label: 'Peinture' },
  { name: 'Sparkles', label: 'Nettoyage' },
  { name: 'Hammer', label: 'Menuiserie' },
  { name: 'Flower2', label: 'Jardinage' },
  { name: 'Tv', label: 'Électroménager' },
  { name: 'Shield', label: 'Sécurité' },
  { name: 'Construction', label: 'Maçonnerie' },
  { name: 'Wrench', label: 'Services / Autre' },
];
