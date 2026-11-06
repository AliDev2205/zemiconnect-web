import type { Metadata } from 'next';
import AgentHome from '@/features/agent/AgentHome';

export const metadata: Metadata = { title: 'Accueil agent' };

type SearchParams = Promise<{ q?: string | string[]; saisie?: string | string[] }>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// AG1. ?q= : recherche à modifier (depuis AG4) ; ?saisie=1 : focus sur le champ (depuis AG2).
export default async function AgentHomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return <AgentHome initialQuery={first(params.q) ?? ''} focusSearch={first(params.saisie) === '1' || !!first(params.q)} />;
}
