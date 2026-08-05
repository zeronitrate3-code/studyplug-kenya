import { useState } from "react";
import { Megaphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendNotification } from "@/lib/push";

/** Owner-only broadcast: pushes an announcement to every learner's device. */
const AdminBroadcast = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("/");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!title.trim()) {
      toast({ title: "Add a title", variant: "destructive" });
      return;
    }
    setSending(true);
    const ok = await sendNotification({
      broadcast: true,
      title: title.trim(),
      body: body.trim(),
      link: link.trim() || "/",
      type: "announcement",
    });
    setSending(false);
    if (ok) {
      toast({ title: "Announcement sent", description: "Delivered to all learners." });
      setTitle("");
      setBody("");
    } else {
      toast({ title: "Could not send", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Megaphone className="h-4 w-4" /> Broadcast announcement
      </h2>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (e.g. New Grade 9 exams live)" />
      <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message" />
      <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Open link (e.g. /exams)" />
      <Button onClick={send} disabled={sending} className="w-full">
        {sending ? "Sending…" : "Send to all learners"}
      </Button>
    </div>
  );
};

export default AdminBroadcast;
