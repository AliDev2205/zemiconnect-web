'use client';

import Link from 'next/link';
import { Lock, LogIn, QrCode, RotateCcw, ScanLine, SearchX, UserX, WifiOff } from 'lucide-react';
import Button, { buttonClasses } from '@/components/ui/Button';
import { isAccountDisabledError, toApiError } from '@/lib/api/errors';

export type AgentStateKind = 'qr_invalid' | 'not_found' | 'forbidden' | 'disabled' | 'session_expired' | 'network';

interface Props {
  kind: AgentStateKind;
  // not_found : recherche à modifier (pré-remplie sur AG1).
  query?: string;
  // forbidden : accueil de l'espace du compte connecté.
  homeHref?: string;
  // network : relance de la requête.
  onRetry?: () => void;
}

const CONTENT: Record<AgentStateKind, { Icon: typeof QrCode; title: string; text: string }> = {
  qr_invalid: { Icon: QrCode, title: 'QR non valide', text: "Ce QR n'est pas ou plus valide. Ne vous fiez pas à ce badge." },
  not_found: { Icon: SearchX, title: 'Aucun résultat', text: 'Aucun conducteur pour ce numéro ou cette immatriculation.' },
  forbidden: { Icon: Lock, title: 'Accès refusé', text: "Ce compte n'a pas accès à la consultation des conducteurs." },
  disabled: { Icon: UserX, title: 'Compte désactivé', text: 'Ce compte est désactivé. Contactez votre gestionnaire.' },
  session_expired: { Icon: LogIn, title: 'Session expirée', text: 'Reconnectez-vous : vous reviendrez ensuite sur cette fiche.' },
  network: { Icon: WifiOff, title: 'Réseau indisponible', text: 'Connexion impossible, vérifiez votre réseau.' },
};

// Type d'état à partir d'une erreur de consultation (AG3).
export function agentStateFromError(error: unknown, source: 'token' | 'search'): AgentStateKind {
  if (isAccountDisabledError(error)) return 'disabled';
  const { status } = toApiError(error);
  if (status === 404) return source === 'token' ? 'qr_invalid' : 'not_found';
  if (status === 403) return 'forbidden';
  if (status === 401) return 'session_expired';
  return 'network';
}

// AG4 : un seul composant pour tous les états de l'espace agent. Icône,
// titre, phrase et une action. QR non valide : aucun indice sur la cause.
// Compte désactivé et session expirée : handleSessionFailure redirige déjà
// vers /connexion ; l'écran ne fait que patienter, avec un lien de secours.
export default function AgentState({ kind, query, homeHref = '/agent', onRetry }: Props) {
  const { Icon, title, text } = CONTENT[kind];
  const action = 'w-full';

  return (
    <section role="alert" className="flex flex-col items-center gap-5 rounded-card border border-border bg-surface px-5 py-8 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-card bg-neutral-soft text-foreground" aria-hidden>
        <Icon size={40} />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-lg text-foreground">{text}</p>
      </div>

      {kind === 'qr_invalid' && (
        <Link href="/agent/scanner" className={buttonClasses({ variant: 'accent', size: 'lg', className: action })}>
          <ScanLine size={22} aria-hidden />
          Scanner à nouveau
        </Link>
      )}
      {kind === 'not_found' && (
        <Link
          href={query ? `/agent?q=${encodeURIComponent(query)}` : '/agent'}
          className={buttonClasses({ size: 'lg', className: action })}
        >
          Modifier la recherche
        </Link>
      )}
      {kind === 'forbidden' && (
        <Link href={homeHref} className={buttonClasses({ size: 'lg', className: action })}>
          Retour à mon espace
        </Link>
      )}
      {(kind === 'disabled' || kind === 'session_expired') && (
        <Link href="/connexion" className={buttonClasses({ size: 'lg', className: action })}>
          Se connecter
        </Link>
      )}
      {kind === 'network' && (
        <Button size="lg" className={action} leftIcon={<RotateCcw size={20} />} onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </section>
  );
}
