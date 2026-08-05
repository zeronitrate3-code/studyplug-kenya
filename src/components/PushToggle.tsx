import { useEffect, useState } from "react";
import { BellRing, Loader2 } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const PushToggle = () => {
  const { supported, enabled, busy, permission, enable, disable } = usePushNotifications();
  const { toast } = useToast();
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistration().then((r) => setSwReady(!!r));
  }, []);

  const onToggle = async (next: boolean) => {
    try {
      if (next) {
        await enable();
        toast({ title: "Notifications on", description: "You'll get alerts on this device." });
      } else {
        await disable();
        toast({ title: "Notifications off" });
      }
    } catch (err) {
      toast({
        title: "Couldn't enable notifications",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-card-foreground">Device notifications</p>
            <p className="text-xs text-muted-foreground">
              {!supported
                ? "Not supported on this browser"
                : permission === "denied"
                  ? "Blocked — allow notifications in browser settings"
                  : "Alerts for messages, results and announcements"}
            </p>
          </div>
        </div>
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <Switch checked={enabled} disabled={!supported || permission === "denied"} onCheckedChange={onToggle} />
        )}
      </div>
      {supported && !swReady && (
        <p className="mt-3 rounded-lg bg-muted p-2 text-[11px] text-muted-foreground">
          Tip: install StudyPlug to your home screen for reliable notifications on phones.
        </p>
      )}
    </div>
  );
};

export default PushToggle;
