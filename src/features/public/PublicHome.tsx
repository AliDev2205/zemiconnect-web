import { Info } from 'lucide-react';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import PublicSearchForm from './PublicSearchForm';

interface Props {
  defaultValue?: string;
  error?: string;
}

const STEPS = [
  {
    title: 'Scannez ou saisissez',
    text: "Scannez le QR du badge avec l'appareil photo de votre téléphone, ou saisissez le numéro ZemiConnect.",
  },
  { title: 'Comparez', text: "Comparez la photo et l'immatriculation avec le conducteur et sa moto." },
  { title: 'Regardez le statut', text: 'Le statut indique si le conducteur est actif ou suspendu.' },
];

// PU1 : accueil public. Rendu aussi par /recherche quand la recherche échoue
// pour une autre raison qu'un numéro introuvable (429, réseau).
export default function PublicHome({ defaultValue, error }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6 sm:py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-primary">ZemiConnect · Parakou</p>
        <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
          Vérifiez qu&apos;un conducteur de taxi-moto est enregistré
        </h1>
      </header>

      <Card>
        <PublicSearchForm defaultValue={defaultValue} error={error} />
      </Card>

      <section aria-labelledby="comment-verifier" className="rounded-card border border-secondary bg-secondary p-5">
        <h2 id="comment-verifier" className="flex items-center gap-2 text-base font-semibold text-primary">
          <Info size={18} aria-hidden />
          Comment vérifier
        </h2>
        <ol className="mt-4 flex flex-col gap-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
                aria-hidden
              >
                {index + 1}
              </span>
              <div className="flex flex-col gap-1.5 text-sm">
                <p className="font-semibold text-foreground">{step.title}</p>
                <p className="text-muted">{step.text}</p>
                {index === 2 && (
                  <p className="flex flex-wrap gap-2">
                    <StatusBadge status="actif" />
                    <StatusBadge status="suspendu" />
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
