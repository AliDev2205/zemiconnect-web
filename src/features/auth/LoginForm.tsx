'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import { PasswordInput, TextInput } from '@/components/ui/Input';
import { useLogin } from '@/hooks/queries/useAuth';
import { NETWORK_ERROR_MESSAGE, retryAfterMinutesLabel, toApiError } from '@/lib/api/errors';
import type { LoginReason } from '@/lib/auth/sessionFailure';
import AuthCard from './AuthCard';

const schema = z.object({
  email: z.string().trim().min(1, 'Saisissez votre email.').pipe(z.email('Adresse email invalide.')),
  password: z.string().min(1, 'Saisissez votre mot de passe.'),
  remember: z.boolean(),
});

type Input = z.input<typeof schema>;
type Output = z.output<typeof schema>;

// Un seul message pour des identifiants faux : on ne dit jamais lequel.
function loginErrorMessage(error: unknown): string {
  const apiError = toApiError(error);
  switch (apiError.status) {
    case 401:
    case 422:
      return 'Email ou mot de passe incorrect.';
    case 403:
      return 'Ce compte est désactivé. Contactez votre gestionnaire.';
    case 429:
      return `Trop de tentatives. Réessayez dans ${retryAfterMinutesLabel(apiError.retryAfterSeconds) ?? 'quelques minutes'}.`;
    case null:
      return NETWORK_ERROR_MESSAGE;
    default:
      return apiError.message;
  }
}

interface Props {
  retour?: string;
  // Arrivée depuis AU3 après une réinitialisation réussie.
  resetDone?: boolean;
  // Arrivée après une session perdue (handleSessionFailure).
  reason?: LoginReason;
}

// AU1. La redirection (rôle, `retour` validé, AU4) est faite par useLogin.
export default function LoginForm({ retour, resetDone, reason }: Props) {
  const login = useLogin({ retour });
  const { register, handleSubmit, formState } = useForm<Input, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: false },
  });

  // Verrouillé aussi après le succès, pendant la redirection.
  const busy = login.isPending || login.isSuccess;

  return (
    <AuthCard title="Connexion" description="Espace professionnel : agents de contrôle, gestionnaires et administrateurs.">
      {resetDone && !login.isError && (
        <Alert tone="success">Mot de passe réinitialisé. Vous pouvez vous connecter avec le nouveau.</Alert>
      )}
      {!login.isError && reason === 'desactive' && (
        <Alert tone="danger">Ce compte est désactivé. Contactez votre gestionnaire.</Alert>
      )}
      {!login.isError && reason === 'session' && (
        <Alert tone="info">Votre session a expiré. Reconnectez-vous pour reprendre là où vous étiez.</Alert>
      )}
      {login.isError && <Alert tone="danger">{loginErrorMessage(login.error)}</Alert>}

      <form onSubmit={handleSubmit((values) => login.mutate(values))} noValidate>
        <fieldset disabled={busy} className="flex flex-col gap-4">
          <TextInput
            label="Email"
            type="email"
            autoComplete="username"
            inputMode="email"
            error={formState.errors.email?.message}
            {...register('email')}
          />
          <PasswordInput
            label="Mot de passe"
            autoComplete="current-password"
            error={formState.errors.password?.message}
            {...register('password')}
          />
          <div className="flex flex-wrap items-center justify-between gap-x-4">
            <Checkbox label="Rester connecté sur cet appareil" {...register('remember')} />
            <Link href="/mot-de-passe-oublie" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <Button type="submit" size="lg" fullWidth isLoading={busy} leftIcon={<LogIn size={18} />}>
            Se connecter
          </Button>
        </fieldset>
      </form>
    </AuthCard>
  );
}
