'use client';

import { useEffect, useState } from 'react';
import { SearchX, ShieldCheck, UserPlus } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import ReadOnlyBanner from '@/components/layout/ReadOnlyBanner';
import AccountBadge from '@/components/ui/AccountBadge';
import Button from '@/components/ui/Button';
import DataTable, { Column } from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { SearchInput } from '@/components/ui/Input';
import { toPaginationProps } from '@/components/ui/Pagination';
import { useAgents } from '@/hooks/queries/useAgents';
import { toApiError } from '@/lib/api/errors';
import { formatDateTime } from '@/lib/utils/format';
import type { User } from '@/types/user';
import AgentDrawer from './AgentDrawer';
import AgentFormDrawer from './AgentFormDrawer';

// GE7 : comptes des agents de contrôle. Administration : même écran, readOnly.
export default function AgentListScreen({ readOnly = false }: { readOnly?: boolean }) {
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => (setTerm(search.trim()), setPage(1)), 300);
    return () => clearTimeout(timer);
  }, [search]);
  const agents = useAgents({ search: term || undefined, page, per_page: 10 });

  const columns: Column<User>[] = [
    {
      key: 'name',
      title: 'Agent',
      render: (agent) => (
        <span className="flex flex-col">
          <span className="font-semibold text-foreground">
            {agent.first_name} {agent.last_name}
          </span>
          <span className="text-xs text-muted">{agent.email}</span>
        </span>
      ),
    },
    { key: 'matricule', title: 'Matricule', render: (agent) => <span className="tabular whitespace-nowrap">{agent.matricule ?? '—'}</span> },
    { key: 'structure', title: 'Structure', render: (agent) => agent.structure ?? '—' },
    { key: 'status', title: 'Statut du compte', render: (agent) => <AccountBadge status={agent.account_status} /> },
    { key: 'last_login', title: 'Dernière connexion', render: (agent) => (agent.last_login_at ? <span className="tabular whitespace-nowrap">{formatDateTime(agent.last_login_at)}</span> : <span className="text-muted">Jamais</span>) },
  ];

  const empty = term ? (
    <EmptyState
      icon={<SearchX size={24} />}
      title="Aucun agent ne correspond"
      action={
        <Button variant="outline" onClick={() => setSearch('')}>
          Effacer la recherche
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={<ShieldCheck size={24} />}
      title={readOnly ? 'Aucun agent' : 'Créez le premier compte agent'}
      action={
        !readOnly && (
          <Button leftIcon={<UserPlus size={18} />} onClick={() => setCreating(true)}>
            Nouvel agent
          </Button>
        )
      }
    />
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Agents"
        subtitle="Comptes des agents de contrôle"
        actions={
          !readOnly && (
            <Button leftIcon={<UserPlus size={18} />} onClick={() => setCreating(true)}>
              Nouvel agent
            </Button>
          )
        }
      />
      {readOnly && <ReadOnlyBanner />}
      <div className="rounded-card border border-border bg-surface p-4">
        <SearchInput label="Rechercher" value={search} onChange={setSearch} placeholder="Nom, email, matricule, structure" inputSize="md" />
      </div>
      {agents.isError ? (
        <div className="rounded-card border border-border bg-surface">
          <ErrorState message={toApiError(agents.error).message} onRetry={() => agents.refetch()} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={agents.data?.data ?? []}
          getRowKey={(agent) => agent.id}
          isLoading={agents.isPending}
          pagination={toPaginationProps(agents.data, setPage)}
          onRowClick={(agent) => setOpenId(agent.id)}
          empty={empty}
          renderCard={(agent) => (
            <span className="flex flex-col gap-1">
              <span className="flex items-center justify-between gap-2">
                <span className="font-semibold text-foreground">
                  {agent.first_name} {agent.last_name}
                </span>
                <AccountBadge status={agent.account_status} />
              </span>
              <span className="text-sm text-muted">
                {agent.matricule} · {agent.structure}
              </span>
            </span>
          )}
        />
      )}
      <AgentDrawer agentId={openId} onClose={() => setOpenId(null)} readOnly={readOnly} />
      {!readOnly && <AgentFormDrawer open={creating} onClose={() => setCreating(false)} />}
    </div>
  );
}
