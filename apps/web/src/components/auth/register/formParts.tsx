import React from 'react';
import { Phone } from 'lucide-react';
import type { RegisterForm } from './registerOptions';

/** What every step receives: the form values and a way to change one. */
export interface StepProps {
  form: RegisterForm;
  setField: <K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) => void;
  digitsOnly: (value: string) => string;
}

export const LABEL = 'block text-sm font-medium text-slate-700 dark:text-slate-200';

export const StepHeader: React.FC<{ title: string; hint: string }> = ({ title, hint }) => (
  <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
    <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
  </div>
);

/** Tunisian number: the +216 is fixed, the person types the 8 digits. */
export const PhoneField: React.FC<StepProps> = ({ form, setField, digitsOnly }) => (
  <div className="space-y-1.5">
    <label className={LABEL}>Numéro de téléphone *</label>
    <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 transition-all">
      <div className="px-3.5 py-3 bg-slate-100 dark:bg-slate-800 border-e border-slate-300 dark:border-slate-700 flex items-center gap-1.5 text-sm font-extrabold text-slate-700 dark:text-slate-200">
        <Phone className="w-4 h-4 text-brand-500 dark:text-brand-accent" />
        <span>+216</span>
      </div>
      <input
        type="tel"
        aria-label="Numéro de téléphone, 8 chiffres"
        placeholder="8 chiffres (ex: 22 123 456)"
        className="w-full px-3.5 py-3 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-mono tracking-wider"
        value={form.phoneDigits}
        onChange={(e) => setField('phoneDigits', digitsOnly(e.target.value))}
        required
      />
    </div>
  </div>
);
