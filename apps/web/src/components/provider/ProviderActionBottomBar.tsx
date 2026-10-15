import React from 'react';
import { ArrowRight, Check, Navigation, MapPin, Play, CheckCircle2 } from 'lucide-react';

export type SubStep =
  'START_TRAJET' | 'EN_ROUTE' | 'NEARBY' | 'ON_SITE' | 'IN_PROGRESS' | 'WAITING_CLIENT' | 'COMPLETED';

interface ProviderActionBottomBarProps {
  missionId: string;
  status: string;
  subStep: SubStep;
  onAdvanceSubStep: () => void;
  isLoading?: boolean;
}

export const ProviderActionBottomBar: React.FC<ProviderActionBottomBarProps> = ({
  status,
  subStep,
  onAdvanceSubStep,
  isLoading = false,
}) => {
  if (status === 'COMPLETED' || subStep === 'COMPLETED') {
    return (
      <div className="w-full bg-brand-500 text-white rounded-tile p-5 sm:p-6 flex items-center justify-between gap-4 border border-brand-500">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-brand-accent" />
          <div>
            <h4 className="text-sm font-extrabold text-white">Demande clôturée</h4>
            <p className="text-xs text-slate-300">Intervention terminée avec succès. Commission de 30 TND prélevée.</p>
          </div>
        </div>
      </div>
    );
  }

  if (subStep === 'WAITING_CLIENT') {
    return (
      <div className="w-full bg-brand-500 text-white rounded-tile p-5 sm:p-6 flex items-center gap-3 border border-brand-500">
        <CheckCircle2 className="w-6 h-6 text-brand-accent" />
        <div>
          <h4 className="text-sm font-extrabold text-white">En attente de la validation du client</h4>
          <p className="text-xs text-slate-300">
            Vous avez signalé la fin des travaux. L'intervention sera clôturée dès que le client confirmera.
          </p>
        </div>
      </div>
    );
  }

  const getButtonConfig = () => {
    switch (subStep) {
      case 'START_TRAJET':
        return {
          label: 'Démarrer le trajet',
          subtext: 'Cliquez pour lancer la navigation GPS et informer le client que vous êtes en route.',
          icon: <Navigation className="w-4 h-4 fill-brand-deep text-brand-deep" />,
          disabled: false,
        };
      case 'EN_ROUTE':
      case 'NEARBY':
        return {
          label: 'Je suis sur place',
          subtext: "Indiquez au client que vous êtes arrivé sur le lieu d'intervention.",
          icon: <MapPin className="w-4 h-4 fill-brand-deep text-brand-deep" />,
          disabled: false,
        };
      case 'ON_SITE':
        return {
          label: "Commencer l'intervention",
          subtext: 'Démarrez les travaux de dépannage sur place.',
          icon: <Play className="w-4 h-4 fill-brand-deep text-brand-deep" />,
          disabled: false,
        };
      case 'IN_PROGRESS':
        return {
          label: "Terminer l'intervention",
          subtext: "Clôturez l'intervention une fois le dépannage achevé.",
          icon: <Check className="w-4 h-4 stroke-[3]" />,
          disabled: false,
        };
      default:
        return {
          label: "Commencer l'intervention",
          subtext: 'Démarrez les travaux de dépannage sur place.',
          icon: <Play className="w-4 h-4 fill-brand-deep text-brand-deep" />,
          disabled: false,
        };
    }
  };

  const config = getButtonConfig();

  return (
    <div className="w-full bg-brand-500 text-white rounded-tile p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-brand-500">
      {/* Left Description Text */}
      <div className="space-y-1">
        <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
          <span>Action requise : {config.label}</span>
        </h4>
        <p className="text-xs text-slate-300">{config.subtext}</p>
      </div>

      {/* Right SINGLE DYNAMIC ACTION BUTTON */}
      <button
        type="button"
        onClick={onAdvanceSubStep}
        disabled={isLoading}
        className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-accent hover:bg-brand-accent-hover text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all active:scale-95 whitespace-nowrap cursor-pointer disabled:opacity-75"
      >
        {config.icon}
        <span>{isLoading ? 'Mise à jour...' : config.label}</span>
        <ArrowRight className="rtl:-scale-x-100 w-4 h-4 stroke-[3]" />
      </button>
    </div>
  );
};
