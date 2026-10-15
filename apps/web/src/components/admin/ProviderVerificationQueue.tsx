import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, FileText, XCircle } from 'lucide-react';
import { api, apiErrorMessage } from '../../services/api';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useNotificationStore } from '../../store/useNotificationStore';

interface PendingProvider {
  id: string;
  cinNumber?: string | null;
  licenseNumber?: string | null;
  vehicleType?: string | null;
  bio?: string | null;
  radiusKm?: number;
  documentsUrl: string[];
  user: { id: string; fullName: string; phoneNumber: string; email?: string | null; createdAt: string };
  categories: { category: { id: string; name: string } }[];
}

const isImage = (url: string) => /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url) || url.includes('X-Amz-Signature');

/** The artisans waiting for a decision, with their documents, and the two answers: approve or refuse. */
export const ProviderVerificationQueue: React.FC<{ onDecided?: () => void }> = ({ onDecided }) => {
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [list, setList] = useState<PendingProvider[] | null>(null);
  const [refusing, setRefusing] = useState<PendingProvider | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/admin/providers/pending');
      setList(res.data.data ?? []);
    } catch (err) {
      setList([]);
      addNotification({
        title: 'Erreur',
        message: apiErrorMessage(err, 'Impossible de charger la file de vérification.'),
        type: 'danger',
      });
    }
  }, [addNotification]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (provider: PendingProvider, approve: boolean) => {
    setBusyId(provider.id);
    try {
      await api.put(`/admin/providers/${provider.id}/verify`, { approve });
      addNotification({
        title: approve ? 'Artisan approuvé' : 'Artisan refusé',
        message: approve
          ? `${provider.user.fullName} peut recevoir des demandes.`
          : `${provider.user.fullName} a été prévenu du refus.`,
        type: approve ? 'success' : 'warning',
      });
      setRefusing(null);
      await load();
      onDecided?.();
    } catch (err) {
      addNotification({ title: 'Erreur', message: apiErrorMessage(err, 'Décision impossible.'), type: 'danger' });
    } finally {
      setBusyId(null);
    }
  };

  if (list === null) {
    return <div aria-busy="true" className="h-40 rounded-tile bg-slate-200 dark:bg-slate-800 animate-pulse" />;
  }

  if (list.length === 0) {
    return (
      <div className="surface p-10 text-center">
        <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <h3 className="mt-3 text-lg font-bold">Aucun artisan en attente</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Les nouvelles inscriptions apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {list.map((p) => (
        <article key={p.id} className="surface p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-bold">{p.user.fullName}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <span dir="ltr">{p.user.phoneNumber}</span>
                {p.user.email ? ` · ${p.user.email}` : ''}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Inscrit le {new Date(p.user.createdAt).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busyId === p.id}
                onClick={() => decide(p, true)}
                className="h-11 px-5 rounded-full bg-brand-500 text-white dark:bg-brand-accent dark:text-brand-on-accent font-bold inline-flex items-center gap-2 disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                Approuver
              </button>
              <button
                type="button"
                disabled={busyId === p.id}
                onClick={() => setRefusing(p)}
                className="h-11 px-5 rounded-full border-[1.5px] border-red-700 text-red-700 dark:border-red-400 dark:text-red-400 font-bold inline-flex items-center gap-2 disabled:opacity-60"
              >
                <XCircle className="w-4 h-4" aria-hidden="true" />
                Refuser
              </button>
            </div>
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-light-border dark:border-dark-border pt-4 text-sm">
            <div>
              <dt className="micro font-sans">N° CIN</dt>
              <dd className="mt-1 font-semibold" dir="ltr">
                {p.cinNumber || '–'}
              </dd>
            </div>
            <div>
              <dt className="micro font-sans">Véhicule</dt>
              <dd className="mt-1 font-semibold">{p.vehicleType || '–'}</dd>
            </div>
            <div>
              <dt className="micro font-sans">Permis / carte pro</dt>
              <dd className="mt-1 font-semibold" dir="ltr">
                {p.licenseNumber || '–'}
              </dd>
            </div>
            <div>
              <dt className="micro font-sans">Métiers</dt>
              <dd className="mt-1 font-semibold">{p.categories.map((c) => c.category.name).join(', ') || '–'}</dd>
            </div>
          </dl>

          <div>
            <p className="micro font-sans mb-2">Documents ({p.documentsUrl.length})</p>
            {p.documentsUrl.length === 0 ? (
              <p className="text-sm text-red-700 dark:text-red-400 font-semibold">Aucun document envoyé.</p>
            ) : (
              <ul className="flex flex-wrap gap-3">
                {p.documentsUrl.map((url, i) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative block w-40 h-28 rounded-xl overflow-hidden border border-light-border dark:border-dark-border bg-light-tile dark:bg-dark-surface"
                      aria-label={`Ouvrir le document ${i + 1} dans un nouvel onglet`}
                    >
                      {isImage(url) ? (
                        <img
                          src={url}
                          alt={`Document ${i + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="w-full h-full grid place-items-center text-slate-600 dark:text-slate-300">
                          <FileText className="w-8 h-8" aria-hidden="true" />
                        </span>
                      )}
                      <span className="absolute end-1.5 top-1.5 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 grid place-items-center">
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
      ))}

      <ConfirmDialog
        isOpen={refusing !== null}
        title="Refuser cet artisan ?"
        message={`${refusing?.user.fullName ?? ''} sera prévenu du refus et ne pourra pas recevoir de demandes.`}
        confirmLabel="Refuser l'artisan"
        cancelLabel="Annuler"
        tone="danger"
        isLoading={busyId !== null}
        onConfirm={() => refusing && void decide(refusing, false)}
        onClose={() => setRefusing(null)}
      />
    </div>
  );
};
