import React from 'react';

interface Suggestion {
  /** Words that identify the trade in its name. */
  match: string[];
  placeholder: string;
  chips: string[];
}

const SUGGESTIONS: Suggestion[] = [
  {
    match: ['chauff', 'gaz'],
    placeholder: 'ex : ma chaudière ne démarre plus depuis ce matin...',
    chips: ['Chaudière en panne', 'Radiateurs froids', "Pas d'eau chaude", 'Odeur de gaz'],
  },
  {
    match: ['plomb', 'eau'],
    placeholder: "ex : fuite d'eau sous l'évier, robinet cassé...",
    chips: ["Fuite d'eau", 'Robinet cassé', 'WC bouché', "Pas d'eau chaude"],
  },
  {
    match: ['électr'],
    placeholder: 'ex : coupure de courant générale, court-circuit...',
    chips: ['Coupure de courant', 'Court-circuit', 'Prise défectueuse', 'Tableau disjoncté'],
  },
  {
    match: ['clim'],
    placeholder: 'ex : climatiseur ne refroidit plus...',
    chips: ['Clim ne refroidit plus', "Fuite d'eau clim", 'Recharge fréon', 'Bruit anormal'],
  },
  {
    match: ['mécan', 'auto'],
    placeholder: 'ex : voiture ne démarre pas, batterie à plat...',
    chips: ['Voiture ne démarre pas', 'Batterie à plat', 'Pneu crevé', 'Vidange sur place'],
  },
  {
    match: ['serrur'],
    placeholder: "ex : porte claquée avec la clé à l'intérieur...",
    chips: ['Porte claquée', 'Clé cassée dans la serrure', 'Changement de cylindre', 'Verrou bloqué'],
  },
];

const FALLBACK: Suggestion = {
  match: [],
  placeholder: 'ex : décrivez brièvement le problème...',
  chips: ['Intervention rapide', 'Devis sur place', "Dépannage d'urgence", 'Entretien général'],
};

const suggestionsFor = (tradeName: string): Suggestion => {
  const name = tradeName.toLowerCase();
  return SUGGESTIONS.find((s) => s.match.some((word) => name.includes(word))) ?? FALLBACK;
};

/** The problem description, with one-tap phrases that fit the chosen trade. */
export const ProblemField: React.FC<{ tradeName: string; value: string; onChange: (v: string) => void }> = ({
  tradeName,
  value,
  onChange,
}) => {
  const { placeholder, chips } = suggestionsFor(tradeName);
  return (
    <div>
      <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2" htmlFor="problem-description">
        Décrivez le problème
      </label>
      <textarea
        id="problem-description"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
      />
      <div className="flex flex-wrap items-center gap-2 mt-2.5">
        {chips.map((chip) => {
          const picked = value.includes(chip);
          return (
            <button
              key={chip}
              type="button"
              aria-pressed={picked}
              onClick={() => onChange(picked ? value.replace(chip, '').trim() : value ? `${value}, ${chip}` : chip)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all border ${
                picked
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-brand-500 text-brand-500 dark:text-brand-accent font-semibold'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:border-brand-500'
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>
    </div>
  );
};
