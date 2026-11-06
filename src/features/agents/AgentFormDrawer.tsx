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
import { useCreateAgent, useUpdateAgent } from '@/hooks/queries/useAgents';
import { formErrorBanner } from '@/lib/api/errors';
import type { AgentPayload } from '@/lib/api/services/agents/agents';
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
  matricule: z.string().trim().min(1, 'Saisissez le matricule.').max(30, '30 caractères au plus.'),
  structure: z.string().trim().min(1, 'Saisissez la structure.').max(120, '120 caractères au plus.'),
});
type Input = z.input<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  // Absent : « Nouvel agent ». Présent : modification.
  agent?: User | null;
}

export default function AgentFormDrawer(props: Props) {
  return props.open ? <Content {...props} /> : null;
}

function Content({ onClose, agent }: Props) {
  const create = useCreateAgent();
  const update = useUpdateAgent(agent?.id ?? '');
  const [banner, setBanner] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<Input, unknown, AgentPayload>({
    resolver: zodResolver(schema),
    defaultValues: {
      last_name: agent?.last_name ?? '',
      first_name: agent?.first_name ?? '',
      email: agent?.email ?? '',
      phone: agent?.phone ?? '',
      matricule: agent?.matricule ?? '',
      structure: agent?.structure ?? '',
    },
  });
  const busy = create.isPending || update.isPending;
  const errors = formState.errors;

  const submit = handleSubmit(async (values) => {
    setBanner(null);
    try {
      if (agent) {
        await update.mutateAsync(values);
        toast.success('Compte de l’agent modifié.');
      } else {
        await create.mutateAsync(values);
        toast.success(`Agent créé. Un email d'invitation a été envoyé à ${values.email}.`);
      }
      onClose();
    } catch (error) {
      setBanner(formErrorBanner(error, setError));
    }
  });

  return (
    <Drawer
      open
      onClose={onClose}
      title={agent ? "Modifier l'agent" : 'Nouvel agent'}
      description={agent ? `${agent.first_name} ${agent.last_name}` : undefined}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Annuler
          </Button>
          <Button type="submit" form="agent-form" isLoading={busy}>
            {agent ? 'Enregistrer' : "Créer et envoyer l'invitation"}
          </Button>
        </>
      }
    >
      <form id="agent-form" onSubmit={submit} noValidate>
        <fieldset disabled={busy} className="flex flex-col gap-4">
          {banner && <Alert tone="danger">{banner}</Alert>}
          {!agent && (
            <Alert tone="info" icon={<Mail size={18} />}>
              Un email d&apos;invitation sera envoyé : l&apos;agent choisira son mot de passe à la première connexion.
            </Alert>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Nom" required autoComplete="off" error={errors.last_name?.message} {...register('last_name')} />
            <TextInput label="Prénom" required autoComplete="off" error={errors.first_name?.message} {...register('first_name')} />
          </div>
          <TextInput label="Email" required type="email" inputMode="email" autoComplete="off" error={errors.email?.message} {...register('email')} />
          <TextInput label="Téléphone" type="tel" inputMode="tel" autoComplete="off" helperText="Facultatif." error={errors.phone?.message} {...register('phone')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Matricule" required error={errors.matricule?.message} {...register('matricule')} />
            <TextInput label="Structure" required helperText="Police municipale, syndicat…" error={errors.structure?.message} {...register('structure')} />
          </div>
        </fieldset>
      </form>
    </Drawer>
  );
}
