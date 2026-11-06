'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogOut, Save } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ErrorState from '@/components/ui/ErrorState';
import { TextInput } from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import PasswordCard from '@/features/auth/PasswordCard';
import { useLogout, useMe, useUpdateProfile } from '@/hooks/queries/useAuth';
import { applyApiErrorsToForm, toApiError } from '@/lib/api/errors';
import type { User } from '@/types/user';

const schema = z.object({
  first_name: z.string().trim().min(1, 'Saisissez votre prénom.').max(80, '80 caractères au plus.'),
  last_name: z.string().trim().min(1, 'Saisissez votre nom.').max(80, '80 caractères au plus.'),
  // Facultatif. Contrôle léger (chiffres, espaces, +) : le format exact reste celui de l'API.
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\+?[\d\s.-]{8,20}$/.test(value), 'Numéro de téléphone invalide.')
    .transform((value) => (value === '' ? null : value)),
});

type Input = z.input<typeof schema>;
type Output = z.output<typeof schema>;

// AG5 : une colonne. Informations, mot de passe, déconnexion.
export default function AgentProfileScreen() {
  const me = useMe();
  const logout = useLogout();

  if (me.isError) {
    return (
      <Card padded={false}>
        <ErrorState message={toApiError(me.error).message} onRetry={() => me.refetch()} />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-foreground">Mon profil</h1>
      {me.isPending ? <ProfileSkeleton /> : <ProfileForm key={me.data.user.id} user={me.data.user} />}
      <PasswordCard />
      <Button variant="outline" size="lg" fullWidth leftIcon={<LogOut size={20} />} isLoading={logout.isPending} onClick={() => logout.mutate()}>
        Se déconnecter
      </Button>
    </div>
  );
}

function ProfileForm({ user }: { user: User }) {
  const update = useUpdateProfile();
  const { register, handleSubmit, setError, formState } = useForm<Input, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: { first_name: user.first_name, last_name: user.last_name, phone: user.phone ?? '' },
  });

  const onSubmit = (values: Output) =>
    update.mutate(values, {
      onError: (error) => {
        applyApiErrorsToForm(error, setError);
      },
    });

  const otherError = update.isError && toApiError(update.error).status !== 422 ? toApiError(update.error).message : null;

  return (
    <Card title="Mes informations">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={update.isPending} className="flex flex-col gap-4">
          {otherError && <Alert tone="danger">{otherError}</Alert>}
          <TextInput label="Prénom" inputSize="lg" autoComplete="given-name" error={formState.errors.first_name?.message} {...register('first_name')} />
          <TextInput label="Nom" inputSize="lg" autoComplete="family-name" error={formState.errors.last_name?.message} {...register('last_name')} />
          <TextInput
            label="Téléphone"
            type="tel"
            inputMode="tel"
            inputSize="lg"
            autoComplete="tel"
            error={formState.errors.phone?.message}
            {...register('phone')}
          />
          <TextInput
            label="Email"
            type="email"
            inputSize="lg"
            value={user.email}
            readOnly
            helperText="L'email ne peut pas être modifié ici. Contactez votre gestionnaire."
            className="[&_input]:text-muted"
          />
          <Button type="submit" size="lg" fullWidth isLoading={update.isPending} leftIcon={<Save size={20} />}>
            Enregistrer
          </Button>
        </fieldset>
      </form>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <Card title="Mes informations">
      <div className="flex flex-col gap-4" role="status">
        <span className="sr-only">Chargement…</span>
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
        <Skeleton className="h-13 w-full" />
      </div>
    </Card>
  );
}
