import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePresenceState, formatLastSeen } from "@/hooks/usePresence";
import { ArrowLeft, Loader2, Paperclip, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { sendNotification } from "@/lib/push";
import { toast } from "@/hooks/use-toast";
import DmMedia from "@/components/DmMedia";



interface DM {
  id: string;
  sender_id: string;
  recipient_id: string;
  text: string | null;
  image_url: string | null;
  created_at: string;
  read_at: string | null;
}

interface PartnerProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  last_seen_at: string | null;
}

const DirectMessage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const onlineIds = usePresenceState();
  const endRef = useRef<HTMLDivElement>(null);

  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [messages, setMessages] = useState<DM[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    if (!userId) return;

    let active = true;

    const load = async () => {
      const [{ data: prof }, { data: msgs }] = await Promise.all([
        supabase.from("profiles").select("user_id,display_name,avatar_url,last_seen_at").eq("user_id", userId).maybeSingle(),
        supabase
          .from("direct_messages")
          .select("*")
          .or(
            `and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`
          )
          .order("created_at", { ascending: true })
          .limit(200),
      ]);
      if (!active) return;
      setPartner((prof as PartnerProfile) ?? null);
      setMessages((msgs as DM[]) || []);
      setLoading(false);

      // Mark received messages as read
      await supabase
        .from("direct_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("recipient_id", user.id)
        .eq("sender_id", userId)
        .is("read_at", null);
    };

    load();

    const channel = supabase
      .channel(`dm-${[user.id, userId].sort().join("-")}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        (payload) => {
          const m = payload.new as DM;
          const inThread =
            (m.sender_id === user.id && m.recipient_id === userId) ||
            (m.sender_id === userId && m.recipient_id === user.id);
          if (inThread) setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]));
        }
      )
      .subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, [user, userId, navigate]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !user || !userId) return;
    setSending(true);
    const body = text.trim();
    setText("");
    const { data, error } = await supabase
      .from("direct_messages")
      .insert({ sender_id: user.id, recipient_id: userId, text: body })
      .select()
      .single();
    if (!error && data) {
      setMessages((prev) => (prev.some((p) => p.id === data.id) ? prev : [...prev, data as DM]));
      void sendNotification({
        recipientId: userId,
        title: `New message from ${profile?.display_name || "a classmate"}`,
        body: body.slice(0, 120),
        link: `/messages/${user.id}`,
        type: "direct_message",
      });
    }
    setSending(false);

  };

  if (!user) return null;

  const name = partner?.display_name || "Student";
  const isOnline = userId ? onlineIds.has(userId) : false;

  return (
    <div className="animate-fade-in mx-auto flex h-screen max-w-lg flex-col">
      <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-3">
        <button onClick={() => navigate("/messages")} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-foreground hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button onClick={() => userId && navigate(`/profile/${userId}`)} className="flex flex-1 items-center gap-2 text-left">
          <div className="relative">
            <Avatar className="h-9 w-9">
              <AvatarImage src={partner?.avatar_url || undefined} />
              <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {isOnline && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{name}</p>
            <p className="text-[11px] text-muted-foreground">
              {isOnline ? "🟢 Online now" : `Last seen ${formatLastSeen(partner?.last_seen_at)}`}
            </p>
          </div>
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
        {!loading && messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Say hello 👋</p>
        )}
        {messages.map((m) => {
          const isMe = m.sender_id === user.id;
          return (
            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe ? "gradient-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                {m.image_url && <img src={m.image_url} alt="shared" className="mb-1 max-h-48 rounded-lg object-cover" />}
                {m.text && <p className="break-words text-sm">{m.text}</p>}
                <span className="mt-1 block text-[10px] opacity-60">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="safe-bottom border-t border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={`Message ${name.split(" ")[0]}...`}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={send}
            disabled={sending || !text.trim()}
            className="rounded-xl gradient-primary p-2.5 text-primary-foreground shadow-sm disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectMessage;
