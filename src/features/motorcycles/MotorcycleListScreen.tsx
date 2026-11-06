'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Bike, Plus, SearchX } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import ReadOnlyBanner from '@/components/layout/ReadOnlyBanner';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import DataTable, { Column } from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { SearchInput } from '@/components/ui/Input';
import { toPaginationProps } from '@/components/ui/Pagination';
import ValidityPill from '@/components/ui/ValidityPill';
import { useMotorcycles } from '@/hooks/queries/useMotorcycles';
import { toApiError } from '@/lib/api/errors';
import { formatDate } from '@/lib/utils/format';
import type { Motorcycle } from '@/types/motorcycle';
import MotorcycleFormDrawer from './MotorcycleFormDrawer';
import MotorcycleStatusBadge from './MotorcycleStatusBadge';

export interface MotorcycleScreenProps {
  // Administration : consultation seule, aucun bouton d'écriture rendu.
  readOnly?: boolean;
  // Racine des liens (/gestion/motos ou /administration/motos).
  basePath: string;
}

// Fiches conducteur de l'espace (…/motos → …/conducteurs).
export const driversPathOf = (basePath: string) => basePath.replace(/\/motos$/, '/conducteurs');

const insuranceOf = (moto: Motorcycle) => moto.documents.find((document) => document.type === 'assurance') ?? null;

// GE5 : motos. Filtres dans l'URL (?q=&sans_conducteur=1&page=).
export default function MotorcycleListScreen({ readOnly = false, basePath }: MotorcycleScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const unassigned = searchParams.get('sans_conducteur') === '1';
  const page = Number(searchParams.get('page')) || 1;
  const motos = useMotorcycles({ search: q || undefined, unassigned: unassigned || undefined, page, per_page: 10 });
  const [search, setSearch] = useState(q);
  const [creating, setCreating] = useState(false);
  const driversPath = driversPathOf(basePath);

  const update = (changes: Record<string, string | undefined>, mode: 'push' | 'replace' = 'push') => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!('page' in changes)) next.delete('page');
    const query = next.toString();
    router[mode](query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  useEffect(() => {
    if (q === search.trim()) return;
    const timer = setTimeout(() => update({ q: search.trim() || undefined }, 'replace'), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasFilters = !!q || unassigned;
  const clearAll = () => {
    setSearch('');
    router.push(pathname, { scroll: false });
  };

  const columns: Column<Motorcycle>[] = [
    { key: 'plate', title: 'Immatriculation', render: (moto) => <span className="tabular font-semibold whitespace-nowrap text-foreground">{moto.plate_number}</span> },
    { key: 'brand', title: 'Marque', render: (moto) => moto.brand ?? '—' },
    { key: 'model', title: 'Modèle', render: (moto) => moto.model ?? '—' },
    { key: 'color', title: 'Couleur', render: (moto) => moto.color ?? '—' },
    {
      key: 'driver',
      title: 'Conducteur actuel',
      render: (moto) =>
        moto.driver_id ? (
          <Link href={`${driversPath}/${moto.driver_id}`} onClick={(event) => event.stopPropagation()} className="font-semibold text-primary hover:underline">
            {moto.driver_name}
          </Link>
        ) : (
          <span className="text-muted">Sans conducteur</span>
        ),
    },
    {
      key: 'insurance',
      title: 'Assurance',
      render: (moto) => {
        const insurance = insuranceOf(moto);
        return (
          <span className="flex flex-col items-start gap-0.5">
            <ValidityPill validity={insurance?.validity ?? 'manquant'} />
            {insurance?.expires_at && <span className="text-xs text-muted">jusqu&apos;au {formatDate(insurance.expires_at)}</span>}
          </span>
        );
      },
    },
    { key: 'status', title: 'Statut', render: (moto) => <MotorcycleStatusBadge moto={moto} /> },
  ];

  const empty = hasFilters ? (
    <EmptyState
      icon={<SearchX size={24} />}
      title="Aucune moto ne correspond"
      message="Modifiez la recherche ou le filtre."
      action={
        <Button variant="outline" onClick={clearAll}>
          Effacer les filtres
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={<Bike size={24} />}
      title={readOnly ? 'Aucune moto enregistrée' : 'Enregistrez la première moto'}
      action={
        !readOnly && (
          <Button leftIcon={<Plus size={18} />} onClick={() => setCreating(true)}>
            Nouvelle moto
          </Button>
        )
      }
    />
  );

  const data = motos.data;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Motos"
        subtitle={data ? `${data.total} moto${data.total > 1 ? 's' : ''}` : 'Motos enregistrées et leur assurance'}
        actions={
          !readOnly && (
            <Button leftIcon={<Plus size={18} />} onClick={() => setCreating(true)}>
              Nouvelle moto
            </Button>
          )
        }
      />
      {readOnly && <ReadOnlyBanner />}

      <section aria-label="Recherche et filtre" className="flex flex-wrap items-end gap-4 rounded-card border border-border bg-surface p-4">
        <SearchInput label="Rechercher" value={search} onChange={setSearch} placeholder="Immatriculation, marque, modèle, conducteur" inputSize="md" className="min-w-64 flex-1" />
        <Checkbox label="Sans conducteur" checked={unassigned} onChange={(event) => update({ sans_conducteur: event.target.checked ? '1' : undefined })} />
      </section>

      {motos.isError ? (
        <div className="rounded-card border border-border bg-surface">
          <ErrorState message={toApiError(motos.error).message} onRetry={() => motos.refetch()} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          getRowKey={(moto) => moto.id}
          isLoading={motos.isPending}
          pagination={toPaginationProps(data, (next) => update({ page: String(next) }))}
          onRowClick={(moto) => router.push(`${basePath}/${moto.id}`)}
          empty={empty}
          renderCard={(moto) => {
            const insurance = insuranceOf(moto);
            return (
              <span className="flex flex-col gap-1.5">
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className="tabular font-semibold text-foreground">{moto.plate_number}</span>
                  <MotorcycleStatusBadge moto={moto} />
                </span>
                <span className="text-sm text-muted">{[moto.brand, moto.model, moto.color].filter(Boolean).join(' · ')}</span>
                <span className="text-sm">{moto.driver_name ?? <span className="text-muted">Sans conducteur</span>}</span>
                <span className="flex items-center gap-2 text-xs text-muted">
                  Assurance <ValidityPill validity={insurance?.validity ?? 'manquant'} />
                </span>
              </span>
            );
          }}
        />
      )}

      {!readOnly && <MotorcycleFormDrawer open={creating} onClose={() => setCreating(false)} onSaved={(moto) => router.push(`${basePath}/${moto.id}`)} />}
    </div>
  );
}
