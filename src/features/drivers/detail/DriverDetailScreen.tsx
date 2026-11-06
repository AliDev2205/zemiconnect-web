'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Archive, ArrowLeft, Ban, Bike, PlayCircle, ShieldCheck, Undo2 } from 'lucide-react';
import ReadOnlyBanner from '@/components/layout/ReadOnlyBanner';
import Alert from '@/components/ui/Alert';
import Button, { buttonClasses } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ComplianceBadge from '@/components/ui/ComplianceBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ErrorState from '@/components/ui/ErrorState';
import Menu from '@/components/ui/Menu';
import Skeleton from '@/components/ui/Skeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import Tabs from '@/components/ui/Tabs';
import { useArchiveDriver, useChangeDriverStatus, useDriver, useValidateDriver } from '@/hooks/queries/useDrivers';
import { toApiError } from '@/lib/api/errors';
import { missingActivationItems, missingActivationSentence } from '@/lib/drivers/activation';
import { toast } from '@/lib/toast/store';
import { formatDate } from '@/lib/utils/format';
import type { Driver } from '@/types/driver';
import DriverPhoto from '../DriverPhoto';
import { ZcNumber } from '../DriverListScreen';
import DocumentsTab from './DocumentsTab';
import HistoryTab from './HistoryTab';
import IdentityTab from './IdentityTab';
import MotorcycleTab from './MotorcycleTab';
import QrTab from './QrTab';
import { DRIVER_TABS, DriverTab } from './tabs';


interface Props {
  id: string;
  // Administration : consultation seule, aucun bouton d'écriture rendu.
  readOnly?: boolean;
  basePath: string;
  initialTab?: DriverTab;
  // Arrivée après la validation : « Télécharger le badge » mis en avant.
  justValidated?: boolean;
}

type Dialog = null | 'validate' | 'suspend' | 'reactivate' | 'archive';

// GE4 : fiche conducteur. Partagée par la gestion et l'administration (readOnly).
export default function DriverDetailScreen({ id, readOnly = false, basePath, initialTab = 'identite', justValidated }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const driver = useDriver(id);
  const [tab, setTab] = useState<DriverTab>(initialTab);

  const changeTab = (next: string) => {
    setTab(next as DriverTab);
    router.replace(`${pathname}?onglet=${next}`, { scroll: false });
  };

  if (driver.isError) {
    const notFound = toApiError(driver.error).status === 404;
    return (
      <div className="flex flex-col gap-5">
        <BackLink basePath={basePath} />
        <Card padded={false}>
          <ErrorState
            title={notFound ? 'Conducteur introuvable' : undefined}
            message={notFound ? "Ce dossier n'existe pas ou n'est plus accessible." : toApiError(driver.error).message}
            onRetry={notFound ? undefined : () => driver.refetch()}
          />
        </Card>
      </div>
    );
  }

  if (driver.isPending) return <DetailSkeleton basePath={basePath} />;

  const data = driver.data;
  // Dossier archivé : plus aucune écriture, comme en lecture seule.
  const locked = readOnly || data.status === 'archive';

  return (
    <div className="flex flex-col gap-5">
      <BackLink basePath={basePath} />
      {readOnly && <ReadOnlyBanner />}
      {data.status === 'archive' && (
        <Alert tone="info" icon={<Archive size={18} />} title="Dossier archivé">
          Archivé le {formatDate(data.archived_at)}. Le QR est révoqué et l&apos;affectation clôturée. Le dossier reste consultable.
        </Alert>
      )}

      <DriverHeader driver={data} readOnly={locked} basePath={basePath} />

      <Tabs tabs={DRIVER_TABS.map((item) => ({ ...item }))} value={tab} onChange={changeTab} ariaLabel="Sections de la fiche" />
      <div role="tabpanel">
        {tab === 'identite' && <IdentityTab driver={data} readOnly={locked} basePath={basePath} />}
        {tab === 'moto' && <MotorcycleTab driver={data} readOnly={locked} motorcyclesPath={basePath.replace(/\/conducteurs$/, '/motos')} />}
        {tab === 'documents' && <DocumentsTab driver={data} readOnly={locked} />}
        {tab === 'qr' && <QrTab driver={data} readOnly={locked} highlightBadge={justValidated} />}
        {tab === 'historique' && <HistoryTab driver={data} />}
      </div>
    </div>
  );
}

function BackLink({ basePath }: { basePath: string }) {
  return (
    <Link href={basePath} className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline">
      <ArrowLeft size={16} aria-hidden />
      Conducteurs
    </Link>
  );
}

// En-tête : photo, nom, numéro, statut (plein), conformité (contour), moto, actions.
function DriverHeader({ driver, readOnly, basePath }: { driver: Driver; readOnly: boolean; basePath: string }) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const validate = useValidateDriver(driver.id);
  const status = useChangeDriverStatus(driver.id);
  const archive = useArchiveDriver(driver.id);
  const name = `${driver.first_name} ${driver.last_name}`;
  const missing = missingActivationItems(driver);

  const close = () => {
    validate.reset();
    status.reset();
    archive.reset();
    setDialog(null);
  };
  // La modale reste ouverte sur une erreur (bandeau, saisie conservée).
  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      toast.success(message);
      setDialog(null);
    } catch {
      // Affichée dans la modale.
    }
  };

  // Action principale selon le statut.
  const primary =
    driver.status === 'en_attente' ? (
      missing.length === 0 ? (
        <Button leftIcon={<ShieldCheck size={18} />} onClick={() => setDialog('validate')}>
          Valider
        </Button>
      ) : (
        <Link href={`${basePath}/nouveau?reprendre=${driver.id}`} className={buttonClasses()}>
          <Undo2 size={18} aria-hidden />
          Reprendre le dossier
        </Link>
      )
    ) : driver.status === 'actif' ? (
      <Button variant="danger" leftIcon={<Ban size={18} />} onClick={() => setDialog('suspend')}>
        Suspendre
      </Button>
    ) : driver.status === 'suspendu' ? (
      <Button leftIcon={<PlayCircle size={18} />} onClick={() => setDialog('reactivate')}>
        Réactiver
      </Button>
    ) : null;

  return (
    <section className="flex flex-col gap-4 rounded-card border border-border bg-surface p-5 md:flex-row md:items-start md:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <DriverPhoto url={driver.photo_url} name={name} size={88} />
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{name}</h1>
          <p className="text-sm text-muted">
            N° <ZcNumber value={driver.zc_number} />
          </p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={driver.status} />
            <ComplianceBadge compliance={driver.compliance} />
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <Bike size={16} aria-hidden />
            {driver.motorcycle ? (
              <span>
                <span className="tabular font-semibold text-foreground">{driver.motorcycle.plate_number}</span> · {[driver.motorcycle.brand, driver.motorcycle.model].filter(Boolean).join(' ')}
              </span>
            ) : (
              'Aucune moto affectée'
            )}
          </p>
          {driver.status === 'en_attente' && missing.length > 0 && <p className="text-sm text-warning">{missingActivationSentence(missing)}</p>}
        </div>
      </div>

      {!readOnly && (
        <div className="flex shrink-0 items-center gap-2">
          {primary}
          <Menu items={[{ label: 'Archiver le dossier', icon: <Archive size={16} />, tone: 'danger', onSelect: () => setDialog('archive') }]} />
        </div>
      )}

      {!readOnly && (
        <>
          <ConfirmDialog
            open={dialog === 'validate'}
            onClose={close}
            title="Valider ce dossier ?"
            message="Le numéro ZemiConnect et le QR seront générés."
            confirmLabel="Valider le dossier"
            isLoading={validate.isPending}
            error={validate.error}
            onConfirm={() => run(() => validate.mutateAsync(), 'Dossier validé : numéro ZemiConnect et QR générés.')}
          />
          <ConfirmDialog
            open={dialog === 'suspend'}
            onClose={close}
            title={`Suspendre ${name} ?`}
            message="Le conducteur apparaîtra « Suspendu » aux passagers et aux agents. Sa conformité n'est pas modifiée."
            confirmLabel="Suspendre"
            tone="danger"
            requireReason
            reasonLabel="Motif de la suspension"
            isLoading={status.isPending}
            error={status.error}
            onConfirm={(reason) => run(() => status.mutateAsync({ status: 'suspendu', reason: reason! }), 'Conducteur suspendu.')}
          />
          <ConfirmDialog
            open={dialog === 'reactivate'}
            onClose={close}
            title={`Réactiver ${name} ?`}
            message="Le conducteur redeviendra « Actif » pour les passagers et les agents."
            confirmLabel="Réactiver"
            isLoading={status.isPending}
            error={status.error}
            onConfirm={() => run(() => status.mutateAsync({ status: 'actif', reason: 'Réactivation' }), 'Conducteur réactivé.')}
          />
          <ConfirmDialog
            open={dialog === 'archive'}
            onClose={close}
            title={`Archiver le dossier de ${name} ?`}
            message="Le dossier n'est pas supprimé : il reste consultable, sans modification possible."
            warning="Le QR sera révoqué et l'affectation clôturée."
            confirmLabel="Archiver"
            tone="danger"
            requireReason
            reasonLabel="Motif de l'archivage"
            isLoading={archive.isPending}
            error={archive.error}
            onConfirm={(reason) => run(() => archive.mutateAsync(reason!), 'Dossier archivé.')}
          />
        </>
      )}
    </section>
  );
}

function DetailSkeleton({ basePath }: { basePath: string }) {
  return (
    <div className="flex flex-col gap-5" role="status">
      <span className="sr-only">Chargement de la fiche…</span>
      <BackLink basePath={basePath} />
      <div className="flex gap-4 rounded-card border border-border bg-surface p-5">
        <Skeleton className="h-22 w-22" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-6 w-56" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
