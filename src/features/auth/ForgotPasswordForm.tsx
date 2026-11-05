'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { TextInput } from '@/components/ui/Input';
import { useForgotPassword } from '@/hooks/queries/useAuth';
import { NETWORK_ERROR_MESSAGE, toApiError } from '@/lib/api/errors';
import AuthCard from './AuthCard';

const schema = z.object({
  email: z.string().trim().min(1, 'Saisissez votre email.').pipe(z.email('Adresse email invalide.')),
});

type Input = z.input<typeof schema>;
type Output = z.output<typeof schema>;

const SENT_MESSAGE = 'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.';

// Seules ces erreurs empêchent l'envoi d'être tenté ; toute autre réponse
// (succès, 422 email inconnu…) donne le même message, pour ne rien révéler.
function blockingError(error: unknown): string | null {
  const { status } = toApiError(error);
  if (status === 429) return 'Trop de demandes. Réessayez dans quelques minutes.';
  if (status === null) return NETWORK_ERROR_MESSAGE;
  return null;
}

const backLink = (
  <Link href="/connexion" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary hover:underline">
    <ArrowLeft size={16} aria-hidden />
    Retour à la connexion
  </Link>
);

// AU2.
export default function ForgotPasswordForm() {
  const forgot = useForgotPassword();
  const { register, handleSubmit, formState } = useForm<Input, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const error = forgot.isError ? blockingError(forgot.error) : null;
  const sent = forgot.isSuccess || (forgot.isError && !error);

  if (sent) {
    return (
      <AuthCard title="Vérifiez vos emails" footer={backLink}>
        <Alert tone="success" icon={<Mail size={18} />}>
          {SENT_MESSAGE}
        </Alert>
        <p className="text-sm text-muted">Le lien est valable pour une durée limitée. Pensez à regarder dans les courriers indésirables.</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Mot de passe oublié"
      description="Saisissez l'email de votre compte. Vous recevrez un lien pour choisir un nouveau mot de passe."
      footer={backLink}
    >
      {error && <Alert tone="danger">{error}</Alert>}
      <form onSubmit={handleSubmit((values) => forgot.mutate(values))} noValidate>
        <fieldset disabled={forgot.isPending} className="flex flex-col gap-4">
          <TextInput
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            icon={<Mail size={18} />}
            error={formState.errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" size="lg" fullWidth isLoading={forgot.isPending} leftIcon={<Send size={18} />}>
            Envoyer le lien
          </Button>
        </fieldset>
      </form>
    </AuthCard>
  );
}
