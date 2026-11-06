'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import DateField from '@/components/ui/DateField';
import FileDrop from '@/components/ui/FileDrop';
import { TextArea, TextInput } from '@/components/ui/Input';
import { useDriverDuplicates } from '@/hooks/queries/useDrivers';
import { formErrorBanner } from '@/lib/api/errors';
import { ACCEPTED_FILE_LABEL } from '@/lib/files';
import { DRIVER_STATUS_LABELS } from '@/lib/utils/labels';
import type { Driver, DriverIdentityPayload, DuplicateMatch } from '@/types/driver';

const today = () => new Date().toISOString().slice(0, 10);

export const identitySchema = z.object({
  last_name: z.string().trim().min(1, 'Saisissez le nom.').max(80, '80 caractères au plus.'),
  first_name: z.string().trim().min(1, 'Saisissez le prénom.').max(80, '80 caractères au plus.'),
  birth_date: z
    .string()
    .min(1, 'Saisissez la date de naissance.')
    .refine((value) => value <= today(), 'La date de naissance ne peut pas être dans le futur.'),
  // Contrôle léger (chiffres, espaces, +) : le format exact reste celui de l'API.
  phone: z
    .string()
    .trim()
    .min(1, 'Saisissez le téléphone.')
    .refine((value) => /^\+?[\d\s.-]{8,20}$/.test(value), 'Numéro de téléphone invalide.'),
  address: z.string().trim().min(1, "Saisissez l'adresse.").max(255, '255 caractères au plus.'),
  // Facultatif, NON unique, sans format imposé, distinct du NPI.
  driver_identifier: z
    .string()
    .trim()
    .max(80, '80 caractères au plus.')
    .transform((value) => (value === '' ? null : value)),
});

type Input = z.input<typeof identitySchema>;

export function identityDefaults(driver?: Driver | null): Input {
  return {
    last_name: driver?.last_name ?? '',
    first_name: driver?.first_name ?? '',
    birth_date: driver?.birth_date ?? '',
    phone: driver?.phone ?? '',
    address: driver?.address ?? '',
    driver_identifier: driver?.driver_identifier ?? '',
  };
}

interface Props {
  formId: string;
  driver?: Driver | null;
  // Racine des fiches, pour le lien vers un doublon.
  driversPath: string;
  onSubmit: (payload: DriverIdentityPayload, paperForm: File | null) => Promise<unknown>;
  disabled?: boolean;
}

const REASON_LABELS: Record<DuplicateMatch['reasons'][number], string> = {
  phone: 'même téléphone',
  identifier: 'même identifiant',
  name: 'mêmes nom et prénom',
};

// Identité du conducteur : étape 1 de GE3 et Drawer « Modifier » de GE4.
// Les boutons sont rendus par le parent (attribut form={formId}).
export default function IdentityForm({ formId, driver, driversPath, onSubmit, disabled }: Props) {
  const [banner, setBanner] = useState<string | null>(null);
  const [paperForm, setPaperForm] = useState<File | null>(null);
  const { register, handleSubmit, control, setError, formState } = useForm<Input, unknown, DriverIdentityPayload>({
    resolver: zodResolver(identitySchema),
    defaultValues: identityDefaults(driver),
  });

  // Doublons : sur les valeurs saisies, après une courte pause.
  const watched = useWatch({ control });
  const [probe, setProbe] = useState<Partial<DriverIdentityPayload>>({});
  useEffect(() => {
    const timer = setTimeout(
      () =>
        setProbe({
          phone: watched.phone?.trim() || undefined,
          driver_identifier: watched.driver_identifier?.trim() || undefined,
          first_name: watched.first_name?.trim() || undefined,
          last_name: watched.last_name?.trim() || undefined,
        }),
      500,
    );
    return () => clearTimeout(timer);
  }, [watched.phone, watched.driver_identifier, watched.first_name, watched.last_name]);
  const duplicates = useDriverDuplicates(probe, driver?.id);

  const submit = handleSubmit(async (values) => {
    setBanner(null);
    try {
      await onSubmit(values, paperForm);
    } catch (error) {
      setBanner(formErrorBanner(error, setError));
    }
  });

  const errors = formState.errors;

  return (
    <form id={formId} onSubmit={submit} noValidate>
      <fieldset disabled={disabled || formState.isSubmitting} className="flex flex-col gap-4">
        {banner && <Alert tone="danger">{banner}</Alert>}
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Nom" required autoComplete="family-name" error={errors.last_name?.message} {...register('last_name')} />
          <TextInput label="Prénom" required autoComplete="given-name" error={errors.first_name?.message} {...register('first_name')} />
          <DateField label="Date de naissance" required max={today()} error={errors.birth_date?.message} {...register('birth_date')} />
          <TextInput label="Téléphone" required type="tel" inputMode="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
        </div>
        <TextArea label="Adresse" required rows={2} error={errors.address?.message} {...register('address')} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Identifiant du conducteur"
            helperText="Facultatif. Ce n'est pas le NPI ; il peut être partagé par plusieurs dossiers."
            error={errors.driver_identifier?.message}
            {...register('driver_identifier')}
          />
          <FileDrop
            label="Scan de la fiche papier"
            helperText={driver?.has_paper_form ? 'Facultatif. Un scan est déjà enregistré ; un nouveau fichier le remplace.' : `Facultatif. ${ACCEPTED_FILE_LABEL}`}
            value={paperForm}
            onChange={setPaperForm}
          />
        </div>

        {duplicates.data && duplicates.data.length > 0 && (
          <Alert tone="warning" icon={<AlertTriangle size={18} />} title="Doublon possible">
            <ul className="flex flex-col gap-1">
              {duplicates.data.map((match) => (
                <li key={match.id}>
                  <Link href={`${driversPath}/${match.id}`} target="_blank" className="font-semibold text-primary underline">
                    {match.name}
                  </Link>{' '}
                  ({match.zc_number ?? 'numéro en attente'}, {DRIVER_STATUS_LABELS[match.status].toLowerCase()}) : {match.reasons.map((reason) => REASON_LABELS[reason]).join(', ')}.
                </li>
              ))}
            </ul>
            <p className="mt-1">Vérifiez avant de continuer. Cet avertissement ne bloque pas l&apos;enregistrement.</p>
          </Alert>
        )}
      </fieldset>
    </form>
  );
}
