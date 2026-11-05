'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogOut, Save } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/ui/ErrorState';
import { PasswordInput } from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import { useChangePassword, useLogout, useMe } from '@/hooks/queries/useAuth';
import { applyApiErrorsToForm, toApiError } from '@/lib/api/errors';
import { getHomeRouteForRole } from '@/lib/constants';
import { changePasswordSchema, ChangePasswordValues } from '@/lib/validation/password';
import AuthCard from './AuthCard';
import PasswordRules from './PasswordRules';

// AU4 : changement obligatoire du mot de passe provisoire. Tant qu'il n'est pas
// fait, proxy.ts et AuthGuard ramènent ici (confort) et l'API refuse le reste ;
// seule la déconnexion reste proposée.
export default function ChangePasswordForm() {
  const router = useRouter();
  const me = useMe();
  const change = useChangePassword();
  const logout = useLogout();
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, control, setError, formState } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  });
  const password = useWatch({ control, name: 'password' }) ?? '';

  const role = me.data?.user.role;
  const required = me.data?.user.must_change_password;

  // Rien à changer (ou c'est fait) : direction l'espace du rôle.
  useEffect(() => {
    if (role && required === false) router.replace(getHomeRouteForRole(role));
  }, [role, required, router]);

  if (me.isError) {
    // 401 : l'intercepteur axios redirige déjà vers /connexion.
    if (toApiError(me.error).status === 401) return <FormSkeleton />;
    return (
      <AuthCard title="Changez votre mot de passe provisoire">
        <ErrorState message={toApiError(me.error).message} onRetry={() => me.refetch()} className="py-4" />
      </AuthCard>
    );
  }

  if (me.isPending || !required) return <FormSkeleton />;

  const onSubmit = (values: ChangePasswordValues) => {
    setFormError(null);
    change.mutate(values, {
      onSuccess: () => router.replace(getHomeRouteForRole(me.data.user.role)),
      onError: (error) => {
        if (!applyApiErrorsToForm(error, setError)) setFormError(toApiError(error).message);
      },
    });
  };

  const busy = change.isPending || change.isSuccess;

  return (
    <AuthCard
      title="Changez votre mot de passe provisoire"
      description="Pour sécuriser votre compte, remplacez le mot de passe provisoire reçu avant d'accéder à votre espace."
      footer={
        <Button variant="ghost" leftIcon={<LogOut size={16} />} isLoading={logout.isPending} onClick={() => logout.mutate()}>
          Se déconnecter
        </Button>
      }
    >
      {formError && <Alert tone="danger">{formError}</Alert>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={busy} className="flex flex-col gap-4">
          <PasswordInput
            label="Mot de passe provisoire"
            autoComplete="current-password"
            error={formState.errors.current_password?.message}
            {...register('current_password')}
          />
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
            Enregistrer et continuer
          </Button>
        </fieldset>
      </form>
    </AuthCard>
  );
}

function FormSkeleton() {
  return (
    <section className="flex flex-col gap-5 rounded-card border border-border bg-surface p-5 sm:p-8" role="status">
      <span className="sr-only">Chargement…</span>
      <Skeleton className="h-7 w-3/4" />
      <Skeleton className="h-4 w-full" />
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-11 w-full" />
        </div>
      ))}
      <Skeleton className="h-13 w-full" />
    </section>
  );
}
