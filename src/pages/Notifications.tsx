import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, CheckCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PushToggle from "@/components/PushToggle";

interface NotificationRow {
  id: string;
  title: string;
  body: string | null;
  type: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      setItems((data as NotificationRow[]) ?? []);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("notifications-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => setItems((prev) => [payload.new as NotificationRow, ...prev]),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const markAllRead = async () => {
    if (!user) return;
    const now = new Date().toISOString();
    await supabase.from("notifications").update({ read_at: now }).eq("user_id", user.id).is("read_at", null);
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
  };

  const open = async (n: NotificationRow) => {
    if (!n.read_at) {
      await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", n.id);
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
    }
    if (n.link) navigate(n.link);
  };

  if (!user) return null;

  return (
    <div className="animate-fade-in mx-auto min-h-screen max-w-lg pb-24">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card px-3 py-3">
        <button onClick={() => navigate(-1)} className="rounded-lg p-1.5 text-foreground hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-base font-semibold text-foreground">Notifications</h1>
        <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-medium text-primary">
          <CheckCheck className="h-4 w-4" /> Mark all read
        </button>
      </div>

      <div className="space-y-3 p-4">
        <PushToggle />

        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-semibold text-foreground">Nothing yet</p>
            <p className="text-xs text-muted-foreground">Messages, results and announcements will show up here.</p>
          </div>
        )}

        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => open(n)}
            className={`w-full rounded-xl border p-3 text-left transition-all active:scale-[0.99] ${
              n.read_at ? "border-border bg-card" : "border-primary/40 bg-primary/5"
            }`}
          >
            <p className="text-sm font-semibold text-card-foreground">{n.title}</p>
            {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
            <p className="mt-1 text-[10px] text-muted-foreground">
              {new Date(n.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
