'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Plus, SearchX, UserPlus, X } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import ReadOnlyBanner from '@/components/layout/ReadOnlyBanner';
import Button, { buttonClasses } from '@/components/ui/Button';
import ComplianceBadge from '@/components/ui/ComplianceBadge';
import DataTable, { Column } from '@/components/ui/DataTable';
import DateField from '@/components/ui/DateField';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { SearchInput } from '@/components/ui/Input';
import { toPaginationProps } from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import StatusBadge from '@/components/ui/StatusBadge';
import { useDrivers } from '@/hooks/queries/useDrivers';
import { toApiError } from '@/lib/api/errors';
import { formatDate } from '@/lib/utils/format';
import { COMPLIANCE_LABELS, DRIVER_STATUS_LABELS, toOptions } from '@/lib/utils/labels';
import type { ComplianceStatus, Driver, DriverFilters, DriverStatus } from '@/types/driver';
import DriverPhoto from './DriverPhoto';

export interface DriverScreenProps {
  // Espace administration : consultation seule. Aucun bouton d'écriture n'est
  // rendu (ni désactivé, ni grisé : absent).
  readOnly?: boolean;
  // Racine des liens (/gestion/conducteurs ou /administration/conducteurs).
  basePath: string;
}

// Paramètres d'URL des filtres (lien partageable, retour arrière).
const PARAMS = { search: 'q', status: 'statut', compliance: 'conformite', from: 'du', to: 'au', page: 'page' } as const;

const isStatus = (value: string | null): value is DriverStatus => !!value && value in DRIVER_STATUS_LABELS;
const isCompliance = (value: string | null): value is ComplianceStatus => !!value && value in COMPLIANCE_LABELS;

function filtersFromUrl(params: URLSearchParams): DriverFilters {
  const status = params.get(PARAMS.status);
  const compliance = params.get(PARAMS.compliance);
  return {
    search: params.get(PARAMS.search) || undefined,
    status: isStatus(status) ? status : undefined,
    compliance: isCompliance(compliance) ? compliance : undefined,
    registered_from: params.get(PARAMS.from) || undefined,
    registered_to: params.get(PARAMS.to) || undefined,
    page: Number(params.get(PARAMS.page)) || 1,
    per_page: 10,
  };
}

// GE2 : liste des conducteurs. Partagée par la gestion et l'administration (readOnly).
export default function DriverListScreen({ readOnly = false, basePath }: DriverScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = filtersFromUrl(new URLSearchParams(searchParams.toString()));
  const drivers = useDrivers(filters);
  const [search, setSearch] = useState(filters.search ?? '');

  // Met à jour l'URL ; tout changement de filtre ramène à la page 1. Un choix
  // (liste, date, puce, page) crée une entrée d'historique ; la frappe dans la
  // recherche la remplace, pour ne pas empiler une entrée par lettre.
  const update = (changes: Partial<Record<keyof typeof PARAMS, string | undefined>>, mode: 'push' | 'replace' = 'push') => {
    const next = new URLSearchParams(searchParams.toString());
    (Object.keys(changes) as (keyof typeof PARAMS)[]).forEach((key) => {
      const value = changes[key];
      if (value) next.set(PARAMS[key], value);
      else next.delete(PARAMS[key]);
    });
    if (!('page' in changes)) next.delete(PARAMS.page);
    const query = next.toString();
    router[mode](query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // Recherche : URL mise à jour après une courte pause de saisie.
  useEffect(() => {
    if ((filters.search ?? '') === search.trim()) return;
    const timer = setTimeout(() => update({ search: search.trim() || undefined }, 'replace'), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const chips: { label: string; clear: () => void }[] = [
    ...(filters.search ? [{ label: `Recherche : ${filters.search}`, clear: () => (setSearch(''), update({ search: undefined })) }] : []),
    ...(filters.status ? [{ label: `Statut : ${DRIVER_STATUS_LABELS[filters.status]}`, clear: () => update({ status: undefined }) }] : []),
    ...(filters.compliance ? [{ label: `Conformité : ${COMPLIANCE_LABELS[filters.compliance]}`, clear: () => update({ compliance: undefined }) }] : []),
    ...(filters.registered_from ? [{ label: `Depuis le ${formatDate(filters.registered_from)}`, clear: () => update({ from: undefined }) }] : []),
    ...(filters.registered_to ? [{ label: `Jusqu'au ${formatDate(filters.registered_to)}`, clear: () => update({ to: undefined }) }] : []),
  ];
  const hasFilters = chips.length > 0;
  const clearAll = () => {
    setSearch('');
    router.push(pathname, { scroll: false });
  };

  const columns: Column<Driver>[] = [
    {
      key: 'name',
      title: 'Conducteur',
      render: (driver) => (
        <span className="flex items-center gap-3">
          <DriverPhoto url={driver.photo_url} name={`${driver.first_name} ${driver.last_name}`} size={36} rounded="full" />
          <span className="font-semibold text-foreground">
            {driver.first_name} {driver.last_name}
          </span>
        </span>
      ),
    },
    { key: 'zc_number', title: 'N° ZemiConnect', render: (driver) => <ZcNumber value={driver.zc_number} /> },
    { key: 'phone', title: 'Téléphone', render: (driver) => <span className="tabular whitespace-nowrap">{driver.phone ?? '—'}</span> },
    { key: 'plate', title: 'Immatriculation', render: (driver) => <Plate value={driver.motorcycle?.plate_number} /> },
    { key: 'status', title: 'Statut', render: (driver) => <StatusBadge status={driver.status} /> },
    { key: 'compliance', title: 'Conformité', render: (driver) => <ComplianceBadge compliance={driver.compliance} /> },
    { key: 'created_at', title: 'Enregistré le', render: (driver) => <span className="tabular whitespace-nowrap">{formatDate(driver.created_at)}</span> },
  ];

  const page = drivers.data;
  // Registre vide (aucun filtre) vs aucun résultat pour les filtres choisis.
  const empty =
    hasFilters ? (
      <EmptyState
        icon={<SearchX size={24} />}
        title="Aucun conducteur ne correspond"
        message="Modifiez la recherche ou les filtres."
        action={
          <Button variant="outline" onClick={clearAll}>
            Effacer les filtres
          </Button>
        }
      />
    ) : (
      <EmptyState
        icon={<UserPlus size={24} />}
        title={readOnly ? 'Aucun conducteur enregistré' : 'Enregistrez le premier conducteur'}
        action={
          !readOnly && (
            <Link href={`${basePath}/nouveau`} className={buttonClasses()}>
              <Plus size={18} aria-hidden />
              Nouveau conducteur
            </Link>
          )
        }
      />
    );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Conducteurs"
        subtitle={page ? `${page.total} dossier${page.total > 1 ? 's' : ''}` : 'Registre des conducteurs de taxi-moto'}
        actions={
          !readOnly && (
            <Link href={`${basePath}/nouveau`} className={buttonClasses()}>
              <Plus size={18} aria-hidden />
              Nouveau conducteur
            </Link>
          )
        }
      />
      {readOnly && <ReadOnlyBanner />}

      <section aria-label="Recherche et filtres" className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          <SearchInput
            label="Rechercher"
            value={search}
            onChange={setSearch}
            placeholder="Nom, prénom, numéro, téléphone, identifiant, immatriculation"
            inputSize="md"
            className="md:col-span-2 xl:col-span-1"
          />
          <Select label="Statut" placeholder="Tous" options={toOptions(DRIVER_STATUS_LABELS)} value={filters.status ?? ''} onChange={(event) => update({ status: event.target.value || undefined })} />
          <Select label="Conformité" placeholder="Toutes" options={toOptions(COMPLIANCE_LABELS)} value={filters.compliance ?? ''} onChange={(event) => update({ compliance: event.target.value || undefined })} />
          <DateField label="Enregistré du" value={filters.registered_from ?? ''} max={filters.registered_to} onChange={(event) => update({ from: event.target.value || undefined })} />
          <DateField label="au" value={filters.registered_to ?? ''} min={filters.registered_from} onChange={(event) => update({ to: event.target.value || undefined })} />
        </div>
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2" aria-label="Filtres actifs">
            <span className="text-xs font-semibold text-muted uppercase">Filtres actifs</span>
            {chips.map((chip) => (
              <span key={chip.label} className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary py-0.5 pr-1 pl-3 text-sm text-primary">
                {chip.label}
                <button type="button" onClick={chip.clear} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white" aria-label={`Retirer le filtre ${chip.label}`}>
                  <X size={14} />
                </button>
              </span>
            ))}
            <Button variant="link" size="sm" onClick={clearAll}>
              Effacer les filtres
            </Button>
          </div>
        )}
      </section>

      {drivers.isError ? (
        <div className="rounded-card border border-border bg-surface">
          <ErrorState message={toApiError(drivers.error).message} onRetry={() => drivers.refetch()} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={page?.data ?? []}
          getRowKey={(driver) => driver.id}
          isLoading={drivers.isPending}
          pagination={toPaginationProps(page, (next) => update({ page: String(next) }))}
          onRowClick={(driver) => router.push(`${basePath}/${driver.id}`)}
          empty={empty}
          renderCard={(driver) => (
            <span className="flex items-start gap-3">
              <DriverPhoto url={driver.photo_url} name={`${driver.first_name} ${driver.last_name}`} size={44} rounded="full" />
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="font-semibold text-foreground">
                  {driver.first_name} {driver.last_name}
                </span>
                <span className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
                  <ZcNumber value={driver.zc_number} />
                  {driver.phone && <span className="tabular">{driver.phone}</span>}
                  <Plate value={driver.motorcycle?.plate_number} />
                </span>
                <span className="flex flex-wrap gap-1.5">
                  <StatusBadge status={driver.status} />
                  <ComplianceBadge compliance={driver.compliance} />
                </span>
                <span className="text-xs text-muted">Enregistré le {formatDate(driver.created_at)}</span>
              </span>
            </span>
          )}
        />
      )}
    </div>
  );
}

// Numéro attribué à la validation seulement : « En attente » avant.
export function ZcNumber({ value }: { value: string | null }) {
  return value ? <span className="tabular font-semibold whitespace-nowrap text-foreground">{value}</span> : <span className="text-muted italic">En attente</span>;
}

function Plate({ value }: { value: string | undefined }) {
  return value ? <span className="tabular rounded bg-background px-1.5 py-0.5 font-semibold whitespace-nowrap">{value}</span> : <span className="text-muted">Sans moto</span>;
}
