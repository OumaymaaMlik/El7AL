import React from 'react';
import { PublicLayout } from '../layouts/PublicLayout';
import { PageHead, Section } from '../components/site/SiteBlocks';

const SUPPORT_EMAIL = 'support@el7al.tn';

const TEXT = {
  fr: {
    title: 'Supprimer mon compte El 7al',
    lead: 'Comment demander la suppression de votre compte et de vos données.',
    steps: [
      "Dans l'application El 7al : Profil, puis « Supprimer mon compte », et confirmez avec votre mot de passe. La suppression est immédiate. Elle est refusée tant qu'une demande est en cours ou qu'un solde de commissions est dû.",
      `Sans accès à l'application : écrivez à ${SUPPORT_EMAIL} depuis l'adresse e-mail de votre compte, avec l'objet « Suppression de compte ».`,
    ],
    deletedTitle: 'Données supprimées',
    deleted:
      "Votre nom, votre e-mail, votre numéro de téléphone, votre photo, vos documents d'identité (artisans), votre adresse, votre position et les messages que vous avez écrits.",
    keptTitle: 'Données conservées',
    kept: "Les interventions terminées, les avis et les écritures de paiement restent dans l'historique des autres utilisateurs, sans lien avec une personne identifiable.",
  },
  en: {
    title: 'Delete my El 7al account',
    lead: 'How to request the deletion of your account and data.',
    steps: [
      'In the El 7al app: Profile, then "Delete my account", and confirm with your password. Deletion is immediate. It is refused while a request is open or commission is owed.',
      `Without access to the app: email ${SUPPORT_EMAIL} from your account email address with the subject "Account deletion".`,
    ],
    deletedTitle: 'Data deleted',
    deleted:
      'Your name, email, phone number, photo, identity documents (artisans), address, location and the messages you wrote.',
    keptTitle: 'Data kept',
    kept: "Completed jobs, ratings and payment records stay in other users' history, with no link to an identifiable person.",
  },
} as const;

/** Public page for the Google Play "delete account URL": how to delete an account, what is deleted and what is kept. */
export const DeleteAccountInfoPage: React.FC = () => (
  <PublicLayout>
    {(['fr', 'en'] as const).map((lang) => {
      const t = TEXT[lang];
      return (
        <React.Fragment key={lang}>
          <PageHead crumb="El 7al" title={t.title} lead={t.lead} />
          <Section className="!pt-6">
            <div className="max-w-[760px] space-y-6">
              <ol className="list-decimal space-y-3 pl-5 text-slate-700 dark:text-slate-300">
                {t.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <h2 className="text-2xl font-semibold tracking-tight">{t.deletedTitle}</h2>
              <p className="text-slate-700 dark:text-slate-300">{t.deleted}</p>
              <h2 className="text-2xl font-semibold tracking-tight">{t.keptTitle}</h2>
              <p className="text-slate-700 dark:text-slate-300">{t.kept}</p>
            </div>
          </Section>
        </React.Fragment>
      );
    })}
  </PublicLayout>
);
