import { useState, useEffect } from "react";
import { Download, Smartphone, CheckCircle, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="animate-fade-in pb-24 px-4 pt-6 max-w-lg mx-auto text-center space-y-6">
      <div className="space-y-3">
        <div className="mx-auto h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center">
          <Smartphone className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Install StudyPlug</h1>
        <p className="text-muted-foreground">Get the full app experience — faster loading, offline access, and home screen shortcut!</p>
      </div>

      {installed ? (
        <div className="rounded-2xl border border-success/30 bg-success/5 p-6 space-y-2">
          <CheckCircle className="h-10 w-10 text-success mx-auto" />
          <p className="text-lg font-semibold text-foreground">App Installed! 🎉</p>
          <p className="text-sm text-muted-foreground">Open StudyPlug from your home screen.</p>
        </div>
      ) : isIOS ? (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 text-left">
          <h3 className="text-sm font-semibold text-foreground text-center">Install on iPhone / iPad</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-primary/10 text-primary h-7 w-7 flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <p className="text-sm text-card-foreground">Tap the <Share className="inline h-4 w-4" /> Share button in Safari</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-primary/10 text-primary h-7 w-7 flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <p className="text-sm text-card-foreground">Scroll down and tap <strong>"Add to Home Screen"</strong></p>
            </div>
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-primary/10 text-primary h-7 w-7 flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <p className="text-sm text-card-foreground">Tap <strong>"Add"</strong> — done! 🎉</p>
            </div>
          </div>
        </div>
      ) : deferredPrompt ? (
        <Button onClick={handleInstall} size="lg" className="w-full text-lg py-6">
          <Download className="mr-2 h-5 w-5" /> Install App
        </Button>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 text-left">
          <h3 className="text-sm font-semibold text-foreground text-center">Install on Android</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-primary/10 text-primary h-7 w-7 flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <p className="text-sm text-card-foreground">Open this page in <strong>Chrome</strong></p>
            </div>
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-primary/10 text-primary h-7 w-7 flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <p className="text-sm text-card-foreground">Tap the <strong>⋮ menu</strong> (top right)</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-primary/10 text-primary h-7 w-7 flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <p className="text-sm text-card-foreground">Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong></p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-lg font-bold text-foreground">⚡</p>
          <p className="text-xs text-muted-foreground">Faster</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-lg font-bold text-foreground">📱</p>
          <p className="text-xs text-muted-foreground">Native feel</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-lg font-bold text-foreground">🏠</p>
          <p className="text-xs text-muted-foreground">Home screen</p>
        </div>
      </div>
    </div>
  );
};

export default Install;
