import { Eye } from 'lucide-react';

// Affiché par les écrans partagés quand readOnly est vrai (espace administration).
export default function ReadOnlyBanner({ message }: { message?: string }) {
  return (
    <div role="note" className="flex items-start gap-3 rounded-field border border-border bg-secondary px-4 py-3 text-sm text-primary">
      <Eye size={18} className="mt-0.5 shrink-0" aria-hidden />
      <p>
        <span className="font-semibold">Lecture seule.</span>{' '}
        {message ?? "L'administration consulte ces données sans les modifier : les opérations sont faites par les gestionnaires."}
      </p>
    </div>
  );
}
