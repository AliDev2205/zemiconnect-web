'use client';

import Link from 'next/link';
import { AlertTriangle, Bike, ChevronRight, Clock, FileWarning, History, Plus, ShieldCheck, UserPlus, Users } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { buttonClasses } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { useDashboard } from '@/hooks/queries/useDashboard';
import { useLogs } from '@/hooks/queries/useLogs';
import { toApiError } from '@/lib/api/errors';
import { ACTIVATION_ITEMS } from '@/lib/drivers/activation';
import { formatDate, formatDateTime } from '@/lib/utils/format';
import { AUDIT_ACTION_LABELS, COMPLIANCE_LABELS, DOCUMENT_FULL_LABELS, DRIVER_STATUS_LABELS } from '@/lib/utils/labels';
import type { DashboardStats, TodoItem } from '@/types/dashboard';
import type { ComplianceStatus, DriverStatus } from '@/types/driver';

interface Props {
  // Administration : mêmes chiffres, sans action d'écriture.
  readOnly?: boolean;
  // Racine des liens (/gestion ou /administration).
  basePath: string;
}

const TODO_LIMIT = 5;

// GE1 : tableau de bord. Compteurs, « À traiter », dernières actions.
export default function DashboardScreen({ readOnly = false, basePath }: Props) {
  const stats = useDashboard();
  const logs = useLogs({ kind: 'audit', per_page: 10 });
  const driversPath = `${basePath}/conducteurs`;

  const newDriver = !readOnly && (
    <Link href={`${driversPath}/nouveau`} className={buttonClasses()}>
      <Plus size={18} aria-hidden />
      Nouveau conducteur
    </Link>
  );

  if (stats.isError) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Tableau de bord" />
        <Card padded={false}>
          <ErrorState message={toApiError(stats.error).message} onRetry={() => stats.refetch()} />
        </Card>
      </div>
    );
  }

  // Premier lancement : aucun conducteur enregistré.
  if (stats.data && stats.data.drivers_total === 0) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Tableau de bord" />
        <Card padded={false}>
          <EmptyState
            icon={<UserPlus size={24} />}
            title="Aucun conducteur pour l'instant"
            message={readOnly ? 'Le registre est vide.' : 'Enregistrez le premier conducteur pour commencer le registre.'}
            action={
              !readOnly && (
                <Link href={`${driversPath}/nouveau`} className={buttonClasses()}>
                  <Plus size={18} aria-hidden />
                  Enregistrer le premier conducteur
                </Link>
              )
            }
          />
        </Card>
      </div>
    );
  }

  const data = stats.data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Tableau de bord" subtitle="Registre des conducteurs de taxi-moto de Parakou" actions={newDriver} />

      <section aria-label="Compteurs" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CounterCard title="Conducteurs par statut" icon={<Users size={18} />} loading={!data} href={driversPath}>
          {data && <Breakdown items={(Object.keys(DRIVER_STATUS_LABELS) as DriverStatus[]).map((key) => [DRIVER_STATUS_LABELS[key], data.drivers_by_status[key], `${driversPath}?statut=${key}`])} />}
        </CounterCard>
        <CounterCard title="Conducteurs actifs par conformité" icon={<ShieldCheck size={18} />} loading={!data}>
          {data && (
            <Breakdown
              items={(Object.keys(COMPLIANCE_LABELS) as ComplianceStatus[]).map((key) => [COMPLIANCE_LABELS[key], data.active_by_compliance[key], `${driversPath}?statut=actif&conformite=${key}`])}
            />
          )}
        </CounterCard>
        <CounterCard title="Motos" icon={<Bike size={18} />} loading={!data}>
          {data && (
            <>
              <BigNumber value={data.motorcycles_total} />
              <p className="text-sm text-muted">
                dont <span className="tabular font-semibold text-foreground">{data.motorcycles_unassigned}</span> sans conducteur
              </p>
            </>
          )}
        </CounterCard>
        <CounterCard title="Agents actifs" icon={<ShieldCheck size={18} />} loading={!data}>
          {data && <BigNumber value={data.agents_active} />}
        </CounterCard>
      </section>

      <section aria-labelledby="a-traiter" className="flex flex-col gap-3">
        <h2 id="a-traiter" className="text-lg font-semibold text-foreground">
          À traiter
        </h2>
        {!data ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <Card key={index}>
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : isTodoEmpty(data) ? (
          <Card padded={false}>
            <EmptyState icon={<ShieldCheck size={24} />} title="Rien à traiter" message="Aucun document expiré ou proche de l'expiration, aucun dossier en attente." />
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <TodoList title="Documents expirés" icon={<FileWarning size={18} className="text-danger" />} items={data.todo.expired} driversPath={driversPath} kind="expired" allHref={`${driversPath}?conformite=non_conforme`} />
            <TodoList title="Expirent dans les 30 jours" icon={<Clock size={18} className="text-warning" />} items={data.todo.expiring} driversPath={driversPath} kind="expiring" allHref={`${driversPath}?conformite=expire_bientot`} />
            <TodoList title="Dossiers en attente" icon={<AlertTriangle size={18} className="text-neutral" />} items={data.todo.pending} driversPath={driversPath} kind="pending" allHref={`${driversPath}?statut=en_attente`} />
          </div>
        )}
      </section>

      <Card
        title={
          <span className="flex items-center gap-2">
            <History size={18} aria-hidden />
            Dernières actions
          </span>
        }
        actions={
          <Link href={`${basePath}/journaux`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Journal complet
            <ChevronRight size={16} aria-hidden />
          </Link>
        }
        padded={false}
      >
        {logs.isPending ? (
          <div className="flex flex-col gap-3 p-5">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-5 w-full" />
            ))}
          </div>
        ) : logs.isError ? (
          <ErrorState message={toApiError(logs.error).message} onRetry={() => logs.refetch()} />
        ) : logs.data.data.length === 0 ? (
          <EmptyState title="Aucune action enregistrée" />
        ) : (
          <ul className="divide-y divide-border">
            {logs.data.data.map((log) => (
              <li key={log.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3 text-sm">
                <p className="min-w-0 text-foreground">
                  <span className="font-semibold">{log.actor_name ?? 'Système'}</span> {AUDIT_ACTION_LABELS[log.action]}{' '}
                  {log.driver_id ? (
                    <Link href={`${driversPath}/${log.driver_id}`} className="font-semibold text-primary hover:underline">
                      {log.resource_label}
                    </Link>
                  ) : (
                    <span className="font-semibold">{log.resource_label}</span>
                  )}
                  {log.detail && <span className="text-muted"> · {DOCUMENT_FULL_LABELS[log.detail as keyof typeof DOCUMENT_FULL_LABELS] ?? log.detail}</span>}
                </p>
                <time className="tabular shrink-0 text-xs text-muted" dateTime={log.created_at}>
                  {formatDateTime(log.created_at)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function isTodoEmpty(data: DashboardStats) {
  return data.todo.expired.length + data.todo.expiring.length + data.todo.pending.length === 0;
}

function CounterCard({ title, icon, loading, href, children }: { title: string; icon: React.ReactNode; loading: boolean; href?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-card border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-muted">{href ? <Link href={href} className="hover:text-primary hover:underline">{title}</Link> : title}</h2>
        <span className="flex h-9 w-9 items-center justify-center rounded-field bg-secondary text-primary" aria-hidden>
          {icon}
        </span>
      </div>
      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function BigNumber({ value }: { value: number }) {
  return <p className="tabular text-3xl font-semibold text-foreground">{value}</p>;
}

function Breakdown({ items }: { items: [string, number, string][] }) {
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {items.map(([label, value, href]) => (
        <li key={label}>
          <Link href={href} className="flex items-center justify-between gap-2 rounded px-1 py-0.5 hover:bg-secondary">
            <span className="text-muted">{label}</span>
            <span className="tabular font-semibold text-foreground">{value}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function TodoList({
  title,
  icon,
  items,
  driversPath,
  kind,
  allHref,
}: {
  title: string;
  icon: React.ReactNode;
  items: TodoItem[];
  driversPath: string;
  kind: 'expired' | 'expiring' | 'pending';
  allHref: string;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-card border border-border bg-surface">
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {icon}
          {title}
        </h3>
        <span className="tabular rounded bg-background px-2 py-0.5 text-xs font-semibold text-muted">{items.length}</span>
      </header>
      {items.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted">Aucun</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.slice(0, TODO_LIMIT).map((item) => (
            <li key={`${item.driver_id}-${item.document_type ?? 'dossier'}`}>
              <Link href={`${driversPath}/${item.driver_id}`} className="flex items-start justify-between gap-3 px-4 py-2.5 hover:bg-secondary">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">{item.driver_name}</span>
                  <span className="block truncate text-xs text-muted">
                    {kind === 'pending'
                      ? item.missing && item.missing.length > 0
                        ? `Manque : ${ACTIVATION_ITEMS.filter((entry) => item.missing!.includes(entry.id)).map((entry) => entry.label.toLowerCase()).join(', ')}`
                        : 'Complet, prêt à valider'
                      : DOCUMENT_FULL_LABELS[item.document_type!]}
                  </span>
                </span>
                <span className="tabular shrink-0 text-xs text-muted">
                  {kind === 'pending' ? `créé le ${formatDate(item.date)}` : `${kind === 'expired' ? 'expiré le' : 'expire le'} ${formatDate(item.date)}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {items.length > TODO_LIMIT && (
        <Link href={allHref} className="mt-auto border-t border-border px-4 py-2.5 text-sm font-semibold text-primary hover:underline">
          Tout voir ({items.length})
        </Link>
      )}
    </section>
  );
}
