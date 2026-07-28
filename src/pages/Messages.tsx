import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePresenceState, formatLastSeen } from "@/hooks/usePresence";
import { ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Conversation {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  last_seen_at: string | null;
  last_text: string;
  last_at: string;
  unread: number;
}

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const onlineIds = usePresenceState();
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }

    const load = async () => {
      const { data: msgs } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(300);

      const byPartner = new Map<string, { last: any; unread: number }>();
      (msgs || []).forEach((m) => {
        const partner = m.sender_id === user.id ? m.recipient_id : m.sender_id;
        const entry = byPartner.get(partner) || { last: m, unread: 0 };
        if (m.recipient_id === user.id && !m.read_at) entry.unread += 1;
        byPartner.set(partner, entry);
      });

      const ids = [...byPartner.keys()];
      if (ids.length === 0) { setItems([]); setLoading(false); return; }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id,display_name,avatar_url,last_seen_at")
        .in("user_id", ids);

      const list: Conversation[] = ids.map((id) => {
        const p = profiles?.find((x) => x.user_id === id);
        const { last, unread } = byPartner.get(id)!;
        return {
          user_id: id,
          display_name: p?.display_name ?? null,
          avatar_url: p?.avatar_url ?? null,
          last_seen_at: p?.last_seen_at ?? null,
          last_text: last.text || (last.image_url ? "📷 Photo" : ""),
          last_at: last.created_at,
          unread,
        };
      }).sort((a, b) => (a.last_at < b.last_at ? 1 : -1));

      setItems(list);
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel("dm-inbox")
      .on("postgres_changes", { event: "*", schema: "public", table: "direct_messages" }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="animate-fade-in min-h-screen max-w-lg mx-auto pb-24">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card px-3 py-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-foreground hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-xs font-medium">Back</span>
        </button>
        <h1 className="text-base font-semibold text-foreground">Messages</h1>
      </div>

      <div className="p-4 space-y-2">
        {loading && (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        )}

        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-2">
            <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">No private chats yet</p>
            <p className="text-xs text-muted-foreground">Find a classmate and start a conversation.</p>
            <button onClick={() => navigate("/people")} className="mt-2 rounded-lg gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
              Find People
            </button>
          </div>
        )}

        {items.map((c) => {
          const name = c.display_name || "Student";
          const isOnline = onlineIds.has(c.user_id);
          return (
            <button
              key={c.user_id}
              onClick={() => navigate(`/messages/${c.user_id}`)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={c.avatar_url || undefined} />
                  <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                {isOnline && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success ring-2 ring-card" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-card-foreground">{name}</p>
                <p className="truncate text-xs text-muted-foreground">{c.last_text}</p>
                <p className="text-[10px] text-muted-foreground">
                  {isOnline ? "🟢 Online now" : `Last seen ${formatLastSeen(c.last_seen_at)}`}
                </p>
              </div>
              {c.unread > 0 && (
                <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
                  {c.unread > 9 ? "9+" : c.unread}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Messages;
