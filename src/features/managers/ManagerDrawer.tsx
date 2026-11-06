'use client';

import { useState } from 'react';
import { Archive, KeyRound, Pencil, PlayCircle, UserX } from 'lucide-react';
import AccountBadge from '@/components/ui/AccountBadge';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Drawer from '@/components/ui/Drawer';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { useMe } from '@/hooks/queries/useAuth';
import { useArchiveManager, useManager, useSendManagerResetLink, useSetManagerStatus } from '@/hooks/queries/useManagers';
import { toApiError } from '@/lib/api/errors';
import { toast } from '@/lib/toast/store';
import { formatDate, formatDateTime } from '@/lib/utils/format';
import type { User } from '@/types/user';
import ManagerFormDrawer from './ManagerFormDrawer';

type Dialog = null | 'deactivate' | 'reactivate' | 'archive' | 'reset';

// Fiche gestionnaire (AD2) dans un Drawer : informations et actions du compte.
export default function ManagerDrawer({ managerId, onClose }: { managerId: string | null; onClose: () => void }) {
  const manager = useManager(managerId);
  const [editing, setEditing] = useState(false);
  const data = manager.data;
  return (
    <>
      <Drawer open={!!managerId && !editing} onClose={onClose} title="Fiche gestionnaire" description={data ? `${data.first_name} ${data.last_name}` : undefined}>
        {manager.isError ? (
          <ErrorState message={toApiError(manager.error).message} onRetry={() => manager.refetch()} />
        ) : !data ? (
          <div className="flex flex-col gap-3" role="status">
            <span className="sr-only">Chargement…</span>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <ManagerDetail manager={data} onEdit={() => setEditing(true)} />
        )}
      </Drawer>
      <ManagerFormDrawer open={editing} onClose={() => setEditing(false)} manager={data} />
    </>
  );
}

function ManagerDetail({ manager, onEdit }: { manager: User; onEdit: () => void }) {
  const me = useMe();
  const [dialog, setDialog] = useState<Dialog>(null);
  const status = useSetManagerStatus(manager.id);
  const archive = useArchiveManager(manager.id);
  const reset = useSendManagerResetLink(manager.id);
  const name = `${manager.first_name} ${manager.last_name}`;
  const archived = manager.account_status === 'archive';
  // Garde-fou : jamais d'action sur son propre compte.
  const self = me.data?.user.id === manager.id;

  const close = () => {
    status.reset();
    archive.reset();
    reset.reset();
    setDialog(null);
  };
  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      toast.success(message);
      setDialog(null);
    } catch {
      // Bandeau dans la modale, saisie conservée.
    }
  };

  const rows: [string, React.ReactNode][] = [
    ['Email', manager.email],
    ['Téléphone', <span key="p" className="tabular">{manager.phone ?? '—'}</span>],
    ['Compte créé le', formatDate(manager.created_at)],
    ['Dernière connexion', manager.last_login_at ? formatDateTime(manager.last_login_at) : 'Jamais connecté'],
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-semibold text-foreground">{name}</p>
        <AccountBadge status={manager.account_status} />
      </div>
      {manager.must_change_password && !archived && <Alert tone="info">Invitation envoyée : le gestionnaire ne s&apos;est pas encore connecté.</Alert>}
      <dl className="flex flex-col divide-y divide-border rounded-card border border-border">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      {!archived && !self && (
        <section aria-label="Actions du compte" className="flex flex-col gap-2">
          <Button variant="outline" leftIcon={<Pencil size={16} />} onClick={onEdit} className="justify-start">
            Modifier les informations
          </Button>
          {manager.account_status === 'actif' && (
            <Button variant="outline" leftIcon={<KeyRound size={16} />} onClick={() => setDialog('reset')} className="justify-start">
              Envoyer un lien de réinitialisation
            </Button>
          )}
          {manager.account_status === 'actif' ? (
            <Button variant="outline" leftIcon={<UserX size={16} />} onClick={() => setDialog('deactivate')} className="justify-start text-danger">
              Désactiver le compte
            </Button>
          ) : (
            <Button variant="outline" leftIcon={<PlayCircle size={16} />} onClick={() => setDialog('reactivate')} className="justify-start">
              Réactiver le compte
            </Button>
          )}
          <Button variant="outline" leftIcon={<Archive size={16} />} onClick={() => setDialog('archive')} className="justify-start text-danger">
            Archiver le compte
          </Button>
        </section>
      )}
      {archived && <Alert tone="info">Compte archivé : il reste visible dans les journaux, sans modification possible.</Alert>}

      <ConfirmDialog
        open={dialog === 'deactivate'}
        onClose={close}
        title="Désactiver ce gestionnaire ?"
        message={`Le compte de ${name} (${manager.email}) sera désactivé.`}
        warning="Il sera déconnecté immédiatement."
        confirmLabel="Désactiver le compte"
        tone="danger"
        requireReason
        reasonLabel="Motif de la désactivation"
        isLoading={status.isPending}
        error={status.error}
        onConfirm={(reason) => run(() => status.mutateAsync({ status: 'desactive', reason: reason! }), 'Compte désactivé.')}
      />
      <ConfirmDialog
        open={dialog === 'reactivate'}
        onClose={close}
        title="Réactiver ce gestionnaire ?"
        message={`${name} pourra de nouveau se connecter.`}
        confirmLabel="Réactiver"
        isLoading={status.isPending}
        error={status.error}
        onConfirm={() => run(() => status.mutateAsync({ status: 'actif', reason: null }), 'Compte réactivé.')}
      />
      <ConfirmDialog
        open={dialog === 'archive'}
        onClose={close}
        title="Archiver ce gestionnaire ?"
        message="Le compte n'est pas supprimé : il reste dans les journaux, mais ne peut plus être utilisé ni modifié."
        confirmLabel="Archiver"
        tone="danger"
        requireReason
        reasonLabel="Motif de l'archivage"
        isLoading={archive.isPending}
        error={archive.error}
        onConfirm={(reason) => run(() => archive.mutateAsync(reason!), 'Compte archivé.')}
      />
      <ConfirmDialog
        open={dialog === 'reset'}
        onClose={close}
        title="Envoyer un lien de réinitialisation ?"
        message={`Un email avec un lien pour choisir un nouveau mot de passe sera envoyé à ${manager.email}.`}
        confirmLabel="Envoyer le lien"
        isLoading={reset.isPending}
        error={reset.error}
        onConfirm={() => run(() => reset.mutateAsync(), `Lien envoyé à ${manager.email}.`)}
      />
    </div>
  );
}
