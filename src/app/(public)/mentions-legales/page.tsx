import type { Metadata } from 'next';
import Badge from '@/components/ui/Badge';

export const metadata: Metadata = { title: 'Mentions légales' };

// Texte PROVISOIRE, sans maquette : chaque rubrique est à compléter.
const SECTIONS = [
  { title: 'Éditeur', text: "ZemiConnect est un prototype personnel, sans partenaire institutionnel. Coordonnées de l'éditeur : à compléter." },
  { title: 'Hébergement', text: "Nom et adresse de l'hébergeur : à compléter." },
  {
    title: 'Données affichées',
    text: "La page de vérification montre uniquement la photo, le nom, le numéro ZemiConnect, le statut et la moto du conducteur. Base légale, durée de conservation et destinataires : à compléter.",
  },
  { title: 'Vos droits', text: "Modalités d'accès, de rectification et d'effacement des données : à compléter." },
  { title: 'Contact', text: 'Adresse de contact : à compléter.' },
];

export default function LegalPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6 sm:py-10">
      <header className="flex flex-col items-start gap-2">
        <Badge tone="warning">À compléter</Badge>
        <h1 className="text-2xl font-bold text-foreground">Mentions légales</h1>
        <p className="text-sm text-muted">Texte provisoire, en attente de validation.</p>
      </header>
      {SECTIONS.map((section) => (
        <section key={section.title} className="flex flex-col gap-1.5">
          <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
          <p className="text-sm text-muted">{section.text}</p>
        </section>
      ))}
    </div>
  );
}
