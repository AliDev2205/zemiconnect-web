'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScanLine, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import { TextInput } from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import { useMe } from '@/hooks/queries/useAuth';
import { normalizeZcNumber } from '@/lib/utils/format';

// Aucun format imposé : numéro ZemiConnect ou immatriculation, recherche exacte.
const schema = z.object({ q: z.string().trim().min(1, 'Saisissez un numéro ou une immatriculation.') });
type Values = z.infer<typeof schema>;

interface Props {
  // « Modifier la recherche » (AG4) : saisie précédente.
  initialQuery?: string;
  // « Saisir le numéro » depuis le scanner : focus direct sur le champ.
  focusSearch?: boolean;
}

// AG1 : accueil agent. Très gros bouton jaune vers le scanner, puis la
// recherche exacte, sans autocomplétion ni liste de résultats.
export default function AgentHome({ initialQuery = '', focusSearch }: Props) {
  const router = useRouter();
  const me = useMe();
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, control, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { q: initialQuery },
  });
  const isEmpty = !useWatch({ control, name: 'q' })?.trim();

  const onSubmit = ({ q }: Values) =>
    startTransition(() => router.push(`/agent/recherche?q=${encodeURIComponent(normalizeZcNumber(q))}`));

  return (
    <div className="flex flex-col gap-5">
      {me.data ? (
        <h1 className="text-2xl font-bold text-foreground">Bonjour {me.data.user.first_name}</h1>
      ) : (
        <Skeleton className="h-8 w-48" />
      )}

      <Link
        href="/agent/scanner"
        className="flex min-h-[45vh] flex-col items-center justify-center gap-4 rounded-card bg-accent px-4 text-foreground transition-colors hover:bg-accent-hover active:bg-accent-hover"
      >
        <ScanLine size={96} strokeWidth={1.75} aria-hidden />
        <span className="text-3xl font-bold">Scanner un QR</span>
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} noValidate role="search" id="recherche" className="rounded-card border border-border bg-surface p-4">
        <fieldset disabled={isPending} className="flex flex-col gap-3">
          <TextInput
            label="Numéro ZemiConnect ou immatriculation"
            inputSize="lg"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            enterKeyHint="search"
            autoFocus={focusSearch}
            error={formState.errors.q?.message}
            className="[&_input]:text-lg [&_input]:font-semibold [&_input]:uppercase [&_input]:tabular [&_label]:text-sm [&_label]:text-foreground"
            {...register('q')}
          />
          <Button type="submit" size="lg" fullWidth isLoading={isPending} disabled={isEmpty} leftIcon={<Search size={20} />}>
            Rechercher
          </Button>
        </fieldset>
      </form>
    </div>
  );
}
