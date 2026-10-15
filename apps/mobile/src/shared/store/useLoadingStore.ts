import { create } from 'zustand';

const PRESET_SUBTITLES: Record<string, string> = {
  'Connexion en cours': 'Préparation de votre espace',
  'Déconnexion en cours': 'À bientôt sur El 7al',
  Chargement: 'Un instant, s’il vous plaît',
  'Inscription en cours': 'Création de votre compte',
  'Mise à jour du profil': 'Enregistrement de vos modifications',
  "Recherche d'un artisan": 'Localisation des artisans à proximité',
  'Réinitialisation en cours': 'Vérification de votre compte',
};

interface LoadingState {
  isVisible: boolean;
  message: string;
  sub: string;
  showLoading: (message?: string, sub?: string) => void;
  hideLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isVisible: false,
  message: 'Chargement',
  sub: 'Un instant, s’il vous plaît',

  showLoading: (message = 'Chargement', sub) => {
    const subtitle = sub || PRESET_SUBTITLES[message] || 'Un instant, s’il vous plaît';
    set({
      isVisible: true,
      message,
      sub: subtitle,
    });
  },

  hideLoading: () => {
    set({ isVisible: false });
  },
}));
