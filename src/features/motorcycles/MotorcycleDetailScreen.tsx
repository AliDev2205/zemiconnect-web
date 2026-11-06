'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Archive, ArrowLeft, Pencil, RefreshCw, UserRound } from 'lucide-react';
import ReadOnlyBanner from '@/components/layout/ReadOnlyBanner';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DataTable, { Column } from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import ValidityPill from '@/components/ui/ValidityPill';
import { DocumentModal, ViewFileButton } from '@/features/drivers/forms/DocumentModal';
import { useDocumentHistory } from '@/hooks/queries/useDocuments';
import { useArchiveMotorcycle, useMotorcycle, useMotorcycleAssignments } from '@/hooks/queries/useMotorcycles';
import { toApiError } from '@/lib/api/errors';
import { toast } from '@/lib/toast/store';
import { formatDate } from '@/lib/utils/format';
import type { Document } from '@/types/document';
import type { Assignment, Motorcycle } from '@/types/motorcycle';
import MotorcycleFormDrawer from './MotorcycleFormDrawer';
import { driversPathOf, MotorcycleScreenProps } from './MotorcycleListScreen';
import MotorcycleStatusBadge from './MotorcycleStatusBadge';

// GE6 : fiche moto. Partagée par la gestion et l'administration (readOnly).
export default function MotorcycleDetailScreen({ id, readOnly = false, basePath }: MotorcycleScreenProps & { id: string }) {
  const moto = useMotorcycle(id);

  const back = (
    <Link href={basePath} className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline">
      <ArrowLeft size={16} aria-hidden />
      Motos
    </Link>
  );

  if (moto.isError) {
    const notFound = toApiError(moto.error).status === 404;
    return (
      <div className="flex flex-col gap-5">
        {back}
        <Card padded={false}>
          <ErrorState
            title={notFound ? 'Moto introuvable' : undefined}
            message={notFound ? "Cette moto n'existe pas ou n'est plus accessible." : toApiError(moto.error).message}
            onRetry={notFound ? undefined : () => moto.refetch()}
          />
        </Card>
      </div>
    );
  }

  if (moto.isPending) {
    return (
      <div className="flex flex-col gap-5" role="status">
        <span className="sr-only">Chargement de la fiche…</span>
        {back}
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  const data = moto.data;
  // Moto archivée : consultable, plus aucune écriture.
  const locked = readOnly || !!data.archived_at;

  return (
    <div className="flex flex-col gap-5">
      {back}
      {readOnly && <ReadOnlyBanner />}
      {data.archived_at && (
        <Alert tone="info" icon={<Archive size={18} />} title="Moto archivée">
          Archivée le {formatDate(data.archived_at)}. Elle reste consultable, sans modification possible.
        </Alert>
      )}
      <Header moto={data} readOnly={locked} />
      <div className="grid gap-5 lg:grid-cols-2">
        <CurrentDriver moto={data} driversPath={driversPathOf(basePath)} />
        <CurrentInsurance moto={data} readOnly={locked} />
      </div>
      <InsuranceHistory moto={data} />
      <DriverHistory moto={data} driversPath={driversPathOf(basePath)} />
    </div>
  );
}

function Header({ moto, readOnly }: { moto: Motorcycle; readOnly: boolean }) {
  const [editing, setEditing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const archive = useArchiveMotorcycle(moto.id);
  const assigned = !!moto.driver_id;

  return (
    <section className="flex flex-col gap-4 rounded-card border border-border bg-surface p-5 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="tabular rounded-field border-2 border-foreground px-4 py-1 text-2xl font-bold tracking-wider text-foreground">{moto.plate_number}</h1>
          <MotorcycleStatusBadge moto={moto} />
        </div>
        <p className="text-sm text-muted">
          {[moto.brand, moto.model].filter(Boolean).join(' ') || 'Marque inconnue'} · Couleur {moto.color ?? '—'} · Année {moto.year ?? '—'} · Châssis{' '}
          <span className="tabular">{moto.chassis_number ?? '—'}</span>
        </p>
      </div>
      {!readOnly && (
        <div className="flex flex-col items-start gap-1.5 md:items-end">
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Pencil size={16} />} onClick={() => setEditing(true)}>
              Modifier
            </Button>
            {/* Inactif (et non absent) tant que la moto est affectée : la raison est affichée. */}
            <Button variant="outline" leftIcon={<Archive size={16} />} disabled={assigned} aria-describedby={assigned ? 'archive-reason' : undefined} onClick={() => setArchiving(true)}>
              Archiver
            </Button>
          </div>
          {assigned && (
            <p id="archive-reason" className="text-xs text-muted">
              Changez d&apos;abord la moto du conducteur.
            </p>
          )}
        </div>
      )}

      {!readOnly && (
        <>
          <MotorcycleFormDrawer open={editing} onClose={() => setEditing(false)} moto={moto} />
          <ConfirmDialog
            open={archiving}
            onClose={() => (archive.reset(), setArchiving(false))}
            title={`Archiver la moto ${moto.plate_number} ?`}
            message="La moto n'est pas supprimée : elle reste consultable, mais ne peut plus être affectée ni modifiée."
            confirmLabel="Archiver"
            tone="danger"
            isLoading={archive.isPending}
            error={archive.error}
            onConfirm={async () => {
              try {
                await archive.mutateAsync();
                toast.success('Moto archivée.');
                setArchiving(false);
              } catch {
                // Bandeau dans la modale.
              }
            }}
          />
        </>
      )}
    </section>
  );
}

function CurrentDriver({ moto, driversPath }: { moto: Motorcycle; driversPath: string }) {
  const assignments = useMotorcycleAssignments(moto.id);
  const current = assignments.data?.find((item) => item.ended_at === null);
  return (
    <Card title="Conducteur actuel">
      {moto.driver_id ? (
        <div className="flex flex-col gap-2">
          <Link href={`${driversPath}/${moto.driver_id}`} className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline">
            <UserRound size={18} aria-hidden />
            {moto.driver_name}
          </Link>
          <p className="text-sm text-muted">{current ? `Affectée depuis le ${formatDate(current.started_at)}` : <Skeleton className="h-4 w-40" />}</p>
        </div>
      ) : (
        <EmptyState icon={<UserRound size={24} />} title="Sans conducteur" message="L'affectation se fait depuis la fiche d'un conducteur (« Changer de moto »)." className="py-6" />
      )}
    </Card>
  );
}

function CurrentInsurance({ moto, readOnly }: { moto: Motorcycle; readOnly: boolean }) {
  const [renewing, setRenewing] = useState(false);
  const insurance = moto.documents.find((document) => document.type === 'assurance') ?? null;
  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          Assurance actuelle <ValidityPill validity={insurance?.validity ?? 'manquant'} />
        </span>
      }
    >
      {insurance ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted">Numéro</dt>
          <dd className="tabular font-semibold">{insurance.number ?? '—'}</dd>
          <dt className="text-muted">Délivrée le</dt>
          <dd>{formatDate(insurance.issued_at)}</dd>
          <dt className="text-muted">Expire le</dt>
          <dd>{formatDate(insurance.expires_at)}</dd>
        </dl>
      ) : (
        <p className="text-sm text-muted">Aucune assurance enregistrée.</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {insurance?.has_file && <ViewFileButton documentId={insurance.id} />}
        {!readOnly && (
          <Button size="sm" variant={insurance ? 'outline' : 'primary'} leftIcon={<RefreshCw size={14} />} onClick={() => setRenewing(true)}>
            {insurance ? 'Renouveler' : 'Ajouter'}
          </Button>
        )}
      </div>
      {!readOnly && renewing && <DocumentModal type="assurance" owner={{ type: 'motorcycle', id: moto.id }} current={insurance} onClose={() => setRenewing(false)} />}
    </Card>
  );
}

function InsuranceHistory({ moto }: { moto: Motorcycle }) {
  const history = useDocumentHistory({ type: 'motorcycle', id: moto.id });
  const current = moto.documents.filter((document) => document.type === 'assurance');
  const rows = [...current, ...(history.data ?? []).filter((document) => document.type === 'assurance')];
  const columns: Column<Document>[] = [
    { key: 'number', title: 'Numéro', render: (document) => <span className="tabular font-semibold">{document.number ?? '—'}</span> },
    { key: 'period', title: 'Période', render: (document) => `${formatDate(document.issued_at)} → ${formatDate(document.expires_at)}` },
    { key: 'validity', title: 'Validité', render: (document) => (document.superseded_at ? <span className="text-muted">Remplacée le {formatDate(document.superseded_at)}</span> : <ValidityPill validity={document.validity} />) },
    { key: 'file', title: 'Fichier', render: (document) => (document.has_file ? <ViewFileButton documentId={document.id} /> : '—') },
  ];
  return (
    <section aria-labelledby="historique-assurances" className="flex flex-col gap-2">
      <h2 id="historique-assurances" className="text-base font-semibold text-foreground">
        Historique des assurances
      </h2>
      {history.isError ? (
        <Card padded={false}>
          <ErrorState message={toApiError(history.error).message} onRetry={() => history.refetch()} />
        </Card>
      ) : (
        <DataTable columns={columns} data={rows} getRowKey={(document) => document.id} isLoading={history.isPending} compact emptyTitle="Aucune assurance enregistrée" emptyMessage="" />
      )}
    </section>
  );
}

function DriverHistory({ moto, driversPath }: { moto: Motorcycle; driversPath: string }) {
  const assignments = useMotorcycleAssignments(moto.id);
  const columns: Column<Assignment>[] = [
    {
      key: 'driver',
      title: 'Conducteur',
      render: (row) => (
        <Link href={`${driversPath}/${row.driver_id}`} className="font-semibold text-primary hover:underline">
          {row.driver_name}
        </Link>
      ),
    },
    { key: 'started', title: 'Du', render: (row) => formatDate(row.started_at) },
    { key: 'ended', title: 'Au', render: (row) => (row.ended_at ? formatDate(row.ended_at) : <span className="font-semibold text-success">En cours</span>) },
    { key: 'reason', title: 'Motif', render: (row) => row.reason ?? '—' },
  ];
  return (
    <section aria-labelledby="historique-conducteurs" className="flex flex-col gap-2">
      <h2 id="historique-conducteurs" className="text-base font-semibold text-foreground">
        Historique des conducteurs
      </h2>
      {assignments.isError ? (
        <Card padded={false}>
          <ErrorState message={toApiError(assignments.error).message} onRetry={() => assignments.refetch()} />
        </Card>
      ) : (
        <DataTable columns={columns} data={assignments.data ?? []} getRowKey={(row) => row.id} isLoading={assignments.isPending} compact emptyTitle="Jamais affectée" emptyMessage="Cette moto n'a encore eu aucun conducteur." />
      )}
    </section>
  );
}
