import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { Ban, Building2, CheckCircle2, Clock, Eye, KeyRound, ScanLine, UserRound } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import { buttonClasses } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { DRIVER_STATUS_LABELS } from '@/lib/utils/labels';
import { formatVerifiedAt } from '@/lib/utils/format';
import type { PublicDriverProfile, PublicDriverStatus } from '@/types/driver';

interface Props {
  profile: PublicDriverProfile;
  verifiedAt: Date;
  // Lien « Accès agent » : /connexion?retour=… vers la fiche de contrôle.
  agentHref: string;
}

const BANNER: Record<PublicDriverStatus, { className: string; Icon: typeof CheckCircle2; text: string }> = {
  actif: { className: 'bg-success', Icon: CheckCircle2, text: 'Ce conducteur est enregistré et actif sur ZemiConnect.' },
  suspendu: { className: 'bg-danger', Icon: Ban, text: 'Ce conducteur est actuellement suspendu sur ZemiConnect.' },
};

// PU2 : composant serveur, aucun JavaScript client. Contient seulement ce
// qu'un passager doit voir (voir PublicDriverProfile).
export default function PublicDriverProfileView({ profile, verifiedAt, agentHref }: Props) {
  const banner = BANNER[profile.status];
  const fullName = `${profile.first_name} ${profile.last_name}`;
  const moto = profile.motorcycle;
  const motoDetails = moto ? [moto.brand, moto.color].filter(Boolean).join(' · ') : '';

  return (
    <div className="flex flex-col">
      {/* 1. Bandeau de statut, pleine largeur. */}
      <div role="status" className={clsx('text-white', banner.className)}>
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-4">
          <banner.Icon size={32} className="shrink-0" aria-hidden />
          <div>
            <p className="text-xl font-bold leading-tight">{DRIVER_STATUS_LABELS[profile.status]}</p>
            <p className="text-sm text-white/90">{banner.text}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-5">
        <Card>
          <div className="flex flex-col items-center gap-4 text-center">
            {/* 2. Photo en grand. */}
            <div className="relative h-52 w-44 overflow-hidden rounded-card border border-border bg-neutral-soft">
              {profile.photo_url ? (
                <Image
                  src={profile.photo_url}
                  alt={`Photo de ${fullName}`}
                  fill
                  sizes="176px"
                  preload
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
                  <UserRound size={48} aria-hidden />
                  <span className="text-xs">Photo non disponible</span>
                </div>
              )}
            </div>

            {/* 3 et 4. Nom, prénom, numéro. */}
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold leading-tight text-foreground">{fullName}</h1>
              <p className="text-sm text-muted">
                N° ZemiConnect <span className="tabular text-base font-semibold text-primary">{profile.zc_number}</span>
              </p>
            </div>

            {/* 5. Moto. */}
            <div className="flex w-full flex-col items-center gap-2 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Moto</p>
              {moto ? (
                <>
                  <p className="tabular rounded-field border-2 border-foreground px-5 py-2 text-3xl font-bold tracking-wider text-foreground">
                    {moto.plate_number}
                  </p>
                  {motoDetails && <p className="text-base text-foreground">{motoDetails}</p>}
                </>
              ) : (
                <p className="text-sm text-muted">Aucune moto enregistrée.</p>
              )}
            </div>
          </div>
        </Card>

        {/* 6. Consigne. */}
        <Alert tone="info" icon={<Eye size={18} />}>
          Comparez la photo et l&apos;immatriculation avec le conducteur et la moto.
        </Alert>

        {/* 7. Structure gestionnaire, seulement si elle est renseignée. */}
        {profile.managing_structure && (
          <p className="flex items-start gap-2 text-sm text-muted">
            <Building2 size={16} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              Structure gestionnaire : <span className="font-semibold text-foreground">{profile.managing_structure.name}</span>
              {profile.managing_structure.contact && <span> · {profile.managing_structure.contact}</span>}
            </span>
          </p>
        )}

        {/* 8. Heure de la vérification, heure de Cotonou. */}
        <p className="flex items-center justify-center gap-1.5 text-sm text-muted">
          <Clock size={14} aria-hidden />
          <time dateTime={verifiedAt.toISOString()}>{formatVerifiedAt(verifiedAt)}</time>
        </p>

        <Link href="/" prefetch={false} className={buttonClasses({ variant: 'outline', size: 'lg', fullWidth: true })}>
          <ScanLine size={18} aria-hidden />
          Vérifier un autre conducteur
        </Link>

        <Link
          href={agentHref}
          prefetch={false}
          className="mx-auto mt-2 inline-flex min-h-11 items-center gap-1.5 px-3 text-sm text-muted underline-offset-4 hover:text-primary hover:underline"
        >
          <KeyRound size={14} aria-hidden />
          Accès agent
        </Link>
      </div>
    </div>
  );
}
