import React from 'react';
import { Lock, Mail, MapPin, User } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { PhoneField, StepHeader, type StepProps } from './formParts';

const ICON = 'w-4 h-4 text-slate-500 dark:text-slate-400';

/** The single-screen sign-up of a customer. */
export const ClientForm: React.FC<StepProps & { loading: boolean }> = (props) => {
  const { form, setField, loading } = props;
  return (
    <div className="space-y-4 animate-fadeIn">
      <StepHeader
        title="Informations du compte client"
        hint="Vos coordonnées pour commander des prestations d'urgence"
      />
      <Input
        label="Nom et prénom *"
        placeholder="Saisissez votre nom et prénom"
        icon={<User className={ICON} />}
        value={form.fullName}
        onChange={(e) => setField('fullName', e.target.value)}
        required
      />
      <PhoneField {...props} />
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
        label="Adresse par défaut (optionnelle)"
        placeholder="Saisissez votre adresse ou gouvernorat"
        icon={<MapPin className={ICON} />}
        value={form.defaultAddress}
        onChange={(e) => setField('defaultAddress', e.target.value)}
      />
      <Button type="submit" variant="primary" className="w-full mt-4 font-bold" isLoading={loading}>
        Créer votre compte client El 7al
      </Button>
    </div>
  );
};
