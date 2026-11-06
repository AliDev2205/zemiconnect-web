'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, Pencil, Save, ShieldCheck } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Alert from '@/components/ui/Alert';
import Button, { buttonClasses } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ComplianceBadge from '@/components/ui/ComplianceBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import Stepper from '@/components/ui/Stepper';
import ValidityPill from '@/components/ui/ValidityPill';
import { useUploadDocument } from '@/hooks/queries/useDocuments';
import { useAssignMotorcycle, useCreateDriver, useDriver, useUpdateDriver, useValidateDriver } from '@/hooks/queries/useDrivers';
import { toApiError } from '@/lib/api/errors';
import { ACTIVATION_ITEMS, activationChecklist, missingActivationItems, missingActivationSentence } from '@/lib/drivers/activation';
import { toast } from '@/lib/toast/store';
import { formatDate } from '@/lib/utils/format';
import { DOCUMENT_FULL_LABELS } from '@/lib/utils/labels';
import type { Document, DocumentType } from '@/types/document';
import type { Driver } from '@/types/driver';
import type { Motorcycle } from '@/types/motorcycle';
import DriverPhoto from '../DriverPhoto';
import DocumentForm from '../forms/DocumentForm';
import IdentityForm from '../forms/IdentityForm';
import MotorcyclePicker from '../forms/MotorcyclePicker';
import PhotoEditor from '../photo/PhotoEditor';

const STEPS = ['Identité', 'Photo', 'Moto et assurance', 'Documents', 'Vérification'] as const;

interface Props {
  // Dossier en attente repris (?reprendre=<id>).
  resumeId?: string;
  initialStep?: number;
  basePath: string;
}

// GE3 : nouveau conducteur en 5 étapes. Le dossier est créé EN ATTENTE à la
// fin de l'étape Identité ; chaque étape enregistre sa partie, on peut donc
// revenir en arrière ou reprendre plus tard sans rien perdre.
export default function DriverWizard({ resumeId, initialStep = 0, basePath }: Props) {
  const router = useRouter();
  const [driverId, setDriverId] = useState<string | undefined>(resumeId);
  const [step, setStep] = useState(resumeId ? Math.min(Math.max(initialStep, 0), 4) : 0);
  const driver = useDriver(driverId);

  // Un dossier DÉJÀ validé ou archivé à l'ouverture ne se reprend pas ici :
  // direction sa fiche. Vérifié une seule fois, au premier chargement : la
  // validation faite dans l'assistant mène elle-même à l'onglet QR.
  const checkedRef = useRef(false);
  useEffect(() => {
    if (!driver.data || checkedRef.current) return;
    checkedRef.current = true;
    if (driver.data.status !== 'en_attente') router.replace(`${basePath}/${driver.data.id}`);
  }, [driver.data, router, basePath]);

  const go = (next: number) => {
    setStep(next);
    if (driverId) router.replace(`${basePath}/nouveau?reprendre=${driverId}&etape=${next}`, { scroll: false });
    window.scrollTo?.({ top: 0 });
  };

  if (driverId && driver.isError) {
    return (
      <Card padded={false}>
        <ErrorState message={toApiError(driver.error).message} onRetry={() => driver.refetch()} />
      </Card>
    );
  }

  const data = driver.data;
  const loading = !!driverId && driver.isPending;
  const checklist = data ? activationChecklist(data) : null;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={data ? `Dossier de ${data.first_name} ${data.last_name}` : 'Nouveau conducteur'}
        subtitle={data ? 'En attente : le dossier peut être repris plus tard.' : 'Le dossier est créé en attente dès la fin de cette étape.'}
        back={{ href: basePath, label: 'Conducteurs' }}
      />
      <Stepper
        steps={STEPS.map((label, index) => ({
          label,
          done: index === 0 ? !!data : index === 1 ? !!checklist?.photo : index === 2 ? !!checklist?.moto : index === 3 ? !!(checklist?.piece_identite && checklist.permis) : false,
        }))}
        current={step}
        maxReachable={driverId ? 4 : 0}
        onSelect={go}
      />

      {loading ? (
        <Card>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </Card>
      ) : step === 0 ? (
        <IdentityStep
          driver={data ?? null}
          basePath={basePath}
          onDone={(id) => {
            setDriverId(id);
            setStep(1);
            router.replace(`${basePath}/nouveau?reprendre=${id}&etape=1`, { scroll: false });
          }}
        />
      ) : data ? (
        <>
          {step === 1 && <PhotoStep driver={data} onBack={() => go(0)} onNext={() => go(2)} />}
          {step === 2 && <MotorcycleStep driver={data} onBack={() => go(1)} onNext={() => go(3)} />}
          {step === 3 && <DocumentsStep driver={data} onBack={() => go(2)} onNext={() => go(4)} />}
          {step === 4 && <ReviewStep driver={data} basePath={basePath} onBack={() => go(3)} onEdit={go} />}
        </>
      ) : null}
    </div>
  );
}

function StepFooter({ onBack, children }: { onBack?: () => void; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      {onBack ? (
        <Button variant="outline" leftIcon={<ArrowLeft size={16} />} onClick={onBack}>
          Étape précédente
        </Button>
      ) : (
        <span />
      )}
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function IdentityStep({ driver, basePath, onDone }: { driver: Driver | null; basePath: string; onDone: (id: string) => void }) {
  const create = useCreateDriver();
  const update = useUpdateDriver(driver?.id ?? '');
  const busy = create.isPending || update.isPending;
  return (
    <Card title="Identité" subtitle="Nom, prénom, date de naissance, téléphone et adresse sont obligatoires.">
      <div className="flex flex-col gap-5">
        <IdentityForm
          formId="wizard-identity"
          driver={driver}
          driversPath={basePath}
          disabled={busy}
          onSubmit={async (payload, paperForm) => {
            const saved = driver ? await update.mutateAsync({ payload, paperForm }) : await create.mutateAsync({ payload, paperForm });
            if (!driver) toast.success('Dossier créé en attente.');
            onDone(saved.id);
          }}
        />
        <StepFooter>
          <Link href={basePath} className={buttonClasses({ variant: 'outline' })}>
            Annuler
          </Link>
          <Button type="submit" form="wizard-identity" rightIcon={<ArrowRight size={16} />} isLoading={busy}>
            Enregistrer et continuer
          </Button>
        </StepFooter>
      </div>
    </Card>
  );
}

function PhotoStep({ driver, onBack, onNext }: { driver: Driver; onBack: () => void; onNext: () => void }) {
  return (
    <Card title="Photo" subtitle="Photo de face, sans lunettes de soleil ni casque. Elle figure sur le badge.">
      <div className="flex flex-col gap-5">
        <PhotoEditor driverId={driver.id} name={`${driver.first_name} ${driver.last_name}`} currentUrl={driver.photo_url} onSaved={() => toast.success('Photo enregistrée.')} />
        <StepFooter onBack={onBack}>
          <Button rightIcon={<ArrowRight size={16} />} onClick={onNext}>
            Continuer
          </Button>
        </StepFooter>
      </div>
    </Card>
  );
}

function MotorcycleStep({ driver, onBack, onNext }: { driver: Driver; onBack: () => void; onNext: () => void }) {
  const assign = useAssignMotorcycle(driver.id);
  const [error, setError] = useState<string | null>(null);
  const [editingInsurance, setEditingInsurance] = useState(false);
  const moto = driver.motorcycle;
  const insurance = moto?.documents.find((document) => document.type === 'assurance') ?? null;
  const uploadInsurance = useUploadDocument({ type: 'motorcycle', id: moto?.id ?? '' });

  const choose = async (picked: Motorcycle | null) => {
    setError(null);
    if (!picked || picked.id === moto?.id) return;
    try {
      await assign.mutateAsync({ motorcycle_id: picked.id });
      toast.success(`Moto ${picked.plate_number} affectée.`);
    } catch (cause) {
      // Notamment « Cette moto est déjà affectée à un autre conducteur ».
      setError(toApiError(cause).errors?.motorcycle_id?.[0] ?? toApiError(cause).message);
    }
  };

  return (
    <Card title="Moto et assurance" subtitle="Choisissez une moto sans conducteur, ou créez-la. L'assurance est facultative à ce stade.">
      <div className="flex flex-col gap-5">
        {error && <Alert tone="danger">{error}</Alert>}
        <MotorcyclePicker selected={moto} onSelect={choose} disabled={assign.isPending} />

        {moto && (
          <section aria-labelledby="assurance" className="flex flex-col gap-3 border-t border-border pt-4">
            <h3 id="assurance" className="text-base font-semibold text-foreground">
              Assurance de la moto <span className="text-sm font-normal text-muted">(facultative)</span>
            </h3>
            {insurance && !editingInsurance ? (
              <DocumentSummary document={insurance} onReplace={() => setEditingInsurance(true)} />
            ) : editingInsurance || !insurance ? (
              editingInsurance ? (
                <div className="flex flex-col gap-3">
                  <DocumentForm
                    formId="wizard-insurance"
                    type="assurance"
                    onSubmit={async (payload) => {
                      await uploadInsurance.mutateAsync(payload);
                      toast.success('Assurance enregistrée.');
                      setEditingInsurance(false);
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditingInsurance(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" form="wizard-insurance" isLoading={uploadInsurance.isPending}>
                      Enregistrer l&apos;assurance
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" className="self-start" onClick={() => setEditingInsurance(true)}>
                  Saisir l&apos;assurance
                </Button>
              )
            ) : null}
          </section>
        )}

        <StepFooter onBack={onBack}>
          <Button rightIcon={<ArrowRight size={16} />} onClick={onNext}>
            Continuer
          </Button>
        </StepFooter>
      </div>
    </Card>
  );
}

const DRIVER_DOCUMENTS: { type: DocumentType; optional?: boolean }[] = [{ type: 'piece_identite' }, { type: 'permis' }, { type: 'droit_taxi', optional: true }];

function DocumentsStep({ driver, onBack, onNext }: { driver: Driver; onBack: () => void; onNext: () => void }) {
  return (
    <Card title="Documents" subtitle="Pièce d'identité et permis sont exigés pour valider le dossier. Le droit de taxi est facultatif.">
      <div className="flex flex-col gap-5">
        {DRIVER_DOCUMENTS.map(({ type, optional }) => (
          <DriverDocumentBlock key={type} driver={driver} type={type} optional={optional} />
        ))}
        <StepFooter onBack={onBack}>
          <Button rightIcon={<ArrowRight size={16} />} onClick={onNext}>
            Continuer
          </Button>
        </StepFooter>
      </div>
    </Card>
  );
}

function DriverDocumentBlock({ driver, type, optional }: { driver: Driver; type: DocumentType; optional?: boolean }) {
  const upload = useUploadDocument({ type: 'driver', id: driver.id });
  const current = driver.documents.find((document) => document.type === type) ?? null;
  const [editing, setEditing] = useState(!current);
  const formId = `wizard-doc-${type}`;
  return (
    <section aria-labelledby={`${formId}-title`} className="flex flex-col gap-3 rounded-card border border-border p-4">
      <h3 id={`${formId}-title`} className="text-base font-semibold text-foreground">
        {DOCUMENT_FULL_LABELS[type]} {optional && <span className="text-sm font-normal text-muted">(facultatif)</span>}
      </h3>
      {current && !editing ? (
        <DocumentSummary document={current} onReplace={() => setEditing(true)} />
      ) : (
        <>
          <DocumentForm
            formId={formId}
            type={type}
            onSubmit={async (payload) => {
              await upload.mutateAsync(payload);
              toast.success(`${DOCUMENT_FULL_LABELS[type]} enregistré${type === 'piece_identite' ? 'e' : ''}.`);
              setEditing(false);
            }}
          />
          <div className="flex justify-end gap-2">
            {current && (
              <Button variant="outline" onClick={() => setEditing(false)}>
                Annuler
              </Button>
            )}
            <Button type="submit" form={formId} isLoading={upload.isPending}>
              Enregistrer
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

function DocumentSummary({ document, onReplace }: { document: Document; onReplace?: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-field bg-background px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="tabular font-semibold text-foreground">{document.number ?? '—'}</span>
        <span className="text-muted">Délivré le {formatDate(document.issued_at)}</span>
        <span className="text-muted">{document.expires_at ? `Expire le ${formatDate(document.expires_at)}` : 'Sans date d’expiration'}</span>
        <ValidityPill validity={document.validity} />
      </div>
      {onReplace && (
        <Button variant="link" size="sm" onClick={onReplace}>
          Remplacer
        </Button>
      )}
    </div>
  );
}

const STEP_OF_ITEM = { photo: 1, moto: 2, piece_identite: 3, permis: 3 } as const;

function ReviewStep({ driver, basePath, onBack, onEdit }: { driver: Driver; basePath: string; onBack: () => void; onEdit: (step: number) => void }) {
  const router = useRouter();
  const validate = useValidateDriver(driver.id);
  const [confirming, setConfirming] = useState(false);
  const checklist = activationChecklist(driver);
  const missing = missingActivationItems(driver);
  const insurance = driver.motorcycle?.documents.find((document) => document.type === 'assurance');
  const complianceLines: { type: DocumentType; document: Document | undefined }[] = [
    { type: 'permis', document: driver.documents.find((document) => document.type === 'permis') },
    { type: 'droit_taxi', document: driver.documents.find((document) => document.type === 'droit_taxi') },
    { type: 'assurance', document: insurance },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <Card title="Récapitulatif">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start gap-4">
            <DriverPhoto url={driver.photo_url} name={`${driver.first_name} ${driver.last_name}`} size={96} />
            <dl className="grid flex-1 grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted">Nom et prénom</dt>
              <dd className="font-semibold text-foreground">
                {driver.last_name} {driver.first_name}
              </dd>
              <dt className="text-muted">Naissance</dt>
              <dd>{formatDate(driver.birth_date)}</dd>
              <dt className="text-muted">Téléphone</dt>
              <dd className="tabular">{driver.phone ?? '—'}</dd>
              <dt className="text-muted">Adresse</dt>
              <dd>{driver.address ?? '—'}</dd>
              <dt className="text-muted">Identifiant</dt>
              <dd>{driver.driver_identifier ?? '—'}</dd>
              <dt className="text-muted">Moto</dt>
              <dd className="tabular">{driver.motorcycle?.plate_number ?? 'Aucune'}</dd>
            </dl>
            <Button variant="link" size="sm" leftIcon={<Pencil size={14} />} onClick={() => onEdit(0)}>
              Modifier
            </Button>
          </div>

          <section aria-labelledby="apercu-conformite" className="flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 id="apercu-conformite" className="text-base font-semibold text-foreground">
                Conformité calculée
              </h3>
              <ComplianceBadge compliance={driver.compliance} />
            </div>
            <ul className="divide-y divide-border rounded-field border border-border">
              {complianceLines.map(({ type, document }) => (
                <li key={type} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
                  <span className="font-medium text-foreground">{DOCUMENT_FULL_LABELS[type]}</span>
                  <span className="flex items-center gap-3 text-muted">
                    {document?.expires_at ? `jusqu'au ${formatDate(document.expires_at)}` : document ? 'sans date d’expiration' : type === 'assurance' && !driver.motorcycle ? 'aucune moto' : ''}
                    <ValidityPill validity={document?.validity ?? 'manquant'} />
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted">La conformité est distincte du statut : un dossier peut être validé même non conforme.</p>
          </section>
        </div>
      </Card>

      <Card title="Avant la validation">
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {ACTIVATION_ITEMS.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2 rounded-field border border-border px-3 py-2.5 text-sm">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  {checklist[item.id] ? <CheckCircle2 size={18} className="text-success" aria-hidden /> : <CircleAlert size={18} className="text-danger" aria-hidden />}
                  {item.label}
                </span>
                {checklist[item.id] ? (
                  <span className="text-success">Fourni</span>
                ) : (
                  <Button variant="link" size="sm" onClick={() => onEdit(STEP_OF_ITEM[item.id])}>
                    Manquant : compléter
                  </Button>
                )}
              </li>
            ))}
          </ul>
          {missing.length > 0 && <Alert tone="warning">{missingActivationSentence(missing)} Le dossier ne peut pas encore être validé.</Alert>}
          <Button fullWidth leftIcon={<ShieldCheck size={18} />} disabled={missing.length > 0} onClick={() => setConfirming(true)}>
            Valider le dossier
          </Button>
          <Button
            variant="outline"
            fullWidth
            leftIcon={<Save size={16} />}
            onClick={() => {
              toast.success('Dossier enregistré en attente.');
              router.push(`${basePath}/${driver.id}`);
            }}
          >
            Enregistrer en attente
          </Button>
          <Button variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={onBack}>
            Étape précédente
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirming}
        onClose={() => (validate.reset(), setConfirming(false))}
        title="Valider ce dossier ?"
        message="Le numéro ZemiConnect et le QR seront générés."
        confirmLabel="Valider le dossier"
        isLoading={validate.isPending}
        error={validate.error}
        onConfirm={async () => {
          try {
            await validate.mutateAsync();
            toast.success('Dossier validé : numéro ZemiConnect et QR générés.');
            router.push(`${basePath}/${driver.id}?onglet=qr&valide=1`);
          } catch {
            // Bandeau dans la modale (validate.error).
          }
        }}
      />
    </div>
  );
}
