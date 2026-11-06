'use client';

import { useState } from 'react';
import { ArrowRight, Ban, Bike, CheckCircle2, Eye, FileText, Pencil, PlayCircle, QrCode, UserPlus, Archive, Camera } from 'lucide-react';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import Tabs from '@/components/ui/Tabs';
import { useDriverHistory } from '@/hooks/queries/useDrivers';
import { toApiError } from '@/lib/api/errors';
import { formatDateTime } from '@/lib/utils/format';
import { AUDIT_ACTION_LABELS, DOCUMENT_FULL_LABELS, DRIVER_STATUS_LABELS } from '@/lib/utils/labels';
import type { Driver } from '@/types/driver';
import type { AuditAction, LogEntry } from '@/types/log';

const ICONS: Partial<Record<AuditAction, typeof Pencil>> = {
  'driver.created': UserPlus,
  'driver.updated': Pencil,
  'driver.photo_updated': Camera,
  'driver.validated': CheckCircle2,
  'driver.suspended': Ban,
  'driver.reactivated': PlayCircle,
  'driver.archived': Archive,
  'document.added': FileText,
  'document.renewed': FileText,
  'assignment.changed': Bike,
  'qr.generated': QrCode,
  'qr.regenerated': QrCode,
  'qr.revoked': QrCode,
  'consultation.qr': Eye,
  'consultation.search': Eye,
};

// Libellés des champs dans le tableau avant / après.
const FIELD_LABELS: Record<string, string> = {
  last_name: 'Nom',
  first_name: 'Prénom',
  birth_date: 'Date de naissance',
  phone: 'Téléphone',
  address: 'Adresse',
  driver_identifier: 'Identifiant',
  status: 'Statut',
  zc_number: 'N° ZemiConnect',
  moto: 'Moto',
};

const display = (key: string, value: unknown) =>
  value === null || value === undefined || value === '' ? '—' : key === 'status' ? (DRIVER_STATUS_LABELS[value as keyof typeof DRIVER_STATUS_LABELS] ?? String(value)) : String(value);

type Filter = 'tout' | 'audit' | 'consultation';

// Fil chronologique : création, modifications (avant / après), statuts et
// motifs, documents, affectations, QR, et consultations des agents.
export default function HistoryTab({ driver }: { driver: Driver }) {
  const history = useDriverHistory(driver.id);
  const [filter, setFilter] = useState<Filter>('tout');

  if (history.isError) {
    return (
      <Card padded={false}>
        <ErrorState message={toApiError(history.error).message} onRetry={() => history.refetch()} />
      </Card>
    );
  }

  const all = history.data ?? [];
  const entries = all.filter((entry) => filter === 'tout' || entry.kind === filter);

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        variant="pills"
        value={filter}
        onChange={(value) => setFilter(value as Filter)}
        ariaLabel="Filtrer l'historique"
        tabs={[
          { value: 'tout', label: 'Tout', count: all.length },
          { value: 'audit', label: 'Actions', count: all.filter((entry) => entry.kind === 'audit').length },
          { value: 'consultation', label: 'Consultations des agents', count: all.filter((entry) => entry.kind === 'consultation').length },
        ]}
      />
      {history.isPending ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card padded={false}>
          <EmptyState title="Aucun événement" />
        </Card>
      ) : (
        <ol className="relative flex flex-col gap-3 border-l-2 border-border pl-6">
          {entries.map((entry) => (
            <TimelineItem key={entry.id} entry={entry} />
          ))}
        </ol>
      )}
    </div>
  );
}

function TimelineItem({ entry }: { entry: LogEntry }) {
  const Icon = ICONS[entry.action] ?? FileText;
  const changes = Object.keys({ ...(entry.old_values ?? {}), ...(entry.new_values ?? {}) });
  const detail = entry.detail ? (DOCUMENT_FULL_LABELS[entry.detail as keyof typeof DOCUMENT_FULL_LABELS] ?? entry.detail) : null;
  return (
    <li className="relative">
      <span className="absolute top-3 -left-[37px] flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-secondary text-primary" aria-hidden>
        <Icon size={14} />
      </span>
      <article className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4">
        <header className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{entry.actor_name ?? 'Système'}</span> {AUDIT_ACTION_LABELS[entry.action]} ce conducteur
            {detail && <span className="text-muted"> · {detail}</span>}
          </p>
          <time className="tabular text-xs text-muted" dateTime={entry.created_at}>
            {formatDateTime(entry.created_at)}
          </time>
        </header>
        {changes.length > 0 && (
          <table className="w-full max-w-xl text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase">
                <th className="py-1 pr-3 font-semibold">Champ</th>
                <th className="py-1 pr-3 font-semibold">Avant</th>
                <th className="py-1 font-semibold" aria-label="Après" />
              </tr>
            </thead>
            <tbody>
              {changes.map((key) => (
                <tr key={key} className="border-t border-border">
                  <td className="py-1 pr-3 text-muted">{FIELD_LABELS[key] ?? key}</td>
                  <td className="py-1 pr-3 text-muted line-through">{display(key, entry.old_values?.[key])}</td>
                  <td className="flex items-center gap-1.5 py-1 font-semibold text-foreground">
                    <ArrowRight size={14} aria-hidden />
                    {display(key, entry.new_values?.[key])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {entry.reason && (
          <p className="rounded-field bg-background px-3 py-2 text-sm text-foreground">
            <span className="font-semibold">Motif : </span>
            {entry.reason}
          </p>
        )}
      </article>
    </li>
  );
}
