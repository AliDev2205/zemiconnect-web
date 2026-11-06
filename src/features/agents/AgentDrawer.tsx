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
import { useAgent, useArchiveAgent, useSendAgentResetLink, useSetAgentStatus } from '@/hooks/queries/useAgents';
import { toApiError } from '@/lib/api/errors';
import { toast } from '@/lib/toast/store';
import { formatDate, formatDateTime } from '@/lib/utils/format';
import type { User } from '@/types/user';
import AgentFormDrawer from './AgentFormDrawer';

interface Props {
  agentId: string | null;
  onClose: () => void;
  readOnly: boolean;
}

type Dialog = null | 'deactivate' | 'reactivate' | 'archive' | 'reset';

// Fiche agent (GE7), dans un Drawer : informations et actions du compte.
export default function AgentDrawer({ agentId, onClose, readOnly }: Props) {
  const agent = useAgent(agentId);
  const [editing, setEditing] = useState(false);
  const data = agent.data;

  return (
    <>
      <Drawer open={!!agentId && !editing} onClose={onClose} title="Fiche agent" description={data ? `${data.first_name} ${data.last_name}` : undefined}>
        {agent.isError ? (
          <ErrorState message={toApiError(agent.error).message} onRetry={() => agent.refetch()} />
        ) : !data ? (
          <div className="flex flex-col gap-3" role="status">
            <span className="sr-only">Chargement…</span>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <AgentDetail agent={data} readOnly={readOnly} onEdit={() => setEditing(true)} />
        )}
      </Drawer>
      {!readOnly && <AgentFormDrawer open={editing} onClose={() => setEditing(false)} agent={data} />}
    </>
  );
}

function AgentDetail({ agent, readOnly, onEdit }: { agent: User; readOnly: boolean; onEdit: () => void }) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const status = useSetAgentStatus(agent.id);
  const archive = useArchiveAgent(agent.id);
  const reset = useSendAgentResetLink(agent.id);
  const name = `${agent.first_name} ${agent.last_name}`;
  const archived = agent.account_status === 'archive';

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
      // Bandeau dans la modale.
    }
  };

  const rows: [string, React.ReactNode][] = [
    ['Matricule', <span key="m" className="tabular">{agent.matricule ?? '—'}</span>],
    ['Structure', agent.structure ?? '—'],
    ['Email', agent.email],
    ['Téléphone', <span key="p" className="tabular">{agent.phone ?? '—'}</span>],
    ['Compte créé le', formatDate(agent.created_at)],
    ['Dernière connexion', agent.last_login_at ? formatDateTime(agent.last_login_at) : 'Jamais connecté'],
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-semibold text-foreground">{name}</p>
        <AccountBadge status={agent.account_status} />
      </div>
      {agent.must_change_password && !archived && <Alert tone="info">Invitation envoyée : l&apos;agent ne s&apos;est pas encore connecté.</Alert>}
      <dl className="flex flex-col divide-y divide-border rounded-card border border-border">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      {!readOnly && !archived && (
        <section aria-label="Actions du compte" className="flex flex-col gap-2">
          <Button variant="outline" leftIcon={<Pencil size={16} />} onClick={onEdit} className="justify-start">
            Modifier les informations
          </Button>
          {agent.account_status === 'actif' && (
            <Button variant="outline" leftIcon={<KeyRound size={16} />} onClick={() => setDialog('reset')} className="justify-start">
              Envoyer un lien de réinitialisation
            </Button>
          )}
          {agent.account_status === 'actif' ? (
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

      {!readOnly && (
        <>
          <ConfirmDialog
            open={dialog === 'deactivate'}
            onClose={close}
            title={`Désactiver le compte de ${name} ?`}
            warning="L'agent sera déconnecté immédiatement."
            message="Il ne pourra plus consulter de fiche tant que le compte n'est pas réactivé."
            confirmLabel="Désactiver"
            tone="danger"
            isLoading={status.isPending}
            error={status.error}
            onConfirm={() => run(() => status.mutateAsync('desactive'), 'Compte désactivé.')}
          />
          <ConfirmDialog
            open={dialog === 'reactivate'}
            onClose={close}
            title={`Réactiver le compte de ${name} ?`}
            message="L'agent pourra de nouveau se connecter."
            confirmLabel="Réactiver"
            isLoading={status.isPending}
            error={status.error}
            onConfirm={() => run(() => status.mutateAsync('actif'), 'Compte réactivé.')}
          />
          <ConfirmDialog
            open={dialog === 'archive'}
            onClose={close}
            title={`Archiver le compte de ${name} ?`}
            message="Le compte n'est pas supprimé : il reste dans les journaux, mais ne peut plus être utilisé ni modifié."
            confirmLabel="Archiver"
            tone="danger"
            isLoading={archive.isPending}
            error={archive.error}
            onConfirm={() => run(() => archive.mutateAsync(), 'Compte archivé.')}
          />
          <ConfirmDialog
            open={dialog === 'reset'}
            onClose={close}
            title="Envoyer un lien de réinitialisation ?"
            message={`Un email avec un lien pour choisir un nouveau mot de passe sera envoyé à ${agent.email}.`}
            confirmLabel="Envoyer le lien"
            isLoading={reset.isPending}
            error={reset.error}
            onConfirm={() => run(() => reset.mutateAsync(), `Lien envoyé à ${agent.email}.`)}
          />
        </>
      )}
    </div>
  );
}
