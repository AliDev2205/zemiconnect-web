'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@/components/ui/Alert';
import DateField from '@/components/ui/DateField';
import FileDrop from '@/components/ui/FileDrop';
import { TextInput } from '@/components/ui/Input';
import { formErrorBanner } from '@/lib/api/errors';
import type { DocumentPayload } from '@/lib/api/services/documents/documents';
import type { Document, DocumentType } from '@/types/document';

const today = () => new Date().toISOString().slice(0, 10);

// Expiration facultative, SAUF pour l'assurance. Une date absente reste absente.
export function documentSchema(type: DocumentType) {
  return z
    .object({
      number: z.string().trim().min(1, 'Saisissez le numéro.').max(80, '80 caractères au plus.'),
      issued_at: z
        .string()
        .min(1, 'Saisissez la date de délivrance.')
        .refine((value) => value <= today(), 'La date de délivrance ne peut pas être dans le futur.'),
      expires_at: type === 'assurance' ? z.string().min(1, "La date d'expiration de l'assurance est obligatoire.") : z.string(),
      file: z.instanceof(File, { message: 'Ajoutez le fichier du document.' }).nullable().refine((file) => file !== null, 'Ajoutez le fichier du document.'),
    })
    .refine((values) => !values.expires_at || values.expires_at >= values.issued_at, {
      message: "L'expiration doit suivre la délivrance.",
      path: ['expires_at'],
    });
}

type Values = { number: string; issued_at: string; expires_at: string; file: File | null };

interface Props {
  formId: string;
  type: DocumentType;
  // Document actuel, en cas de renouvellement : rien n'est pré-rempli, il sert de rappel.
  current?: Document | null;
  onSubmit: (payload: DocumentPayload) => Promise<unknown>;
  disabled?: boolean;
}

// Saisie d'un document (GE3 étapes 3 et 4, modale « Ajouter / Renouveler » de GE4).
export default function DocumentForm({ formId, type, onSubmit, disabled }: Props) {
  const [banner, setBanner] = useState<string | null>(null);
  const { register, handleSubmit, control, setError, formState } = useForm<Values>({
    resolver: zodResolver(documentSchema(type)) as never,
    defaultValues: { number: '', issued_at: '', expires_at: '', file: null },
  });
  const errors = formState.errors;

  const submit = handleSubmit(async (values) => {
    setBanner(null);
    try {
      await onSubmit({ type, number: values.number.trim(), issued_at: values.issued_at, expires_at: values.expires_at || null, file: values.file });
    } catch (error) {
      setBanner(formErrorBanner(error, setError));
    }
  });

  return (
    <form id={formId} onSubmit={submit} noValidate>
      <fieldset disabled={disabled || formState.isSubmitting} className="flex flex-col gap-4">
        {banner && <Alert tone="danger">{banner}</Alert>}
        <TextInput label="Numéro" required error={errors.number?.message} {...register('number')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <DateField label="Date de délivrance" required max={today()} error={errors.issued_at?.message} {...register('issued_at')} />
          <DateField
            label="Date d'expiration"
            required={type === 'assurance'}
            helperText={type === 'assurance' ? undefined : 'Facultative : laissez vide si le document n’expire pas.'}
            error={errors.expires_at?.message}
            {...register('expires_at')}
          />
        </div>
        <Controller
          control={control}
          name="file"
          render={({ field, fieldState }) => <FileDrop label="Fichier" required value={field.value} onChange={field.onChange} error={fieldState.error?.message} />}
        />
      </fieldset>
    </form>
  );
}
