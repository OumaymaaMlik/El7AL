import React from 'react';
import { User, Phone, MessageSquare, Star, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProviderCardProps {
  provider: {
    user: {
      fullName: string;
      phoneNumber: string;
      avatarUrl?: string;
    };
    bio?: string;
    categories?: Array<{ category: { name: string } }>;
  };
  categoryName?: string;
  onOpenChat: () => void;
  unreadCount?: number;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  categoryName = 'Dépannage',
  onOpenChat,
  unreadCount = 0,
}) => {
  const { fullName, phoneNumber, avatarUrl } = provider.user;

  // Format name like mockup: "Ahmed N."
  const formatShortName = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1].charAt(0)}.`;
    }
    return name;
  };

  const displayName = formatShortName(fullName);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-tile border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border-2 border-brand-500 text-brand-500 dark:text-brand-accent flex items-center justify-center font-black text-xl overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-7 h-7 stroke-[2.5]" />
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{displayName}</span>
          </h3>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
            <span>{categoryName}</span>
            <span>•</span>
            <span className="flex items-center gap-0.5 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              4.9
            </span>
            <span>•</span>
            <span className="text-brand-500 dark:text-brand-accent font-bold flex items-center gap-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Vérifié
            </span>
          </p>
        </div>
      </div>

      {/* Action Buttons: Appeler & Message */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <a
          href={`tel:${phoneNumber}`}
          className="h-11 px-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Phone className="w-4 h-4" />
          <span>Appeler</span>
        </a>

        <Button
          type="button"
          variant="outline"
          onClick={onOpenChat}
          leftIcon={<MessageSquare className="w-4 h-4 text-brand-500 dark:text-brand-accent" />}
          className="h-11 rounded-2xl text-xs font-bold relative border-slate-200 dark:border-slate-700"
        >
          <span>Message</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-brand-accent text-slate-950 font-black text-xs flex items-center justify-center ">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
