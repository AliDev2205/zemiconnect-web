'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bike, Clock, FileText, Phone, ScanLine, UserRound } from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';
import ComplianceBadge from '@/components/ui/ComplianceBadge';
import Skeleton from '@/components/ui/Skeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import ValidityPill from '@/components/ui/ValidityPill';
import { useMe } from '@/hooks/queries/useAuth';
import { useControlByToken, useControlSearch } from '@/hooks/queries/useControls';
import { getHomeRouteForRole } from '@/lib/constants';
import { formatBeninDateTime, formatDate } from '@/lib/utils/format';
import { DOCUMENT_TYPE_LABELS } from '@/lib/utils/labels';
import type { ControlDocument, DriverControl } from '@/types/control';
import AgentState, { agentStateFromError } from './AgentState';
import { buildVerdictSentence, DOCUMENT_ORDER, documentLine } from './verdict';

type Source = { kind: 'token'; token: string } | { kind: 'search'; query: string };

const MOTORCYCLE_DOC_LABEL = 'Assurance de la moto';

// AG3 : fiche de consultation (« résultat du contrôle »). Une source : jeton
// QR (/agent/conducteur/[token]) ou recherche exacte (/agent/recherche?q=).
export default function DriverControlScreen({ source }: { source: Source }) {
  const byToken = useControlByToken(source.kind === 'token' ? source.token : '');
  const bySearch = useControlSearch(source.kind === 'search' ? source.query : '');
  const query = source.kind === 'token' ? byToken : bySearch;
  const me = useMe();

  if (query.isError) {
    return (
      <AgentState
        kind={agentStateFromError(query.error, source.kind)}
        query={source.kind === 'search' ? source.query : undefined}
        homeHref={me.data ? getHomeRouteForRole(me.data.user.role) : '/connexion'}
        onRetry={() => query.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-28">
      {query.isPending ? <ControlSkeleton /> : <ControlContent control={query.data} />}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-md">
          <Link href="/agent/scanner" className={buttonClasses({ variant: 'accent', size: 'lg', fullWidth: true, className: 'whitespace-nowrap text-[17px]' })}>
            <ScanLine size={24} aria-hidden />
            Scanner un autre conducteur
          </Link>
        </div>
      </div>
    </div>
  );
}

function ControlContent({ control }: { control: DriverControl }) {
  const fullName = `${control.first_name} ${control.last_name}`;
  const moto = control.motorcycle;

  return (
    <>
      {/* Bloc verdict : statut (plein) et conformité (contour) côte à côte. */}
      <section aria-labelledby="verdict" className="flex flex-col gap-3 rounded-card border-2 border-foreground/15 bg-surface p-4">
        <h2 id="verdict" className="text-sm font-semibold uppercase tracking-wide text-muted">
          Résultat du contrôle
        </h2>
        {/* Côte à côte même à 360 px ; passage à la ligne seulement si la police système est agrandie. */}
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge status={control.status} size="lg" />
          <ComplianceBadge compliance={control.compliance} size="lg" />
        </div>
        <p className="text-lg font-semibold leading-snug text-foreground">{buildVerdictSentence(control)}</p>
      </section>

      {/* Identité. */}
      <section aria-labelledby="identite" className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4">
        <div className="flex items-center gap-4">
          <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-field border border-border bg-neutral-soft">
            {control.photo_url ? (
              <Image src={control.photo_url} alt={`Photo de ${fullName}`} fill sizes="96px" preload className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted" aria-label="Photo non disponible" role="img">
                <UserRound size={40} aria-hidden />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 id="identite" className="text-2xl font-bold leading-tight text-foreground">
              {fullName}
            </h1>
            <p className="mt-1 text-base text-muted">
              N° <span className="tabular text-lg font-semibold text-foreground">{control.zc_number}</span>
            </p>
          </div>
        </div>
        <dl className="flex flex-col divide-y divide-border border-t border-border text-base">
          <Row label="Téléphone">
            {control.phone ? (
              <a
                href={`tel:${control.phone.replace(/[^\d+]/g, '')}`}
                className="inline-flex min-h-12 items-center gap-2 font-semibold text-primary underline underline-offset-4"
              >
                <Phone size={18} aria-hidden />
                {control.phone}
              </a>
            ) : (
              <Missing />
            )}
          </Row>
          <Row label="Adresse">{control.address ?? <Missing />}</Row>
          <Row label="Date de naissance">{control.birth_date ? formatDate(control.birth_date) : <Missing />}</Row>
          {control.driver_identifier && (
            <Row label="Identifiant">
              <span className="tabular">{control.driver_identifier}</span>
            </Row>
          )}
        </dl>
      </section>

      {/* Moto actuelle. */}
      <section aria-labelledby="moto" className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
        <h2 id="moto" className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Bike size={20} aria-hidden />
          Moto actuelle
        </h2>
        {moto ? (
          <>
            <p className="tabular self-start rounded-field border-2 border-foreground px-4 py-1.5 text-3xl font-bold tracking-wider text-foreground">
              {moto.plate_number}
            </p>
            <dl className="flex flex-col divide-y divide-border text-base">
              <Row label="Marque et modèle">{[moto.brand, moto.model].filter(Boolean).join(' ') || <Missing />}</Row>
              <Row label="Couleur">{moto.color ?? <Missing />}</Row>
              <Row label="Année">{moto.year ?? <Missing />}</Row>
              <Row label="N° de châssis">{moto.chassis_number ? <span className="tabular break-all">{moto.chassis_number}</span> : <Missing />}</Row>
            </dl>
          </>
        ) : (
          <p className="text-lg font-semibold text-foreground">Aucune moto affectée</p>
        )}
      </section>

      {/* Documents, en texte uniquement : aucun lien ni aperçu de fichier. */}
      <section aria-labelledby="documents" className="flex flex-col gap-1 rounded-card border border-border bg-surface p-4">
        <h2 id="documents" className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <FileText size={20} aria-hidden />
          Documents
        </h2>
        <ul className="flex flex-col divide-y divide-border">
          {DOCUMENT_ORDER.map((type) => (
            <DocumentRow key={type} document={documentLine(control, type)} />
          ))}
        </ul>
      </section>

      <p className="flex items-center justify-center gap-1.5 text-center text-base text-muted">
        <Clock size={16} aria-hidden />
        <time dateTime={control.consulted_at}>Consultation enregistrée {formatBeninDateTime(new Date(control.consulted_at))}</time>
      </p>
    </>
  );
}

function DocumentRow({ document }: { document: ControlDocument }) {
  const label = document.type === 'assurance' ? MOTORCYCLE_DOC_LABEL : DOCUMENT_TYPE_LABELS[document.type];
  const missing = document.validity === 'manquant';
  return (
    <li className="flex flex-col gap-1.5 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-semibold text-foreground">{label}</p>
        <ValidityPill validity={document.validity} className="text-sm!" />
      </div>
      {!missing && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-base">
          <dt className="text-muted">Numéro</dt>
          <dd className="tabular text-foreground">{document.number ?? '—'}</dd>
          <dt className="text-muted">Délivré le</dt>
          <dd className="text-foreground">{formatDate(document.issued_at)}</dd>
          <dt className="text-muted">Expire le</dt>
          <dd className="text-foreground">{document.expires_at ? formatDate(document.expires_at) : 'Sans date d’expiration'}</dd>
        </dl>
      )}
    </li>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-12 flex-wrap items-center justify-between gap-x-3 gap-y-0.5 py-2">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold text-foreground">{children}</dd>
    </div>
  );
}

function Missing() {
  return <span className="font-normal text-muted">Non renseigné</span>;
}

// Squelette : le bloc verdict d'abord (ce que l'agent attend), puis le reste.
function ControlSkeleton() {
  return (
    <div className="flex flex-col gap-4" role="status">
      <span className="sr-only">Chargement de la fiche…</span>
      <div className="flex flex-col gap-3 rounded-card border-2 border-border bg-surface p-4">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-12 w-28" />
          <Skeleton className="h-12 w-36" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 opacity-70">
        <div className="flex items-center gap-4">
          <Skeleton className="h-28 w-24" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 opacity-50">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
