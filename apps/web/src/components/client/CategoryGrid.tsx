import React from 'react';
import {
  Wrench,
  Zap,
  Snowflake,
  Flame,
  Car,
  Key,
  Shield,
  Paintbrush,
  Tv,
  Sparkles,
  Droplets,
  Hammer,
  Flower2,
  Construction,
} from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  /** Artisans currently online for this category, when the server reports it. */
  activeProvidersCount?: number;
}

export const getCategoryIcon = (name: string, iconName?: string) => {
  const lowerName = (name + ' ' + (iconName || '')).toLowerCase();

  if (
    lowerName.includes('plomb') ||
    lowerName.includes('eau') ||
    lowerName.includes('fuite') ||
    lowerName.includes('sanitaire')
  ) {
    return <Droplets className="w-[18px] h-[18px]" />;
  }
  if (
    lowerName.includes('électr') ||
    lowerName.includes('elec') ||
    lowerName.includes('courant') ||
    lowerName.includes('prise')
  ) {
    return <Zap className="w-[18px] h-[18px]" />;
  }
  if (lowerName.includes('clim') || lowerName.includes('froid') || lowerName.includes('frigo')) {
    return <Snowflake className="w-[18px] h-[18px]" />;
  }
  if (lowerName.includes('chauff') || lowerName.includes('gaz') || lowerName.includes('chaudière')) {
    return <Flame className="w-[18px] h-[18px]" />;
  }
  if (
    lowerName.includes('mécan') ||
    lowerName.includes('auto') ||
    lowerName.includes('remorq') ||
    lowerName.includes('véhic') ||
    lowerName.includes('voiture') ||
    lowerName.includes('vidange')
  ) {
    return <Car className="w-[18px] h-[18px]" />;
  }
  if (
    lowerName.includes('serrur') ||
    lowerName.includes('clé') ||
    lowerName.includes('porte') ||
    lowerName.includes('verrou')
  ) {
    return <Key className="w-[18px] h-[18px]" />;
  }
  if (
    lowerName.includes('menuis') ||
    lowerName.includes('ébénist') ||
    lowerName.includes('bois') ||
    lowerName.includes('meuble')
  ) {
    return <Hammer className="w-[18px] h-[18px]" />;
  }
  if (
    lowerName.includes('ménag') ||
    lowerName.includes('nettoy') ||
    lowerName.includes('entretien') ||
    lowerName.includes('propreté')
  ) {
    return <Sparkles className="w-[18px] h-[18px]" />;
  }
  if (
    lowerName.includes('jardin') ||
    lowerName.includes('fleur') ||
    lowerName.includes('vert') ||
    lowerName.includes('haie')
  ) {
    return <Flower2 className="w-[18px] h-[18px]" />;
  }
  if (lowerName.includes('peint') || lowerName.includes('déco') || lowerName.includes('rénov')) {
    return <Paintbrush className="w-[18px] h-[18px]" />;
  }
  if (
    lowerName.includes('électromén') ||
    lowerName.includes('tv') ||
    lowerName.includes('lave') ||
    lowerName.includes('four')
  ) {
    return <Tv className="w-[18px] h-[18px]" />;
  }
  if (lowerName.includes('sécurit') || lowerName.includes('alarme') || lowerName.includes('caméra')) {
    return <Shield className="w-[18px] h-[18px]" />;
  }
  if (
    lowerName.includes('maçon') ||
    lowerName.includes('brique') ||
    lowerName.includes('carrelage') ||
    lowerName.includes('béton')
  ) {
    return <Construction className="w-[18px] h-[18px]" />;
  }

  return <Wrench className="w-[18px] h-[18px]" />;
};
