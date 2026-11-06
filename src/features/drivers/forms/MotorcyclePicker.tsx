'use client';

import { useEffect, useState } from 'react';
import { Bike, Check, Plus, X } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import ValidityPill from '@/components/ui/ValidityPill';
import { useCreateMotorcycle, useMotorcycles } from '@/hooks/queries/useMotorcycles';
import { formErrorBanner, toApiError } from '@/lib/api/errors';
import { formatDate } from '@/lib/utils/format';
import MotorcycleFields, { toMotorcyclePayload, useMotorcycleForm } from '@/features/motorcycles/MotorcycleFields';
import type { Motorcycle } from '@/types/motorcycle';

interface Props {
  selected: Motorcycle | null;
  onSelect: (moto: Motorcycle | null) => void;
  disabled?: boolean;
}

// Choix d'une moto SANS conducteur, par immatriculation, ou création d'une
// nouvelle moto (GE3 étape 3, modale « Changer de moto » de GE4).
export default function MotorcyclePicker({ selected, onSelect, disabled }: Props) {
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setTerm(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);
  const motos = useMotorcycles({ unassigned: true, search: term || undefined, per_page: 5 }, !selected && !creating);

  if (selected) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-card border border-primary bg-secondary p-4">
        <MotorcycleSummary moto={selected} />
        {!disabled && (
          <Button variant="outline" size="sm" leftIcon={<X size={14} />} onClick={() => onSelect(null)}>
            Changer
          </Button>
        )}
      </div>
    );
  }

  if (creating) return <CreateMotorcycle onCancel={() => setCreating(false)} onCreated={(moto) => (setCreating(false), onSelect(moto))} />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <SearchInput label="Immatriculation d'une moto sans conducteur" value={search} onChange={setSearch} placeholder="Ex. BB 7710 RB" inputSize="md" className="min-w-64 flex-1" />
        <Button variant="outline" leftIcon={<Plus size={16} />} onClick={() => setCreating(true)} disabled={disabled}>
          Créer une moto
        </Button>
      </div>
      {motos.isPending ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : motos.isError ? (
        <Alert tone="danger">{toApiError(motos.error).message}</Alert>
      ) : motos.data.data.length === 0 ? (
        <p className="rounded-field bg-background px-4 py-3 text-sm text-muted">
          Aucune moto sans conducteur ne correspond{term ? ` à « ${term} »` : ''}. Vous pouvez créer la moto.
        </p>
      ) : (
        <ul className="flex flex-col gap-2" aria-label="Motos sans conducteur">
          {motos.data.data.map((moto) => (
            <li key={moto.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border p-3">
              <MotorcycleSummary moto={moto} />
              <Button size="sm" leftIcon={<Check size={14} />} onClick={() => onSelect(moto)} disabled={disabled}>
                Choisir
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MotorcycleSummary({ moto }: { moto: Motorcycle }) {
  const insurance = moto.documents.find((document) => document.type === 'assurance');
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-field bg-surface text-primary" aria-hidden>
        <Bike size={20} />
      </span>
      <div className="min-w-0">
        <p className="tabular text-base font-semibold text-foreground">{moto.plate_number}</p>
        <p className="text-sm text-muted">
          {[moto.brand, moto.model, moto.color, moto.year].filter(Boolean).join(' · ') || 'Sans détail'}
          {moto.chassis_number && <span className="tabular"> · Châssis {moto.chassis_number}</span>}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
          Assurance : <ValidityPill validity={insurance?.validity ?? 'manquant'} />
          {insurance?.expires_at && <span>jusqu&apos;au {formatDate(insurance.expires_at)}</span>}
        </p>
      </div>
    </div>
  );
}

function CreateMotorcycle({ onCancel, onCreated }: { onCancel: () => void; onCreated: (moto: Motorcycle) => void }) {
  const create = useCreateMotorcycle();
  const [banner, setBanner] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useMotorcycleForm();

  // Sous-formulaire sans <form> imbriqué (il vit parfois dans un autre formulaire).
  const submit = handleSubmit(async (values) => {
    setBanner(null);
    try {
      onCreated(await create.mutateAsync(toMotorcyclePayload(values)));
    } catch (error) {
      setBanner(formErrorBanner(error, setError));
    }
  });

  return (
    <fieldset disabled={create.isPending} className="flex flex-col gap-4 rounded-card border border-border p-4">
      <legend className="px-1 text-sm font-semibold text-foreground">Nouvelle moto</legend>
      {banner && <Alert tone="danger">{banner}</Alert>}
      <MotorcycleFields register={register} errors={formState.errors} />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={submit} isLoading={create.isPending}>
          Créer la moto
        </Button>
      </div>
    </fieldset>
  );
}
