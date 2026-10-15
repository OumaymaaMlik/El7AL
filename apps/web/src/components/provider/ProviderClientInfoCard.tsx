import React from 'react';
import { User, Phone, MapPin, FileText } from 'lucide-react';

interface ProviderClientInfoCardProps {
  clientName: string;
  phoneNumber: string;
  categoryName?: string;
  addressText: string;
  description?: string;
}

export const ProviderClientInfoCard: React.FC<ProviderClientInfoCardProps> = ({
  clientName,
  phoneNumber,
  categoryName = 'Panne batterie',
  addressText,
  description,
}) => {
  const formatShortName = (name?: string) => {
    if (!name || typeof name !== 'string') return 'Client El 7al';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1].charAt(0)}.`;
    }
    return name;
  };

  const displayName = formatShortName(clientName);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-tile border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
      {/* Client Header & Call Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-brand-500 dark:text-brand-accent flex items-center justify-center font-bold text-lg flex-shrink-0">
            <User className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{displayName}</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Client - {categoryName}</p>
          </div>
        </div>

        <a
          href={`tel:${phoneNumber}`}
          className="h-10 px-5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95 flex-shrink-0"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Appeler</span>
        </a>
      </div>

      {/* Address & Remarks Details */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="block text-xs font-semibold text-slate-500">Adresse d'intervention</span>
            <span className="block font-extrabold text-slate-900 dark:text-white mt-0.5">{addressText}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="block text-xs font-semibold text-slate-500">Remarque du client</span>
            <span className="block font-bold text-slate-800 dark:text-slate-200 mt-0.5 italic">
              « {description || '[Remarque du client]'} »
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
