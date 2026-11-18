import type { LucideIcon } from 'lucide-react-native';
import {
  Wrench,
  Zap,
  Car,
  Fan,
  Key,
  PaintBucket,
  Flame,
  Snowflake,
  Sparkles,
  Hammer,
  Sprout,
  Tv,
  Droplets,
  Paintbrush,
  Flower2,
  Shield,
  Construction,
} from 'lucide-react-native';
import type { Category } from '../../categories';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Wrench,
  // The icon names an admin can pick (packages/shared/src/categoryIcons.ts), so web and mobile draw the same one.
  Droplets,
  Paintbrush,
  Flower2,
  Shield,
  Construction,
  Plomberie: Droplets,
  Zap,
  Électricité: Zap,
  Electricity: Zap,
  Car,
  Mécanique: Car,
  Mechanic: Car,
  Fan,
  Climatisation: Snowflake,
  AC: Snowflake,
  Snowflake,
  Key,
  Serrurerie: Key,
  Locksmith: Key,
  PaintBucket,
  Peinture: PaintBucket,
  Flame,
  Chauffage: Flame,
  Heating: Flame,
  Sparkles,
  Ménage: Sparkles,
  Cleaning: Sparkles,
  Hammer,
  Maçonnerie: Hammer,
  Menuiserie: Hammer,
  Sprout,
  Jardinage: Sprout,
  Gardening: Sprout,
  Tv,
  Électroménager: Tv,
  Appliances: Tv,
};

export function getCategoryIcon(cat: Category) {
  if (cat.icon && CATEGORY_ICONS[cat.icon]) {
    return CATEGORY_ICONS[cat.icon];
  }
  const name = cat.name || '';
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return CATEGORY_ICONS[key];
    }
  }
  return Wrench;
}
