'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Info, Save } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ErrorState from '@/components/ui/ErrorState';
import { TextInput } from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import { useSettings, useUpdateSettings } from '@/hooks/queries/useManagers';
import { formErrorBanner, toApiError } from '@/lib/api/errors';
import type { SettingsPayload } from '@/lib/api/services/settings/settings';
import { toast } from '@/lib/toast/store';
import type { AppSettings } from '@/types/dashboard';

// Champs vides = information non renseignée : elle disparaît du profil public.
const schema = z.object({
  structure_name: z
    .string()
    .trim()
    .max(120, '120 caractères au plus.')
    .transform((value) => value || null),
  structure_contact: z
    .string()
    .trim()
    .max(120, '120 caractères au plus.')
    .transform((value) => value || null),
});
type Input = z.input<typeof schema>;

// AD5 : paramètres. Une seule carte modifiable, et la règle fixe en lecture seule.
export default function SettingsScreen() {
  const settings = useSettings();
  return (
    <div className="flex max-w-[720px] flex-col gap-5">
      <PageHeader title="Paramètres" />
      {settings.isError ? (
        <Card padded={false}>
          <ErrorState message={toApiError(settings.error).message} onRetry={() => settings.refetch()} />
        </Card>
      ) : settings.isPending ? (
        <Card title="Structure gestionnaire">
          <div className="flex flex-col gap-3" role="status">
            <span className="sr-only">Chargement…</span>
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </Card>
      ) : (
        <StructureCard settings={settings.data} />
      )}
      <Card title="Règle de conformité">
        <p className="flex items-center gap-2 text-sm text-foreground">
          <Info size={16} className="text-primary" aria-hidden />
          Seuil « Expire bientôt » : <span className="font-semibold">{settings.data?.expiry_warning_days ?? 30} jours</span> (règle fixe)
        </p>
      </Card>
    </div>
  );
}

function StructureCard({ settings }: { settings: AppSettings }) {
  const update = useUpdateSettings();
  const [banner, setBanner] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<Input, unknown, SettingsPayload>({
    resolver: zodResolver(schema),
    defaultValues: { structure_name: settings.structure_name ?? '', structure_contact: settings.structure_contact ?? '' },
  });

  const submit = handleSubmit(async (values) => {
    setBanner(null);
    try {
      await update.mutateAsync(values);
      toast.success('Paramètres enregistrés.');
    } catch (error) {
      setBanner(formErrorBanner(error, setError));
    }
  });

  return (
    <Card title="Structure gestionnaire">
      <form onSubmit={submit} noValidate>
        <fieldset disabled={update.isPending} className="flex flex-col gap-4">
          {banner && <Alert tone="danger">{banner}</Alert>}
          <Alert tone="info">Ces informations s&apos;affichent sur le profil public uniquement lorsqu&apos;elles sont renseignées.</Alert>
          <TextInput label="Nom de la structure" error={formState.errors.structure_name?.message} {...register('structure_name')} />
          <TextInput label="Contact" helperText="Téléphone ou email de la structure." error={formState.errors.structure_contact?.message} {...register('structure_contact')} />
          <Button type="submit" className="self-start" leftIcon={<Save size={16} />} isLoading={update.isPending}>
            Enregistrer
          </Button>
        </fieldset>
      </form>
    </Card>
  );
}
