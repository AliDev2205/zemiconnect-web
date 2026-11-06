import type { Metadata } from 'next';
import DriverWizard from '@/features/drivers/wizard/DriverWizard';

export const metadata: Metadata = { title: 'Nouveau conducteur' };

type SearchParams = Promise<{ reprendre?: string | string[]; etape?: string | string[] }>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// GE3. ?reprendre=<id> : reprise d'un dossier en attente ; ?etape=0..4.
export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const resumeId = first(params.reprendre);
  const etape = Number.parseInt(first(params.etape) ?? '', 10);
  // Reprise sans étape précise : la vérification, qui montre ce qui manque.
  const initialStep = Number.isNaN(etape) ? (resumeId ? 4 : 0) : etape;
  return <DriverWizard key={resumeId ?? 'nouveau'} resumeId={resumeId} initialStep={initialStep} basePath="/gestion/conducteurs" />;
}
