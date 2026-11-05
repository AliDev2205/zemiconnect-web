import PagePlaceholder from '@/components/layout/PagePlaceholder';
import ReadOnlyBanner from '@/components/layout/ReadOnlyBanner';

// Journaux (audit, consultations, connexions). L'administration voit en plus
// les connexions ; la séparation se fera par permission, pas par écran dupliqué.
export default function LogsScreen({ readOnly = false }: { readOnly?: boolean }) {
  return (
    <PagePlaceholder title="Journaux" subtitle="Journal d'audit, consultations des agents et connexions">
      {readOnly && <ReadOnlyBanner message="Les journaux ne sont jamais modifiables." />}
    </PagePlaceholder>
  );
}
