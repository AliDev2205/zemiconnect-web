'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SearchX } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DataTable, { Column } from '@/components/ui/DataTable';
import DateField from '@/components/ui/DateField';
import Drawer from '@/components/ui/Drawer';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { SearchInput } from '@/components/ui/Input';
import { toPaginationProps } from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import Tabs from '@/components/ui/Tabs';
import { ChangesTable } from '@/features/drivers/detail/HistoryTab';
import { useLogActors, useLogs } from '@/hooks/queries/useLogs';
import { toApiError } from '@/lib/api/errors';
import { formatDateTime } from '@/lib/utils/format';
import { AUDIT_ACTION_LABELS, AUDIT_ACTION_NAMES, DOCUMENT_FULL_LABELS } from '@/lib/utils/labels';
import type { AuditAction, LogEntry, LogFilters, LogKind } from '@/types/log';

interface Props {
  // Racine de l'espace (/gestion ou /administration), pour les liens vers les fiches.
  basePath: string;
  // Troisième onglet « Connexions » : utilisé par l'administration (lot 4).
  withConnections?: boolean;
}

const TABS: { value: LogKind; label: string }[] = [
  { value: 'audit', label: "Journal d'audit" },
  { value: 'consultation', label: 'Consultations des agents' },
];

// Types d'action proposés par onglet.
const ACTIONS_BY_KIND: Record<LogKind, AuditAction[]> = {
  audit: (Object.keys(AUDIT_ACTION_NAMES) as AuditAction[]).filter((action) => !action.startsWith('consultation.') && action !== 'auth.login'),
  consultation: ['consultation.qr', 'consultation.search'],
  connexion: ['auth.login'],
};

type Filters = Pick<LogFilters, 'actor' | 'action' | 'driver' | 'start_date' | 'end_date'>;

// GE8 : journaux, en LECTURE SEULE dans tous les espaces (aucune action d'écriture).
export default function LogsScreen({ basePath, withConnections = false }: Props) {
  const [kind, setKind] = useState<LogKind>('audit');
  const [filters, setFilters] = useState<Filters>({});
  const [driverSearch, setDriverSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<LogEntry | null>(null);
  const logs = useLogs({ kind, ...filters, page, per_page: 15 });
  const actors = useLogActors(kind);
  const tabs = withConnections ? [...TABS, { value: 'connexion' as const, label: 'Connexions' }] : TABS;

  const set = (changes: Filters) => {
    setFilters((current) => ({ ...current, ...changes }));
    setPage(1);
  };
  useEffect(() => {
    const timer = setTimeout(() => set({ driver: driverSearch.trim() || undefined }), 350);
    return () => clearTimeout(timer);
  }, [driverSearch]);

  const changeKind = (next: string) => {
    setKind(next as LogKind);
    setFilters({});
    setDriverSearch('');
    setPage(1);
  };
  const hasFilters = Object.values(filters).some(Boolean);

  const objectLink = (log: LogEntry) => {
    const href =
      log.resource_type === 'motorcycle' && log.resource_id
        ? `${basePath}/motos/${log.resource_id}`
        : log.driver_id
          ? `${basePath}/conducteurs/${log.driver_id}`
          : null;
    const label = log.resource_label ?? '—';
    return href ? (
      <Link href={href} onClick={(event) => event.stopPropagation()} className="font-semibold text-primary hover:underline">
        {label}
      </Link>
    ) : (
      <span className="font-semibold">{label}</span>
    );
  };

  const date: Column<LogEntry> = { key: 'date', title: 'Date et heure', render: (log) => <span className="tabular whitespace-nowrap">{formatDateTime(log.created_at)}</span> };
  const actor: Column<LogEntry> = { key: 'actor', title: kind === 'consultation' ? 'Agent' : 'Utilisateur', render: (log) => log.actor_name ?? 'Système' };
  const ip: Column<LogEntry> = { key: 'ip', title: 'IP', render: (log) => <span className="tabular text-muted">{log.ip_address ?? '—'}</span> };

  const columns: Column<LogEntry>[] =
    kind === 'audit'
      ? [
          date,
          actor,
          {
            key: 'action',
            title: 'Action',
            render: (log) => (
              <span>
                {AUDIT_ACTION_LABELS[log.action]}
                {log.detail && <span className="text-muted"> · {DOCUMENT_FULL_LABELS[log.detail as keyof typeof DOCUMENT_FULL_LABELS] ?? log.detail}</span>}
              </span>
            ),
          },
          { key: 'object', title: 'Objet', render: objectLink },
          ip,
        ]
      : kind === 'consultation'
        ? [
            date,
            actor,
            { key: 'driver', title: 'Conducteur', render: objectLink },
            { key: 'channel', title: 'Canal', render: (log) => <Badge tone="primary">{log.action === 'consultation.qr' ? 'QR' : 'Recherche'}</Badge> },
          ]
        : [date, actor, { key: 'role', title: 'Rôle', render: (log) => log.actor_role ?? '—' }, ip];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Journaux" subtitle="Consultation seule : les journaux ne sont jamais modifiables." />
      <Tabs tabs={tabs} value={kind} onChange={changeKind} ariaLabel="Journaux" />

      <section aria-label="Filtres" className="grid gap-3 rounded-card border border-border bg-surface p-4 md:grid-cols-2 xl:grid-cols-5">
        <DateField label="Du" value={filters.start_date ?? ''} max={filters.end_date} onChange={(event) => set({ start_date: event.target.value || undefined })} />
        <DateField label="Au" value={filters.end_date ?? ''} min={filters.start_date} onChange={(event) => set({ end_date: event.target.value || undefined })} />
        <Select
          label={kind === 'consultation' ? 'Agent' : 'Utilisateur'}
          placeholder="Tous"
          options={(actors.data ?? []).map((name) => ({ value: name, label: name }))}
          value={filters.actor ?? ''}
          onChange={(event) => set({ actor: event.target.value || undefined })}
        />
        <Select
          label={kind === 'consultation' ? 'Canal' : "Type d'action"}
          placeholder="Tous"
          options={ACTIONS_BY_KIND[kind].map((action) => ({ value: action, label: kind === 'consultation' ? (action === 'consultation.qr' ? 'QR' : 'Recherche') : AUDIT_ACTION_NAMES[action] }))}
          value={filters.action ?? ''}
          onChange={(event) => set({ action: (event.target.value || undefined) as AuditAction | undefined })}
          disabled={kind === 'connexion'}
        />
        <SearchInput label="Conducteur" value={driverSearch} onChange={setDriverSearch} placeholder="Nom ou numéro" inputSize="md" />
      </section>

      {logs.isError ? (
        <div className="rounded-card border border-border bg-surface">
          <ErrorState message={toApiError(logs.error).message} onRetry={() => logs.refetch()} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={logs.data?.data ?? []}
          getRowKey={(log) => log.id}
          isLoading={logs.isPending}
          pagination={toPaginationProps(logs.data, setPage)}
          onRowClick={kind === 'audit' ? setSelected : undefined}
          empty={
            <EmptyState
              icon={<SearchX size={24} />}
              title={hasFilters ? 'Aucune entrée ne correspond' : 'Journal vide'}
              message={hasFilters ? 'Modifiez les filtres.' : undefined}
              action={
                hasFilters && (
                  <Button variant="outline" onClick={() => (setFilters({}), setDriverSearch(''))}>
                    Effacer les filtres
                  </Button>
                )
              }
            />
          }
          renderCard={(log) => (
            <span className="flex flex-col gap-1 text-sm">
              <span className="tabular text-xs text-muted">{formatDateTime(log.created_at)}</span>
              <span>
                <span className="font-semibold">{log.actor_name ?? 'Système'}</span> {AUDIT_ACTION_LABELS[log.action]} {log.resource_label}
              </span>
            </span>
          )}
        />
      )}

      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Détail de l'action" description={selected ? formatDateTime(selected.created_at) : undefined} width={560}>
        {selected && (
          <div className="flex flex-col gap-5">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted">Utilisateur</dt>
              <dd className="font-semibold">{selected.actor_name ?? 'Système'}</dd>
              <dt className="text-muted">Action</dt>
              <dd>{AUDIT_ACTION_NAMES[selected.action]}</dd>
              <dt className="text-muted">Objet</dt>
              <dd>{objectLink(selected)}</dd>
              {selected.detail && (
                <>
                  <dt className="text-muted">Précision</dt>
                  <dd>{DOCUMENT_FULL_LABELS[selected.detail as keyof typeof DOCUMENT_FULL_LABELS] ?? selected.detail}</dd>
                </>
              )}
              <dt className="text-muted">IP</dt>
              <dd className="tabular">{selected.ip_address ?? '—'}</dd>
            </dl>
            {selected.reason && (
              <p className="rounded-field bg-background px-3 py-2 text-sm">
                <span className="font-semibold">Motif : </span>
                {selected.reason}
              </p>
            )}
            <section aria-label="Avant et après" className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">Avant / après</h3>
              {selected.old_values || selected.new_values ? <ChangesTable entry={selected} /> : <p className="text-sm text-muted">Aucune valeur modifiée enregistrée pour cette action.</p>}
            </section>
          </div>
        )}
      </Drawer>
    </div>
  );
}
