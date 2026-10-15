import React from 'react';
import { Check, CheckCircle2, FileText, Image as ImageIcon, Lock, Mail, MapPin, Trash2, User } from 'lucide-react';
import { Input } from '../../ui/Input';
import { renderCategoryIcon } from '../../ui/categoryIcons';
import { LABEL, PhoneField, StepHeader, type StepProps } from './formParts';
import { EXPERIENCE_OPTIONS, RADIUS_OPTIONS, TUNISIAN_GOVERNORATES, type RegisterCategory } from './registerOptions';
import type { useCinUpload } from './useCinUpload';

const ICON = 'w-4 h-4 text-slate-500 dark:text-slate-400';
const PICKED = 'border-brand-500 bg-brand-500/10 text-brand-500 dark:text-brand-accent ring-2 ring-brand-500/30';
const IDLE = 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300';

/** Step 1: who the artisan is. */
export const IdentityStep: React.FC<StepProps> = ({ form, setField, digitsOnly }) => (
  <div className="space-y-4 animate-fadeIn">
    <StepHeader
      title="Étape 1 sur 4 : informations personnelles"
      hint="Vos informations d'accès et d'identification de base"
    />
    <Input
      label="Nom et prénom *"
      placeholder="Saisissez votre nom et prénom"
      icon={<User className={ICON} />}
      value={form.fullName}
      onChange={(e) => setField('fullName', e.target.value)}
      required
    />
    <Input
      label="Adresse e-mail *"
      type="email"
      placeholder="adresse@exemple.tn"
      icon={<Mail className={ICON} />}
      value={form.email}
      onChange={(e) => setField('email', e.target.value)}
      required
    />
    <Input
      label="Mot de passe *"
      type="password"
      placeholder="8 caractères minimum"
      icon={<Lock className={ICON} />}
      value={form.password}
      onChange={(e) => setField('password', e.target.value)}
      required
    />
    <Input
      label="Numéro CIN (optionnel)"
      placeholder="8 chiffres (ex: 09123456)"
      icon={<FileText className={ICON} />}
      value={form.cinNumber}
      onChange={(e) => setField('cinNumber', digitsOnly(e.target.value))}
    />
  </div>
);

/** Step 2: how to reach the artisan and how far they travel. */
export const ZoneStep: React.FC<StepProps> = (props) => {
  const { form, setField } = props;
  return (
    <div className="space-y-4 animate-fadeIn">
      <StepHeader
        title="Étape 2 sur 4 : coordonnées et zone d'intervention"
        hint="Votre numéro de contact et votre périmètre d'action"
      />
      <PhoneField {...props} />

      <div className="space-y-1.5">
        <label className={LABEL}>Gouvernorat principal *</label>
        <div className="relative">
          <MapPin className={`${ICON} absolute start-3.5 top-3.5`} />
          <select
            value={form.governorate}
            onChange={(e) => setField('governorate', e.target.value)}
            className="w-full ps-10 pe-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          >
            {TUNISIAN_GOVERNORATES.map((gov) => (
              <option key={gov} value={gov}>
                {gov}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <label className={LABEL}>Rayon d&apos;intervention d&apos;urgence *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setField('radiusKm', opt.value)}
              className={`p-3 rounded-xl border text-start transition-all ${form.radiusKm === opt.value ? `${PICKED} font-bold` : IDLE}`}
            >
              <div className="flex items-center justify-between text-sm">
                <span>{opt.label}</span>
                {form.radiusKm === opt.value && (
                  <CheckCircle2 className="w-4 h-4 text-brand-500 dark:text-brand-accent" />
                )}
              </div>
              <span className="text-xs opacity-75 block mt-0.5 font-normal">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/** Step 3: the trades, the experience and the short presentation. */
export const SkillsStep: React.FC<
  StepProps & { categories: RegisterCategory[]; onToggleCategory: (id: string) => void }
> = ({ form, setField, categories, onToggleCategory }) => (
  <div className="space-y-4 animate-fadeIn">
    <StepHeader
      title="Étape 3 sur 4 : domaines d'expertise"
      hint="Sélectionnez les services que vous proposez aux clients"
    />

    <div className="space-y-2">
      <label className={LABEL}>Sélectionnez vos spécialités *</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pe-1">
        {categories.map((cat) => {
          const picked = form.selectedCategories.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onToggleCategory(cat.id)}
              className={`p-3 rounded-xl border text-start flex items-start gap-3 transition-all ${picked ? PICKED : IDLE}`}
            >
              <div
                className={`p-2 rounded-lg ${picked ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
              >
                {renderCategoryIcon(cat.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="truncate">{cat.name}</span>
                  {picked && <Check className="w-4 h-4 shrink-0 text-brand-500 dark:text-brand-accent" />}
                </div>
                {cat.description && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {cat.description}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>

    <div className="space-y-1.5">
      <label className={LABEL}>Années d&apos;expérience professionnelle</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {EXPERIENCE_OPTIONS.map((exp) => (
          <button
            key={exp}
            type="button"
            onClick={() => setField('experience', exp)}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${form.experience === exp ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}
          >
            {exp}
          </button>
        ))}
      </div>
    </div>

    <div className="space-y-1.5">
      <label className={LABEL}>Présentation professionnelle</label>
      <textarea
        rows={3}
        aria-label="Présentation professionnelle"
        placeholder="Présentez vos compétences, vos équipements et vos années d'expérience..."
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none"
        value={form.bio}
        onChange={(e) => setField('bio', e.target.value)}
      />
    </div>
  </div>
);

/** Step 4: the identity photo the admin checks before the account can receive requests. */
export const DocumentStep: React.FC<{ cin: ReturnType<typeof useCinUpload> }> = ({ cin }) => (
  <div className="space-y-5 animate-fadeIn">
    <StepHeader
      title="Étape 4 sur 4 : vérification d'identité"
      hint="Un administrateur vérifie votre pièce avant que vous puissiez recevoir des demandes"
    />

    <div className="space-y-2">
      <label className={LABEL}>Photo de la carte d&apos;identité (CIN) ou du passeport *</label>
      {cin.previewUrl ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-light-bg dark:bg-dark-bg flex flex-col md:flex-row items-center gap-4">
          <img
            src={cin.previewUrl}
            alt="Aperçu de la pièce d'identité"
            className="w-24 h-24 object-cover rounded-xl border border-slate-300 dark:border-slate-700"
          />
          <div className="flex-1 text-center md:text-start space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs font-bold text-brand-500 dark:text-brand-accent">
              <CheckCircle2 className="w-4 h-4" />
              <span>{cin.uploading ? 'Téléversement...' : 'Pièce téléversée'}</span>
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-xs">{cin.file?.name}</p>
          </div>
          <button
            type="button"
            onClick={cin.remove}
            aria-label="Retirer le document"
            className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 rounded-2xl p-5 text-center cursor-pointer transition-all relative bg-slate-50/50 dark:bg-slate-900/50">
          <input
            type="file"
            accept="image/*"
            aria-label="Choisir la photo de la pièce d'identité"
            onChange={(e) => void cin.select(e.target.files?.[0])}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 dark:text-brand-accent flex items-center justify-center mx-auto mb-2">
            <ImageIcon className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
            Sélectionner une photo de votre pièce
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
            Formats acceptés : JPG, PNG (5 Mo max)
          </span>
        </div>
      )}
    </div>
  </div>
);
