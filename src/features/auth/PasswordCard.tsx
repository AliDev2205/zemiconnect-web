'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { PasswordInput } from '@/components/ui/Input';
import { useChangePassword } from '@/hooks/queries/useAuth';
import { applyApiErrorsToForm, toApiError } from '@/lib/api/errors';
import { changePasswordSchema, ChangePasswordValues } from '@/lib/validation/password';
import PasswordRules from './PasswordRules';

const EMPTY: ChangePasswordValues = { current_password: '', password: '', password_confirmation: '' };

// Carte « Mot de passe » des profils (AG5, puis gestion et administration).
// Même schéma Zod que AU3 et AU4 (lib/validation/password.ts).
export default function PasswordCard() {
  const change = useChangePassword();
  const { register, handleSubmit, control, setError, reset, formState } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY,
  });
  const password = useWatch({ control, name: 'password' }) ?? '';

  const onSubmit = (values: ChangePasswordValues) =>
    change.mutate(values, {
      onSuccess: () => reset(EMPTY),
      onError: (error) => {
        applyApiErrorsToForm(error, setError);
      },
    });

  const otherError = change.isError && toApiError(change.error).status !== 422 ? toApiError(change.error).message : null;

  return (
    <Card title="Mot de passe">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={change.isPending} className="flex flex-col gap-4">
          {otherError && <Alert tone="danger">{otherError}</Alert>}
          {change.isSuccess && <Alert tone="success">Mot de passe modifié.</Alert>}
          <PasswordInput
            label="Mot de passe actuel"
            inputSize="lg"
            autoComplete="current-password"
            error={formState.errors.current_password?.message}
            {...register('current_password')}
          />
          <div className="flex flex-col gap-2">
            <PasswordInput
              label="Nouveau mot de passe"
              inputSize="lg"
              autoComplete="new-password"
              error={formState.errors.password?.message}
              {...register('password')}
            />
            <PasswordRules value={password} />
          </div>
          <PasswordInput
            label="Confirmer le nouveau mot de passe"
            inputSize="lg"
            autoComplete="new-password"
            error={formState.errors.password_confirmation?.message}
            {...register('password_confirmation')}
          />
          <Button type="submit" variant="outline" size="lg" fullWidth isLoading={change.isPending} leftIcon={<KeyRound size={20} />}>
            Changer le mot de passe
          </Button>
        </fieldset>
      </form>
    </Card>
  );
}
