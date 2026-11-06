'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CameraOff, Flashlight, FlashlightOff, Keyboard, Loader2, RotateCcw, ShieldAlert } from 'lucide-react';
import type QrScanner from 'qr-scanner';
import Button, { buttonClasses } from '@/components/ui/Button';
import { parseZemiConnectQr } from '@/lib/qr/parseQr';

type CameraState = 'starting' | 'scanning' | 'denied' | 'unavailable' | 'insecure';

const MANUAL_HREF = '/agent?saisie=1';

// qr-scanner masque la cause d'un échec (toujours « Camera not found. ») :
// on la retrouve ici. Permission refusée → explication pour l'autoriser ;
// aucune caméra ou caméra occupée → indisponible.
async function diagnoseCameraFailure(): Promise<CameraState> {
  try {
    const permission = await navigator.permissions?.query({ name: 'camera' as PermissionName });
    if (permission?.state === 'denied') return 'denied';
  } catch {
    // API des permissions absente (anciens Safari) : on continue.
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    if (!devices.some((device) => device.kind === 'videoinput')) return 'unavailable';
    // Une caméra existe : un appel direct donne l'erreur réelle.
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((track) => track.stop());
    return 'unavailable';
  } catch (error) {
    const name = error instanceof DOMException ? error.name : '';
    return name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable';
  }
}

/*
 * AG2 : scanner QR plein écran, caméra arrière.
 * - qr-scanner (nimiq) est chargé en import dynamique, ici seulement : Web
 *   Worker, et BarcodeDetector natif quand le navigateur le propose.
 * - Seuls les QR <NEXT_PUBLIC_PUBLIC_URL>/v/<jeton> sont acceptés (parseZemiConnectQr) ;
 *   l'URL lue n'est JAMAIS ouverte, seul le jeton sert à aller sur la fiche.
 * - La caméra est libérée en quittant la page (destroy au démontage).
 */
export default function QrScannerScreen() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const doneRef = useRef(false);
  const [state, setState] = useState<CameraState>('starting');
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [foreignQr, setForeignQr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let scanner: QrScanner | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setState('insecure');
        return;
      }
      const { default: QrScannerLib } = await import('qr-scanner');
      if (cancelled || !videoRef.current) return;

      scanner = new QrScannerLib(
        videoRef.current,
        (result) => {
          if (doneRef.current) return;
          const token = parseZemiConnectQr(result.data);
          if (token) {
            doneRef.current = true;
            navigator.vibrate?.(80);
            scanner?.stop();
            router.push(`/agent/conducteur/${encodeURIComponent(token)}`);
            return;
          }
          // Autre QR : message, et le scan continue.
          setForeignQr(true);
          clearTimeout(hideTimer);
          hideTimer = setTimeout(() => setForeignQr(false), 3000);
        },
        { preferredCamera: 'environment', maxScansPerSecond: 5, returnDetailedScanResult: true, highlightScanRegion: false },
      );
      scannerRef.current = scanner;

      try {
        await scanner.start();
        if (cancelled) return;
        setState('scanning');
        setHasFlash(await scanner.hasFlash());
      } catch {
        scanner?.destroy();
        const problem = await diagnoseCameraFailure();
        if (!cancelled) setState(problem);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(hideTimer);
      scanner?.destroy();
      scannerRef.current = null;
    };
  }, [router]);

  const toggleFlash = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    await scanner.toggleFlash();
    setFlashOn(scanner.isFlashOn());
  };

  if (state === 'denied' || state === 'unavailable' || state === 'insecure') {
    return <CameraProblem state={state} />;
  }

  return (
    <div className="fixed inset-0 z-40 bg-black text-white">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline aria-hidden />

      {/* Cadre de visée. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-5 px-6">
        <p className="rounded-field bg-black/75 px-4 py-2 text-lg font-semibold">Placez le QR dans le cadre</p>
        <div className="relative aspect-square w-[72vw] max-w-72" aria-hidden>
          {['left-0 top-0 border-l-4 border-t-4', 'right-0 top-0 border-r-4 border-t-4', 'bottom-0 left-0 border-b-4 border-l-4', 'bottom-0 right-0 border-b-4 border-r-4'].map(
            (corner) => (
              <span key={corner} className={`absolute h-12 w-12 rounded-sm border-accent ${corner}`} />
            ),
          )}
        </div>
        {state === 'starting' && (
          <p className="flex items-center gap-2 text-base" role="status">
            <Loader2 size={18} className="animate-spin" aria-hidden />
            Ouverture de la caméra…
          </p>
        )}
      </div>

      {/* Barre du haut : retour et lampe (seulement si l'appareil le permet). */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 pt-[calc(1rem+env(safe-area-inset-top))]">
        <Link href="/agent" className="flex h-12 w-12 items-center justify-center rounded-field bg-black/70" aria-label="Retour à l'accueil">
          <ArrowLeft size={24} aria-hidden />
        </Link>
        {hasFlash && (
          <button
            type="button"
            onClick={toggleFlash}
            className="flex h-12 w-12 items-center justify-center rounded-field bg-black/70"
            aria-pressed={flashOn}
            aria-label={flashOn ? 'Éteindre la lampe' : 'Allumer la lampe'}
          >
            {flashOn ? <FlashlightOff size={24} aria-hidden /> : <Flashlight size={24} aria-hidden />}
          </button>
        )}
      </div>

      {/* Bas : message « autre QR » et saisie manuelle. */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div aria-live="assertive">
          {foreignQr && (
            <p className="flex items-center gap-2 rounded-field bg-danger px-4 py-3 text-lg font-semibold text-white">
              <ShieldAlert size={22} className="shrink-0" aria-hidden />
              Ce QR n&apos;est pas un QR ZemiConnect
            </p>
          )}
        </div>
        <Link href={MANUAL_HREF} className={buttonClasses({ variant: 'secondary', size: 'lg', fullWidth: true, className: 'bg-white text-lg' })}>
          <Keyboard size={22} aria-hidden />
          Saisir le numéro
        </Link>
      </div>
    </div>
  );
}

const PROBLEMS: Record<'denied' | 'unavailable' | 'insecure', { title: string; text: string; steps?: string[] }> = {
  denied: {
    title: 'Caméra refusée',
    text: 'ZemiConnect a besoin de la caméra pour lire le QR du badge.',
    steps: [
      "Touchez l'icône à gauche de l'adresse du site (cadenas ou réglages).",
      'Ouvrez « Autorisations », puis « Caméra », et choisissez « Autoriser ».',
      'Revenez ici et touchez « Réessayer ».',
    ],
  },
  unavailable: {
    title: 'Caméra indisponible',
    text: "Aucune caméra n'est accessible : l'appareil n'en a pas, ou une autre application l'utilise. Fermez-la puis réessayez.",
  },
  insecure: {
    title: 'Caméra indisponible',
    text: 'Le navigateur ne donne accès à la caméra que sur une connexion sécurisée (https).',
  },
};

// Caméra refusée ou absente : explication et saisie manuelle.
function CameraProblem({ state }: { state: keyof typeof PROBLEMS }) {
  const { title, text, steps } = PROBLEMS[state];
  return (
    <section role="alert" className="flex flex-col items-center gap-5 rounded-card border border-border bg-surface px-5 py-8 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-card bg-neutral-soft text-foreground" aria-hidden>
        <CameraOff size={40} />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-lg text-foreground">{text}</p>
      </div>
      {steps && (
        <ol className="flex w-full list-decimal flex-col gap-2 rounded-field bg-background py-3 pr-3 pl-8 text-left text-base text-foreground">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}
      <Link href={MANUAL_HREF} className={buttonClasses({ size: 'lg', fullWidth: true })}>
        <Keyboard size={22} aria-hidden />
        Saisir le numéro
      </Link>
      {state !== 'insecure' && (
        <Button variant="outline" size="lg" fullWidth leftIcon={<RotateCcw size={20} />} onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      )}
    </section>
  );
}
