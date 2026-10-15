import React from 'react';
import { CATEGORY_ICONS } from '@el7al/shared';
import {
  Car,
  Construction,
  Droplets,
  Flame,
  Flower2,
  Hammer,
  Key,
  Paintbrush,
  Shield,
  Snowflake,
  Sparkles,
  Tv,
  Wrench,
  Zap,
} from 'lucide-react';

const ICON_COMPONENTS: Record<string, React.FC<{ className?: string }>> = {
  Droplets,
  Zap,
  Car,
  Snowflake,
  Flame,
  Key,
  Paintbrush,
  Sparkles,
  Hammer,
  Flower2,
  Tv,
  Shield,
  Construction,
  Wrench,
};

/** The icons an admin can give to a trade: names and labels come from the shared list, the pictures from lucide. */
export const ICON_GALLERY = CATEGORY_ICONS.map((icon) => ({ ...icon, Icon: ICON_COMPONENTS[icon.name] ?? Wrench }));

export const renderCategoryIcon = (iconName: string, className = 'w-5 h-5') => {
  const Icon = ICON_GALLERY.find((i) => i.name === iconName)?.Icon ?? Wrench;
  return <Icon className={className} />;
};
