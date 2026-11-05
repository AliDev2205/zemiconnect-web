'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Hash, ShieldCheck } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { TextInput } from '@/components/ui/Input';
import { normalizeZcNumber } from '@/lib/utils/format';

// Champ obligatoire, AUCUN format imposé : le format du numéro n'est pas arrêté.
const schema = z.object({
  numero: z.string().trim().min(1, 'Saisissez le numéro ZemiConnect.'),
});

type Values = z.infer<typeof schema>;

interface Props {
  defaultValue?: string;
  // Erreur de la recherche précédente (429, réseau), rendue par /recherche.
  error?: string;
}

// PU1 : recherche exacte, sans autocomplétion ni suggestion. La recherche
// elle-même est faite par /recherche (composant serveur) : pendant la
// navigation, le bouton tourne et le champ est verrouillé.
export default function PublicSearchForm({ defaultValue = '', error }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, control, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { numero: defaultValue },
  });

  const isEmpty = !useWatch({ control, name: 'numero' })?.trim();

  const onSubmit = ({ numero }: Values) => {
    startTransition(() => {
      router.push(`/recherche?numero=${encodeURIComponent(normalizeZcNumber(numero))}`);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4" role="search">
      {error && !isPending && <Alert tone="danger">{error}</Alert>}
      <fieldset disabled={isPending} className="flex flex-col gap-4">
        <TextInput
          label="Numéro ZemiConnect"
          helperText="Le numéro figure sur le badge du conducteur."
          error={formState.errors.numero?.message}
          icon={<Hash size={18} />}
          inputSize="lg"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          enterKeyHint="search"
          className="[&_input]:text-lg [&_input]:font-semibold [&_input]:uppercase [&_input]:tabular"
          {...register('numero')}
        />
        <Button type="submit" size="lg" fullWidth isLoading={isPending} disabled={isEmpty} leftIcon={<ShieldCheck size={20} />}>
          Vérifier
        </Button>
      </fieldset>
    </form>
  );
}
