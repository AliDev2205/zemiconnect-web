import Link from 'next/link';
import { QrCode, SearchX, ShieldAlert } from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';
import Card from '@/components/ui/Card';

type Variant = 'qr' | 'numero';

const CONTENT: Record<Variant, { title: string; text: string; Icon: typeof QrCode }> = {
  qr: { title: 'QR non valide', text: "Ce QR n'est pas ou plus valide. Ne vous fiez pas à ce badge.", Icon: QrCode },
  numero: { title: 'Numéro introuvable', text: 'Aucun conducteur ne correspond à ce numéro.', Icon: SearchX },
};

// PU3 : même écran pour un QR révoqué, un jeton inconnu, un conducteur en
// attente ou archivé. Aucune donnée personnelle, aucun indice sur la cause.
export default function PublicNotFound({ variant }: { variant: Variant }) {
  const { title, text, Icon } = CONTENT[variant];
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6 sm:py-10">
      <Card>
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-card bg-neutral-soft text-neutral" aria-hidden>
            <Icon size={32} />
          </span>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-base text-muted">{text}</p>
          </div>
          <div className="flex w-full gap-3 rounded-field border border-border bg-background p-4 text-left text-sm">
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-neutral" aria-hidden />
            <p className="text-foreground">
              <span className="font-semibold">Par prudence, en cas de doute, ne montez pas.</span> Choisissez un autre
              conducteur et vérifiez son badge.
            </p>
          </div>
          <Link href="/" prefetch={false} className={buttonClasses({ size: 'lg', fullWidth: true })}>
            Vérifier un autre numéro
          </Link>
        </div>
      </Card>
    </div>
  );
}
