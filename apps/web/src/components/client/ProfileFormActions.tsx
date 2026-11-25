import React from 'react';
import { Save, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  saving: boolean;
  onLogout: () => void;
}

/** The two buttons under the profile form: stacked on a phone (save first), side by side from the small breakpoint. */
export const ProfileFormActions: React.FC<Props> = ({ saving, onLogout }) => (
  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
    <Button
      type="button"
      variant="outline"
      className="w-full sm:w-auto"
      onClick={onLogout}
      leftIcon={<LogOut className="w-4 h-4" />}
    >
      Déconnexion
    </Button>
    <Button
      type="submit"
      variant="primary"
      className="w-full sm:w-auto"
      isLoading={saving}
      leftIcon={<Save className="w-4 h-4" />}
    >
      Enregistrer les modifications
    </Button>
  </div>
);
