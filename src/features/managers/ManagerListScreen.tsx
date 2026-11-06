'use client';

import { useEffect, useState } from 'react';
import { Plus, SearchX, UsersRound } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import AccountBadge from '@/components/ui/AccountBadge';
import Button from '@/components/ui/Button';
import DataTable, { Column } from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { SearchInput } from '@/components/ui/Input';
import { toPaginationProps } from '@/components/ui/Pagination';
import { useManagers } from '@/hooks/queries/useManagers';
import { toApiError } from '@/lib/api/errors';
import { formatDateTime } from '@/lib/utils/format';
import type { User } from '@/types/user';
import ManagerDrawer from './ManagerDrawer';
import ManagerFormDrawer from './ManagerFormDrawer';

// AD2 : comptes gestionnaires. Seul écran de l'administration où l'on écrit.
// Seuls des gestionnaires sont listés : l'administrateur connecté n'y figure pas.
export default function ManagerListScreen() {
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => (setTerm(search.trim()), setPage(1)), 300);
    return () => clearTimeout(timer);
  }, [search]);
  const managers = useManagers({ search: term || undefined, page, per_page: 10 });

  const columns: Column<User>[] = [
    { key: 'name', title: 'Nom', render: (user) => <span className="font-semibold text-foreground">{user.first_name} {user.last_name}</span> },
    { key: 'email', title: 'Email', render: (user) => user.email },
    { key: 'phone', title: 'Téléphone', render: (user) => <span className="tabular whitespace-nowrap">{user.phone ?? '—'}</span> },
    { key: 'status', title: 'Statut du compte', render: (user) => <AccountBadge status={user.account_status} /> },
    { key: 'last_login', title: 'Dernière connexion', render: (user) => (user.last_login_at ? <span className="tabular whitespace-nowrap">{formatDateTime(user.last_login_at)}</span> : <span className="text-muted">Jamais</span>) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Gestionnaires"
        subtitle="Comptes des gestionnaires du registre"
        actions={
          <Button leftIcon={<Plus size={18} />} onClick={() => setCreating(true)}>
            Nouveau gestionnaire
          </Button>
        }
      />
      <div className="rounded-card border border-border bg-surface p-4">
        <SearchInput label="Rechercher" value={search} onChange={setSearch} placeholder="Nom ou email" inputSize="md" />
      </div>
      {managers.isError ? (
        <div className="rounded-card border border-border bg-surface">
          <ErrorState message={toApiError(managers.error).message} onRetry={() => managers.refetch()} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={managers.data?.data ?? []}
          getRowKey={(user) => user.id}
          isLoading={managers.isPending}
          pagination={toPaginationProps(managers.data, setPage)}
          onRowClick={(user) => setOpenId(user.id)}
          empty={
            term ? (
              <EmptyState
                icon={<SearchX size={24} />}
                title="Aucun gestionnaire ne correspond"
                action={
                  <Button variant="outline" onClick={() => setSearch('')}>
                    Effacer la recherche
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={<UsersRound size={24} />}
                title="Créez le premier gestionnaire"
                action={
                  <Button leftIcon={<Plus size={18} />} onClick={() => setCreating(true)}>
                    Nouveau gestionnaire
                  </Button>
                }
              />
            )
          }
          renderCard={(user) => (
            <span className="flex flex-col gap-1">
              <span className="flex items-center justify-between gap-2">
                <span className="font-semibold text-foreground">
                  {user.first_name} {user.last_name}
                </span>
                <AccountBadge status={user.account_status} />
              </span>
              <span className="text-sm text-muted">{user.email}</span>
            </span>
          )}
        />
      )}
      <ManagerDrawer managerId={openId} onClose={() => setOpenId(null)} />
      <ManagerFormDrawer open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
