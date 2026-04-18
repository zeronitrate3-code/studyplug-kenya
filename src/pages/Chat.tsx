import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Send, ArrowLeft, Flag, Users, Image, Smile, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { toast } from "@/hooks/use-toast";

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  grade_level: number | null;
  member_count: number;
  image_url?: string | null;
  is_custom?: boolean;
  created_by?: string | null;
}

interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  text: string | null;
  image_url: string | null;
  flagged: boolean;
  created_at: string;
}

const Chat = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const room = rooms.find((r) => r.id === activeRoom);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase.from("chat_rooms").select("*").order("created_at");
      if (data) setRooms(data);
      setLoading(false);
    };
    fetchRooms();
  }, []);

  // Fetch messages & subscribe to realtime
  useEffect(() => {
    if (!activeRoom) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", activeRoom)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) setMessages(data);
    };
    fetchMessages();

    const channel = supabase
      .channel(`room-${activeRoom}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${activeRoom}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRoom]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `chat/${user!.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSend = async () => {
    if ((!message.trim() && !imageFile) || !user || !activeRoom) return;
    setSending(true);
    setShowEmoji(false);

    let imgUrl: string | null = null;
    if (imageFile) {
      imgUrl = await uploadImage(imageFile);
      setImageFile(null);
      setImagePreview(null);
    }

    await supabase.from("chat_messages").insert({
      room_id: activeRoom,
      user_id: user.id,
      display_name: profile?.display_name || "Student",
      avatar_url: profile?.avatar_url || null,
      text: message.trim() || null,
      image_url: imgUrl,
    });

    setMessage("");
    setSending(false);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!user) return null;

  // Active room view
  if (activeRoom && room) {
    return (
      <div className="animate-fade-in flex flex-col h-screen max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-3">
          <button
            onClick={() => { setActiveRoom(null); setMessages([]); setShowEmoji(false); }}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-foreground hover:bg-muted transition-colors"
            aria-label="Exit chat room"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-xs font-medium">Exit</span>
          </button>
          {room.image_url ? (
            <img src={room.image_url} alt={room.name} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <span className="text-xl">{room.icon}</span>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{room.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <Users className="h-3 w-3 shrink-0" /> {room.description}
            </p>
          </div>
          <button
            onClick={() => { setActiveRoom(null); setMessages([]); setShowEmoji(false); navigate("/"); }}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close and go home"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Start the conversation! 🎉</p>
          )}
          {messages.map((msg) => {
            const isMe = msg.user_id === user.id;
            const initial = (msg.display_name || "S").charAt(0).toUpperCase();
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                {!isMe && (
                  <div className="h-7 w-7 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">
                    {msg.avatar_url ? (
                      <img src={msg.avatar_url} alt={msg.display_name || "user"} className="h-full w-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMe
                    ? "gradient-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}>
                  {!isMe && (
                    <p className="text-xs font-semibold mb-0.5 opacity-80">{msg.display_name || "Student"}</p>
                  )}
                  {msg.image_url && (
                    <img src={msg.image_url} alt="shared" className="rounded-lg max-w-full max-h-48 mb-1 object-cover" />
                  )}
                  {msg.text && <p className="text-sm break-words">{msg.text}</p>}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] opacity-60">{formatTime(msg.created_at)}</span>
                    {!isMe && (
                      <button className="ml-2 opacity-40 hover:opacity-100">
                        <Flag className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                {isMe && (
                  <div className="h-7 w-7 shrink-0 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="me" className="h-full w-full object-cover" />
                    ) : (
                      (profile?.display_name || "M").charAt(0).toUpperCase()
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="px-4 pb-2">
            <div className="relative inline-block">
              <img src={imagePreview} alt="preview" className="h-20 rounded-lg object-cover" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Emoji picker */}
        {showEmoji && (
          <div className="px-4 pb-2">
            <EmojiPicker
              theme={Theme.AUTO}
              width="100%"
              height={300}
              onEmojiClick={(e) => setMessage((prev) => prev + e.emoji)}
            />
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border bg-card p-3 safe-bottom">
          <div className="flex gap-2 items-center">
            <button onClick={() => setShowEmoji(!showEmoji)} className="text-muted-foreground hover:text-foreground">
              <Smile className="h-5 w-5" />
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="text-muted-foreground hover:text-foreground">
              <Image className="h-5 w-5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleSend}
              disabled={sending || (!message.trim() && !imageFile)}
              className="rounded-xl gradient-primary p-2.5 text-primary-foreground shadow-sm disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Room list
  return (
    <div className="animate-fade-in space-y-6 pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground">Chat Rooms 💬</h1>
      <p className="text-sm text-muted-foreground">Join a room and discuss with fellow students</p>
      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading rooms...</p>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <span className="text-2xl">{room.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-card-foreground">{room.name}</p>
                <p className="text-xs text-muted-foreground">
                  {room.description}
                  {room.grade_level && ` • Grade ${room.grade_level}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Chat;
