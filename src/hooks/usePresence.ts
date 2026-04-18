import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Tracks user presence via Supabase Realtime + heartbeats `profiles.last_seen_at` every minute.
 * Mount once near the app root (e.g. inside AuthProvider tree).
 */
export const usePresence = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const beat = async () => {
      if (cancelled) return;
      await supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("user_id", user.id);
    };

    // Immediate beat
    beat();
    const interval = setInterval(beat, 60_000);

    // Realtime presence channel — broadcasts who is online
    const channel = supabase.channel("online-users", {
      config: { presence: { key: user.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        // no-op; consumers can subscribe via usePresenceState
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    const handleVisibility = () => {
      if (document.visibilityState === "visible") beat();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      supabase.removeChannel(channel);
    };
  }, [user]);
};

/**
 * Returns a Set of user_ids currently online (via realtime presence channel).
 * Components mount their own subscription.
 */
import { useState } from "react";
export const usePresenceState = () => {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const channel = supabase.channel("online-users-readonly");
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const ids = new Set<string>();
        Object.values(state).forEach((entries: any) => {
          entries.forEach((e: any) => { if (e.user_id) ids.add(e.user_id); });
        });
        setOnlineIds(ids);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return onlineIds;
};

/**
 * Helper to format "last seen" time.
 */
export const formatLastSeen = (iso: string | null | undefined): string => {
  if (!iso) return "Offline";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 2) return "Online now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};
