'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, LinkIcon, Save } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button, { buttonClasses } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/Input';
import { useResetPassword } from '@/hooks/queries/useAuth';
import { applyApiErrorsToForm, NETWORK_ERROR_MESSAGE, toApiError } from '@/lib/api/errors';
import { newPasswordSchema, NewPasswordValues } from '@/lib/validation/password';
import AuthCard from './AuthCard';
import PasswordRules from './PasswordRules';

interface Props {
  token?: string;
  email?: string;
}

const backLink = (
  <Link href="/connexion" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary hover:underline">
    <ArrowLeft size={16} aria-hidden />
    Retour à la connexion
  </Link>
);

// Erreurs propres au mot de passe saisi : reportées sur les champs. Toute autre
// erreur 4xx (jeton, email) signifie un lien expiré ou déjà utilisé.
const PASSWORD_FIELDS = ['password', 'password_confirmation'];

// AU3.
export default function ResetPasswordForm({ token, email }: Props) {
  const router = useRouter();
  const reset = useResetPassword();
  const [expired, setExpired] = useState(!token || !email);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, control, setError, formState } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', password_confirmation: '' },
  });
  const password = useWatch({ control, name: 'password' }) ?? '';

  if (expired) {
    return (
      <AuthCard title="Lien expiré ou déjà utilisé" footer={backLink}>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-card bg-neutral-soft text-neutral" aria-hidden>
            <LinkIcon size={28} />
          </span>
          <p className="text-sm text-muted">
            Ce lien de réinitialisation n&apos;est plus valable. Demandez-en un nouveau : il sera envoyé à votre email.
          </p>
          <Link href="/mot-de-passe-oublie" className={buttonClasses({ size: 'lg', fullWidth: true })}>
            Demander un nouveau lien
          </Link>
        </div>
      </AuthCard>
    );
  }

  const onSubmit = (values: NewPasswordValues) => {
    setFormError(null);
    reset.mutate(
      { token: token!, email: email!, ...values },
      {
        onSuccess: () => router.replace('/connexion?reinitialise=1'),
        onError: (error) => {
          const apiError = toApiError(error);
          if (apiError.status === null) return setFormError(NETWORK_ERROR_MESSAGE);
          if (apiError.status === 429) return setFormError('Trop de tentatives. Réessayez dans quelques minutes.');
          const fields = Object.keys(apiError.errors ?? {});
          if (apiError.status === 422 && fields.length > 0 && fields.every((field) => PASSWORD_FIELDS.includes(field))) {
            applyApiErrorsToForm(error, setError);
            return;
          }
          if (apiError.status !== null && apiError.status < 500) return setExpired(true);
          setFormError(apiError.message);
        },
      },
    );
  };

  const busy = reset.isPending || reset.isSuccess;

  return (
    <AuthCard
      title="Nouveau mot de passe"
      description={
        <>
          Choisissez le nouveau mot de passe du compte <span className="font-semibold text-foreground">{email}</span>.
        </>
      }
      footer={backLink}
    >
      {formError && <Alert tone="danger">{formError}</Alert>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={busy} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <PasswordInput
              label="Nouveau mot de passe"
              autoComplete="new-password"
              error={formState.errors.password?.message}
              {...register('password')}
            />
            <PasswordRules value={password} />
          </div>
          <PasswordInput
            label="Confirmer le nouveau mot de passe"
            autoComplete="new-password"
            error={formState.errors.password_confirmation?.message}
            {...register('password_confirmation')}
          />
          <Button type="submit" size="lg" fullWidth isLoading={busy} leftIcon={<Save size={18} />}>
            Enregistrer
          </Button>
        </fieldset>
      </form>
    </AuthCard>
  );
}
