'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bike, Repeat } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DataTable, { Column } from '@/components/ui/DataTable';
import DateField from '@/components/ui/DateField';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { TextArea } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ValidityPill from '@/components/ui/ValidityPill';
import { useAssignMotorcycle, useDriverAssignments } from '@/hooks/queries/useDrivers';
import { formErrorBanner, toApiError } from '@/lib/api/errors';
import { toast } from '@/lib/toast/store';
import { formatDate } from '@/lib/utils/format';
import type { Driver } from '@/types/driver';
import type { Assignment, Motorcycle } from '@/types/motorcycle';
import MotorcyclePicker from '../forms/MotorcyclePicker';

interface Props {
  driver: Driver;
  readOnly: boolean;
}

export default function MotorcycleTab({ driver, readOnly }: Props) {
  const [changing, setChanging] = useState(false);
  const assignments = useDriverAssignments(driver.id);
  const moto = driver.motorcycle;
  const insurance = moto?.documents.find((document) => document.type === 'assurance');

  const columns: Column<Assignment>[] = [
    { key: 'plate', title: 'Moto', render: (row) => <span className="tabular font-semibold">{row.plate_number}</span> },
    { key: 'started', title: 'Du', render: (row) => formatDate(row.started_at) },
    { key: 'ended', title: 'Au', render: (row) => (row.ended_at ? formatDate(row.ended_at) : <span className="font-semibold text-success">En cours</span>) },
    { key: 'reason', title: 'Motif', render: (row) => row.reason ?? '—' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Card
        title="Affectation en cours"
        actions={
          !readOnly && (
            <Button variant="outline" size="sm" leftIcon={<Repeat size={14} />} onClick={() => setChanging(true)}>
              {moto ? 'Changer de moto' : 'Affecter une moto'}
            </Button>
          )
        }
      >
        {moto ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <p className="tabular self-start rounded-field border-2 border-foreground px-4 py-1.5 text-2xl font-bold tracking-wider">{moto.plate_number}</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted">Depuis le</dt>
                <dd className="font-semibold">{formatDate(driver.assignment_started_at)}</dd>
                <dt className="text-muted">Marque et modèle</dt>
                <dd>{[moto.brand, moto.model].filter(Boolean).join(' ') || '—'}</dd>
                <dt className="text-muted">Couleur</dt>
                <dd>{moto.color ?? '—'}</dd>
                <dt className="text-muted">Année</dt>
                <dd>{moto.year ?? '—'}</dd>
                <dt className="text-muted">N° de châssis</dt>
                <dd className="tabular">{moto.chassis_number ?? '—'}</dd>
              </dl>
            </div>
            <section aria-labelledby="assurance-moto" className="flex flex-col gap-2 rounded-card border border-border p-4">
              <h3 id="assurance-moto" className="flex items-center justify-between gap-2 text-sm font-semibold text-foreground">
                Assurance de cette moto
                <ValidityPill validity={insurance?.validity ?? 'manquant'} />
              </h3>
              {insurance ? (
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                  <dt className="text-muted">Numéro</dt>
                  <dd className="tabular">{insurance.number ?? '—'}</dd>
                  <dt className="text-muted">Délivrée le</dt>
                  <dd>{formatDate(insurance.issued_at)}</dd>
                  <dt className="text-muted">Expire le</dt>
                  <dd>{formatDate(insurance.expires_at)}</dd>
                </dl>
              ) : (
                <p className="text-sm text-muted">Aucune assurance enregistrée. Ajoutez-la depuis l&apos;onglet Documents.</p>
              )}
            </section>
          </div>
        ) : (
          <EmptyState icon={<Bike size={24} />} title="Aucune moto affectée" message="Sans moto, l'assurance ne peut pas être fournie : le conducteur est non conforme." />
        )}
      </Card>

      <section aria-labelledby="historique-affectations" className="flex flex-col gap-2">
        <h2 id="historique-affectations" className="text-base font-semibold text-foreground">
          Historique des affectations
        </h2>
        {assignments.isError ? (
          <Card padded={false}>
            <ErrorState message={toApiError(assignments.error).message} onRetry={() => assignments.refetch()} />
          </Card>
        ) : (
          <DataTable columns={columns} data={assignments.data ?? []} getRowKey={(row) => row.id} isLoading={assignments.isPending} emptyTitle="Aucune affectation" emptyMessage="Ce conducteur n'a jamais eu de moto." compact />
        )}
      </section>

      {!readOnly && <ChangeMotorcycleModal driver={driver} open={changing} onClose={() => setChanging(false)} />}
    </div>
  );
}

const today = () => new Date().toISOString().slice(0, 10);

const changeSchema = z.object({
  started_at: z.string().min(1, 'Saisissez la date de début.').refine((value) => value <= today(), 'La date ne peut pas être dans le futur.'),
  reason: z.string().trim().min(5, 'Le motif doit contenir au moins 5 caractères.'),
});
type ChangeValues = z.infer<typeof changeSchema>;

// Changer de moto : moto sans conducteur (ou créée), date, motif. L'affectation
// actuelle est clôturée. Erreurs : bandeau en haut, saisie conservée.
function ChangeMotorcycleModal({ driver, open, onClose }: { driver: Driver; open: boolean; onClose: () => void }) {
  const assign = useAssignMotorcycle(driver.id);
  const [picked, setPicked] = useState<Motorcycle | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const { register, handleSubmit, setError, reset, formState } = useForm<ChangeValues>({
    resolver: zodResolver(changeSchema),
    defaultValues: { started_at: today(), reason: '' },
  });

  const close = () => {
    reset({ started_at: today(), reason: '' });
    setPicked(null);
    setBanner(null);
    setPickError(null);
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    setBanner(null);
    if (!picked) return setPickError('Choisissez ou créez une moto.');
    try {
      await assign.mutateAsync({ motorcycle_id: picked.id, ...values });
      toast.success(`Moto ${picked.plate_number} affectée.`);
      close();
    } catch (error) {
      const fieldError = toApiError(error).errors?.motorcycle_id?.[0];
      if (fieldError) setPickError(fieldError);
      else setBanner(formErrorBanner(error, setError));
    }
  });

  return (
    <Modal
      open={open}
      onClose={close}
      title={driver.motorcycle ? 'Changer de moto' : 'Affecter une moto'}
      description={`${driver.first_name} ${driver.last_name}`}
      size="lg"
      dismissible={!assign.isPending}
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={assign.isPending}>
            Annuler
          </Button>
          <Button onClick={submit} isLoading={assign.isPending}>
            Confirmer le changement
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {banner && <Alert tone="danger">{banner}</Alert>}
        {driver.motorcycle && (
          <Alert tone="warning">
            L&apos;affectation actuelle sera clôturée (<span className="tabular font-semibold">{driver.motorcycle.plate_number}</span>). Le QR et le badge restent inchangés.
          </Alert>
        )}
        <div className="flex flex-col gap-1">
          <MotorcyclePicker selected={picked} onSelect={(moto) => (setPicked(moto), setPickError(null))} disabled={assign.isPending} />
          {pickError && (
            <p role="alert" className="text-xs text-danger">
              {pickError}
            </p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
          <DateField label="Date de début" required max={today()} error={formState.errors.started_at?.message} {...register('started_at')} />
          <TextArea label="Motif du changement" required rows={2} error={formState.errors.reason?.message} {...register('reason')} />
        </div>
      </form>
    </Modal>
  );
}
