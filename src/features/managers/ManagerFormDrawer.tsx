'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Drawer from '@/components/ui/Drawer';
import { TextInput } from '@/components/ui/Input';
import { useCreateManager, useUpdateManager } from '@/hooks/queries/useManagers';
import { formErrorBanner } from '@/lib/api/errors';
import type { ManagerPayload } from '@/lib/api/services/managers/managers';
import { toast } from '@/lib/toast/store';
import type { User } from '@/types/user';

const schema = z.object({
  last_name: z.string().trim().min(1, 'Saisissez le nom.').max(80, '80 caractères au plus.'),
  first_name: z.string().trim().min(1, 'Saisissez le prénom.').max(80, '80 caractères au plus.'),
  email: z.string().trim().min(1, "Saisissez l'email.").pipe(z.email('Adresse email invalide.')),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\+?[\d\s.-]{8,20}$/.test(value), 'Numéro de téléphone invalide.')
    .transform((value) => (value === '' ? null : value)),
});
type Input = z.input<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  // Absent : « Nouveau gestionnaire ». Présent : modification.
  manager?: User | null;
}

export default function ManagerFormDrawer(props: Props) {
  return props.open ? <Content {...props} /> : null;
}

function Content({ onClose, manager }: Props) {
  const create = useCreateManager();
  const update = useUpdateManager(manager?.id ?? '');
  const [banner, setBanner] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<Input, unknown, ManagerPayload>({
    resolver: zodResolver(schema),
    defaultValues: { last_name: manager?.last_name ?? '', first_name: manager?.first_name ?? '', email: manager?.email ?? '', phone: manager?.phone ?? '' },
  });
  const busy = create.isPending || update.isPending;
  const errors = formState.errors;

  const submit = handleSubmit(async (values) => {
    setBanner(null);
    try {
      if (manager) {
        await update.mutateAsync(values);
        toast.success('Compte du gestionnaire modifié.');
      } else {
        await create.mutateAsync(values);
        toast.success(`Gestionnaire créé. Une invitation a été envoyée à ${values.email}.`);
      }
      onClose();
    } catch (error) {
      // 422 (email déjà utilisé) sous le champ ; le reste en bandeau.
      setBanner(formErrorBanner(error, setError));
    }
  });

  return (
    <Drawer
      open
      onClose={onClose}
      title={manager ? 'Modifier le gestionnaire' : 'Nouveau gestionnaire'}
      description={manager ? `${manager.first_name} ${manager.last_name}` : undefined}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Annuler
          </Button>
          <Button type="submit" form="manager-form" isLoading={busy}>
            {manager ? 'Enregistrer' : 'Créer le gestionnaire'}
          </Button>
        </>
      }
    >
      <form id="manager-form" onSubmit={submit} noValidate>
        <fieldset disabled={busy} className="flex flex-col gap-4">
          {banner && <Alert tone="danger">{banner}</Alert>}
          {!manager && (
            <Alert tone="info" icon={<Mail size={18} />}>
              Un email d&apos;invitation avec un mot de passe provisoire sera envoyé.
            </Alert>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Nom" required autoComplete="off" error={errors.last_name?.message} {...register('last_name')} />
            <TextInput label="Prénom" required autoComplete="off" error={errors.first_name?.message} {...register('first_name')} />
          </div>
          <TextInput label="Email" required type="email" inputMode="email" autoComplete="off" error={errors.email?.message} {...register('email')} />
          <TextInput label="Téléphone" type="tel" inputMode="tel" autoComplete="off" helperText="Facultatif." error={errors.phone?.message} {...register('phone')} />
        </fieldset>
      </form>
    </Drawer>
  );
}
