import { useState } from "react";
import { MOCK_CHAT_ROOMS, MOCK_MESSAGES } from "@/lib/mockData";
import { Send, ArrowLeft, Flag, Users } from "lucide-react";

const Chat = () => {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const room = MOCK_CHAT_ROOMS.find((r) => r.id === activeRoom);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `m${Date.now()}`, userId: "current", userName: "You", text: message, timestamp: "now", flagged: false },
    ]);
    setMessage("");
  };

  if (activeRoom && room) {
    return (
      <div className="animate-fade-in flex flex-col h-screen max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
          <button onClick={() => setActiveRoom(null)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
          <span className="text-xl">{room.icon}</span>
          <div>
            <p className="text-sm font-semibold text-foreground">{room.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> {room.memberCount} members</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.userId === "current" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.userId === "current"
                  ? "gradient-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}>
                {msg.userId !== "current" && <p className="text-xs font-semibold mb-0.5 opacity-80">{msg.userName}</p>}
                <p className="text-sm">{msg.text}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] opacity-60">{msg.timestamp}</span>
                  {msg.userId !== "current" && (
                    <button className="ml-2 opacity-40 hover:opacity-100"><Flag className="h-3 w-3" /></button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card p-3 safe-bottom">
          <div className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button onClick={handleSend} className="rounded-xl gradient-primary p-2.5 text-primary-foreground shadow-sm">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground">Chat Rooms 💬</h1>
      <div className="space-y-2">
        {MOCK_CHAT_ROOMS.map((room) => (
          <button
            key={room.id}
            onClick={() => setActiveRoom(room.id)}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
          >
            <span className="text-2xl">{room.icon}</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-card-foreground">{room.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" /> {room.memberCount} members
                {room.gradeLevel && ` • Grade ${room.gradeLevel}`}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Chat;
