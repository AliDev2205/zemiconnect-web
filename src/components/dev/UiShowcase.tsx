'use client';

import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bike, Plus, ScanLine, Users } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import ReadOnlyBanner from '@/components/layout/ReadOnlyBanner';
import AccountBadge from '@/components/ui/AccountBadge';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ComplianceBadge from '@/components/ui/ComplianceBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DataTable, { Column } from '@/components/ui/DataTable';
import DateField from '@/components/ui/DateField';
import Drawer from '@/components/ui/Drawer';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import FileDrop from '@/components/ui/FileDrop';
import { PasswordInput, SearchInput, TextArea, TextInput } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import QrBadge from '@/components/ui/QrBadge';
import Select from '@/components/ui/Select';
import Skeleton, { SkeletonText } from '@/components/ui/Skeleton';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Tabs from '@/components/ui/Tabs';
import ValidityPill from '@/components/ui/ValidityPill';
import { applyApiErrorsToForm } from '@/lib/api/errors';
import { mockError } from '@/lib/api/mock';
import { toast } from '@/lib/toast/store';
import { DOCUMENT_TYPE_LABELS, toOptions } from '@/lib/utils/labels';
import { mockDrivers } from '@/mocks/drivers';
import type { ComplianceStatus, Driver, DriverStatus } from '@/types/driver';
import type { DocumentValidity } from '@/types/document';

const STATUSES: DriverStatus[] = ['actif', 'suspendu', 'en_attente', 'archive'];
const COMPLIANCES: ComplianceStatus[] = ['conforme', 'expire_bientot', 'non_conforme'];
const VALIDITIES: DocumentValidity[] = ['valide', 'expire_bientot', 'expire', 'manquant'];

// Convention de formulaire : schéma Zod + zodResolver, champs ui/ branchés par
// register (ou Controller pour FileDrop), erreurs 422 reportées par applyApiErrorsToForm.
const demoSchema = z.object({
  last_name: z.string().trim().min(1, 'Le nom est obligatoire.'),
  first_name: z.string().trim().min(1, 'Le prénom est obligatoire.'),
  // Aucune validation de format : le numéro ZemiConnect n'est pas arrêté.
  zc_number: z.string().trim().optional(),
  document_type: z.string().min(1, 'Choisissez un type.'),
  // Facultative : un document peut ne pas expirer.
  expires_at: z.string().optional(),
  password: z.string().min(8, '8 caractères minimum.'),
  notes: z.string().optional(),
  file: z.instanceof(File, { message: 'Ajoutez un fichier.' }).nullable().refine((file) => file !== null, 'Ajoutez un fichier.'),
});
// Valeurs saisies (entrée du schéma) et valeurs validées (sortie) peuvent différer.
type DemoInput = z.input<typeof demoSchema>;
type DemoValues = z.output<typeof demoSchema>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

const columns: Column<Driver>[] = [
  { key: 'zc_number', title: 'Numéro', render: (row) => <span className="tabular font-semibold">{row.zc_number}</span> },
  { key: 'name', title: 'Conducteur', render: (row) => `${row.first_name} ${row.last_name}` },
  { key: 'plate', title: 'Moto', render: (row) => <span className="tabular">{row.motorcycle?.plate_number ?? '—'}</span> },
  {
    key: 'state',
    title: 'Statut et conformité',
    render: (row) => (
      <div className="flex flex-wrap gap-1.5">
        <StatusBadge status={row.status} />
        <ComplianceBadge compliance={row.compliance} />
      </div>
    ),
  },
];

export default function UiShowcase() {
  const [tab, setTab] = useState('identite');
  const [filter, setFilter] = useState('tous');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DemoInput, unknown, DemoValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: { last_name: '', first_name: '', zc_number: '', document_type: '', expires_at: '', password: '', notes: '', file: null },
  });

  const onSubmit = handleSubmit(async () => {
    try {
      // Simule une réponse 422 de Laravel pour montrer le report sur les champs.
      await mockError(422, 'Données invalides.', { last_name: ['Ce nom est déjà utilisé (erreur serveur simulée).'] });
    } catch (error) {
      if (!applyApiErrorsToForm(error, setError)) toast.error('Erreur inattendue.');
    }
  });

  const filtered = mockDrivers.filter(
    (driver) => (filter === 'tous' || driver.status === filter) && `${driver.first_name} ${driver.last_name} ${driver.zc_number}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <Badge tone="warning" appearance="outline">
            Développement
          </Badge>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-8">
        <div>
          <h1 className="text-2xl font-semibold">Catalogue UI</h1>
          <p className="text-sm text-muted">Tous les composants de components/ui et tous les badges. Page absente en production.</p>
        </div>

        <Section title="Couleurs">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {[
              ['primary', 'bg-primary text-white'],
              ['secondary', 'bg-secondary text-primary'],
              ['accent', 'bg-accent text-foreground'],
              ['succès', 'bg-success-soft text-success'],
              ['attention', 'bg-warning-soft text-warning'],
              ['danger', 'bg-danger-soft text-danger'],
              ['neutre', 'bg-neutral-soft text-neutral'],
              ['fond', 'bg-background text-foreground'],
            ].map(([name, classes]) => (
              <div key={name} className={`flex h-16 items-end rounded-field border border-border p-2 text-xs font-semibold ${classes}`}>
                {name}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Badges">
          <Card>
            <div className="flex flex-col gap-4 text-sm">
              <Row label="StatusBadge (plein)">
                {STATUSES.map((status) => (
                  <StatusBadge key={status} status={status} />
                ))}
              </Row>
              <Row label="ComplianceBadge (contour)">
                {COMPLIANCES.map((compliance) => (
                  <ComplianceBadge key={compliance} compliance={compliance} />
                ))}
              </Row>
              <Row label="ValidityPill">
                {VALIDITIES.map((validity) => (
                  <ValidityPill key={validity} validity={validity} />
                ))}
              </Row>
              <Row label="Badge QR">
                <QrBadge status="actif" />
                <QrBadge status="revoque" />
              </Row>
              <Row label="Badge de compte (contour)">
                <AccountBadge status="actif" />
                <AccountBadge status="desactive" />
                <AccountBadge status="archive" />
              </Row>
              <Row label="Statut + conformité côte à côte">
                <StatusBadge status="actif" />
                <ComplianceBadge compliance="expire_bientot" />
              </Row>
              <Row label="Badge générique">
                <Badge tone="primary">Primaire</Badge>
                <Badge tone="neutral">Neutre</Badge>
                <Badge tone="success" appearance="outline">
                  Contour
                </Badge>
              </Row>
            </div>
          </Card>
        </Section>

        <Section title="Boutons">
          <div className="flex flex-wrap items-center gap-3">
            <Button leftIcon={<Plus size={18} />}>Principal</Button>
            <Button variant="secondary">Secondaire</Button>
            <Button variant="outline">Neutre</Button>
            <Button variant="ghost">Discret</Button>
            <Button variant="danger">Suspendre</Button>
            <Button variant="link">Lien</Button>
            <Button isLoading>Envoi</Button>
            <Button disabled>Désactivé</Button>
            <Button iconOnly variant="outline" aria-label="Ajouter">
              <Plus size={18} />
            </Button>
          </div>
          <div className="max-w-sm">
            <Button variant="accent" size="lg" fullWidth leftIcon={<ScanLine size={24} />}>
              Scanner un QR
            </Button>
          </div>
        </Section>

        <Section title="Formulaire (React Hook Form + Zod)">
          <Card subtitle="Envoyez le formulaire valide pour voir une erreur 422 simulée reportée sur le champ Nom.">
            <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Nom" required error={errors.last_name?.message} {...register('last_name')} />
              <TextInput label="Prénom" required error={errors.first_name?.message} {...register('first_name')} />
              <TextInput label="Numéro ZemiConnect" helperText="Format non arrêté : aucune validation." className="tabular" {...register('zc_number')} />
              <Select
                label="Type de document"
                required
                placeholder="Choisir…"
                options={toOptions(DOCUMENT_TYPE_LABELS)}
                error={errors.document_type?.message}
                {...register('document_type')}
              />
              <DateField label="Date d'expiration" helperText="Laisser vide si le document n'expire pas." {...register('expires_at')} />
              <PasswordInput label="Mot de passe" required error={errors.password?.message} {...register('password')} />
              <TextArea label="Notes" className="sm:col-span-2" {...register('notes')} />
              <Controller
                control={control}
                name="file"
                render={({ field, fieldState }) => (
                  <FileDrop label="Pièce jointe" required value={field.value} onChange={field.onChange} error={fieldState.error?.message} className="sm:col-span-2" />
                )}
              />
              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button type="submit" isLoading={isSubmitting}>
                  Enregistrer
                </Button>
              </div>
            </form>
          </Card>
          <div className="max-w-xs">
            <SearchInput value={search} onChange={setSearch} label="SearchInput" />
          </div>
        </Section>

        <Section title="Cartes et statistiques">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Conducteurs" value={128} icon={<Users size={18} />} hint="dont 6 en attente" />
            <StatCard label="Motos" value={117} icon={<Bike size={18} />} />
            <StatCard label="Chargement" value={0} isLoading />
          </div>
          <Card title="Carte avec en-tête teinté" subtitle="Fiche conducteur" tintedHeader actions={<Button size="sm" variant="outline">Action</Button>}>
            <p className="text-sm text-muted">Contenu de la carte.</p>
          </Card>
          <ReadOnlyBanner />
        </Section>

        <Section title="Onglets">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'identite', label: 'Identité' },
              { value: 'documents', label: 'Documents', count: 3 },
              { value: 'qr', label: 'QR et badge' },
              { value: 'historique', label: 'Historique et audit' },
            ]}
          />
        </Section>

        <Section title="DataTable et pagination">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setTableLoading((value) => !value)}>
              {tableLoading ? 'Afficher les données' : 'Afficher le squelette'}
            </Button>
          </div>
          <DataTable
            columns={columns}
            data={filtered}
            getRowKey={(row) => row.id}
            isLoading={tableLoading}
            isHead={{ title: 'Conducteurs', subtitle: `${filtered.length} résultat(s)` }}
            isSearch={{ value: search, searchAction: setSearch, placeholder: 'Nom ou numéro…' }}
            isFilterTabs={{
              value: filter,
              filterAction: setFilter,
              tabs: [
                { value: 'tous', label: 'Tous' },
                { value: 'actif', label: 'Actifs' },
                { value: 'suspendu', label: 'Suspendus' },
              ],
            }}
            onRowClick={(row) => toast.info(`Ligne : ${row.zc_number}`)}
            pagination={{ currentPage: page, totalPages: 8, totalItems: 117, itemsPerPage: 15, onPageChange: setPage }}
          />
          <Card padded={false}>
            <Pagination currentPage={page} totalPages={8} totalItems={117} itemsPerPage={15} onPageChange={setPage} />
          </Card>
        </Section>

        <Section title="États">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card padded={false}>
              <EmptyState title="Aucun conducteur" message="Aucun résultat pour ces filtres." />
            </Card>
            <Card padded={false}>
              <ErrorState message="Impossible de charger la liste." onRetry={() => toast.info('Nouvel essai')} />
            </Card>
            <Card>
              <div className="flex flex-col gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <SkeletonText lines={3} />
              </div>
            </Card>
          </div>
        </Section>

        <Section title="Modale, confirmation, panneau, toasts">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setModalOpen(true)}>
              Modal
            </Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              ConfirmDialog avec motif
            </Button>
            <Button variant="outline" onClick={() => setDrawerOpen(true)}>
              Drawer
            </Button>
            <Button variant="outline" onClick={() => toast.success('Conducteur enregistré.')}>
              Toast succès
            </Button>
            <Button variant="outline" onClick={() => toast.error("Vous n'avez pas les droits nécessaires.")}>
              Toast erreur
            </Button>
            <Button variant="outline" onClick={() => toast.warning('Le droit de taxi expire dans 12 jours.')}>
              Toast attention
            </Button>
          </div>
        </Section>
      </main>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Changer de moto"
        description="Exemple de modale."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => setModalOpen(false)}>Valider</Button>
          </>
        }
      >
        <p className="text-sm text-muted">Contenu de la modale.</p>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={(reason) => {
          setConfirmOpen(false);
          toast.success(`Suspension confirmée. Motif : ${reason}`);
        }}
        title="Suspendre Moussa ALASSANE ?"
        message="Le profil public affichera « Suspendu ». Le motif est enregistré dans le journal d'audit."
        confirmLabel="Suspendre"
        tone="danger"
        requireReason
        reasonLabel="Motif de la suspension"
      />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Modifier l'identité" description="Exemple de panneau latéral." footer={<Button onClick={() => setDrawerOpen(false)}>Fermer</Button>}>
        <p className="text-sm text-muted">Contenu du panneau.</p>
      </Drawer>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="w-56 shrink-0 text-xs font-semibold text-muted">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
