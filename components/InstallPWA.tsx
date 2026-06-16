"use client";

import { Download, Share, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay()) {
      setIsInstalled(true);
      return;
    }

    setIsIOS(isIosSafari());

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowIOSHint(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
      return;
    }

    if (isIOS) {
      setShowIOSHint(true);
    }
  }, [deferredPrompt, isIOS]);

  if (isInstalled || dismissed) return null;

  const canShowInstall = Boolean(deferredPrompt) || isIOS;
  if (!canShowInstall) return null;

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-[120] flex justify-center sm:left-auto sm:right-6 sm:max-w-sm">
        <button
          type="button"
          onClick={handleInstall}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-brand-forest/40 bg-brand-forest px-5 py-3 text-sm font-bold text-brand-forest-fg shadow-lg shadow-black/30 transition hover:brightness-110 active:scale-[0.98] sm:w-auto"
          aria-label="Instalar aplicación Hatrack"
        >
          <Download className="size-4 shrink-0" strokeWidth={2.25} />
          Instalar aplicación
        </button>
      </div>

      {showIOSHint ? (
        <div
          className="fixed inset-0 z-[130] flex items-end justify-center bg-brand-scrim p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  id="ios-install-title"
                  className="text-base font-bold text-text-primary"
                >
                  Instalar en iOS
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  Toca{" "}
                  <Share className="inline size-4 align-text-bottom text-brand-forest" />{" "}
                  Compartir y luego &quot;Añadir a pantalla de inicio&quot;.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSHint(false)}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border-default text-text-muted hover:bg-surface-muted"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="mt-4 w-full min-h-11 rounded-xl border border-border-default text-sm font-medium text-text-secondary hover:bg-surface-muted"
            >
              No volver a mostrar
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
