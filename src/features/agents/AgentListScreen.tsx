import { UserPlus } from 'lucide-react';
import PagePlaceholder from '@/components/layout/PagePlaceholder';
import ReadOnlyBanner from '@/components/layout/ReadOnlyBanner';
import { buttonClasses } from '@/components/ui/Button';

// Comptes des agents de contrôle, partagés par la gestion et l'administration (readOnly).
export default function AgentListScreen({ readOnly = false }: { readOnly?: boolean }) {
  return (
    <PagePlaceholder
      title="Agents"
      subtitle="Comptes des agents de contrôle"
      actions={
        !readOnly && (
          <span className={buttonClasses({ className: 'pointer-events-none opacity-50' })} aria-disabled>
            <UserPlus size={18} aria-hidden />
            Nouvel agent
          </span>
        )
      }
    >
      {readOnly && <ReadOnlyBanner />}
    </PagePlaceholder>
  );
}
