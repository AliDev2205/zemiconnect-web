'use client';

import { ComponentType, useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Area, Point } from 'react-easy-crop';
import { Camera, ImageUp, Loader2, RotateCcw, Save } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useUploadDriverPhoto } from '@/hooks/queries/useDrivers';
import { toApiError } from '@/lib/api/errors';
import { ACCEPTED_IMAGE_TYPES, fileAccept, validateFile } from '@/lib/files';
import DriverPhoto from '../DriverPhoto';

// Propriétés utilisées ici (les autres ont des valeurs par défaut).
interface CropperLiteProps {
  image: string;
  crop: Point;
  zoom: number;
  aspect: number;
  cropShape: 'rect' | 'round';
  onCropChange: (crop: Point) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (area: Area, pixels: Area) => void;
}

// react-easy-crop : chargé seulement quand une image est à recadrer.
const Cropper = dynamic(() => import('react-easy-crop').then((module) => module.default as unknown as ComponentType<CropperLiteProps>), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-white" role="status">
      <Loader2 className="animate-spin" aria-hidden />
      <span className="sr-only">Chargement de l&apos;outil de recadrage…</span>
    </div>
  ),
});

const OUTPUT_SIZE = 600;

// Découpe carrée de la zone choisie, en JPEG 600 × 600.
async function cropToBlob(source: string, area: Area): Promise<Blob> {
  const image = new Image();
  image.src = source;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  canvas.getContext('2d')!.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('crop'))), 'image/jpeg', 0.9));
}

interface Props {
  driverId: string;
  name: string;
  currentUrl: string | null;
  onSaved?: () => void;
}

// Photo du conducteur : caméra ou fichier, puis recadrage carré, puis envoi.
export default function PhotoEditor({ driverId, name, currentUrl, onSaved }: Props) {
  const upload = useUploadDriverPhoto(driverId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const startCrop = (url: string) => {
    setSource(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setProblem(null);
  };

  const pickFile = (file: File | undefined) => {
    if (!file) return;
    const error = validateFile(file, ACCEPTED_IMAGE_TYPES);
    if (error) return setProblem(error);
    startCrop(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!source || !area) return;
    setProblem(null);
    try {
      await upload.mutateAsync(await cropToBlob(source, area));
      setSource(null);
      onSaved?.();
    } catch (error) {
      setProblem(toApiError(error).message);
    }
  };

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  return (
    <div className="flex flex-col gap-4">
      {problem && <Alert tone="danger">{problem}</Alert>}
      {source ? (
        <>
          <div className="relative h-80 overflow-hidden rounded-card bg-foreground">
            <Cropper image={source} crop={crop} zoom={zoom} aspect={1} cropShape="rect" onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
          </div>
          <label className="flex items-center gap-3 text-sm text-muted">
            Zoom
            <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="flex-1 accent-primary" />
          </label>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" leftIcon={<RotateCcw size={16} />} onClick={() => setSource(null)} disabled={upload.isPending}>
              Choisir une autre image
            </Button>
            <Button leftIcon={<Save size={16} />} onClick={save} isLoading={upload.isPending} disabled={!area}>
              Enregistrer la photo
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-5">
          <DriverPhoto url={currentUrl} name={name} size={128} />
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted">{currentUrl ? 'Photo enregistrée. Vous pouvez la remplacer.' : 'Aucune photo. Elle est obligatoire pour valider le dossier.'}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" leftIcon={<Camera size={16} />} onClick={() => setCameraOpen(true)}>
                Prendre une photo
              </Button>
              <Button variant="outline" leftIcon={<ImageUp size={16} />} onClick={() => fileRef.current?.click()}>
                Choisir un fichier
              </Button>
            </div>
            <p className="text-xs text-muted">JPG ou PNG. Recadrage carré ensuite.</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={fileAccept(ACCEPTED_IMAGE_TYPES)}
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => {
              pickFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </div>
      )}
      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(url) => {
          setCameraOpen(false);
          startCrop(url);
        }}
      />
    </div>
  );
}

// Prise de vue par la caméra de l'ordinateur ou du téléphone.
function CameraCapture({ open, onClose, onCapture }: { open: boolean; onClose: () => void; onCapture: (url: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    let stream: MediaStream | null = null;
    let cancelled = false;
    (async () => {
      setError(null);
      setReady(false);
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        if (cancelled || !videoRef.current) return stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setReady(true);
      } catch (cause) {
        const denied = cause instanceof DOMException && cause.name === 'NotAllowedError';
        setError(denied ? "L'accès à la caméra a été refusé. Autorisez-le dans le navigateur, ou choisissez un fichier." : 'Aucune caméra disponible. Choisissez un fichier.');
      }
    })();
    // Caméra coupée à la fermeture.
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [open]);

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL('image/jpeg', 0.92));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Prendre une photo"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button leftIcon={<Camera size={16} />} onClick={capture} disabled={!ready}>
            Capturer
          </Button>
        </>
      }
    >
      {error ? (
        <Alert tone="warning">{error}</Alert>
      ) : (
        <video ref={videoRef} className="aspect-video w-full rounded-card bg-foreground object-cover" muted playsInline aria-label="Aperçu de la caméra" />
      )}
    </Modal>
  );
}
