import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getQueue, syncQueuedResults } from "@/lib/offlineQueue";

/**
 * Watches online/offline status and uploads exam results that were completed
 * while the student had no internet connection.
 */
export const useOfflineSync = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [online, setOnline] = useState(() => navigator.onLine);
  const [pending, setPending] = useState(() => getQueue().length);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if (!online || !user) return;
    let cancelled = false;
    (async () => {
      const synced = await syncQueuedResults(user.id);
      if (cancelled) return;
      setPending(getQueue().length);
      if (synced > 0) {
        toast({
          title: "Back online",
          description: `${synced} offline exam result${synced > 1 ? "s" : ""} uploaded.`,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [online, user, toast]);

  return { online, pending };
};
