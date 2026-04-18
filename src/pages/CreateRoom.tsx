import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ICON_OPTIONS = ["💬", "📚", "🧮", "🔬", "🌍", "⚽", "🎨", "🎵", "🚀", "💡"];

const CreateRoom = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("💬");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 3MB", variant: "destructive" });
      return;
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!name.trim()) {
      toast({ title: "Name required", description: "Give your room a name." });
      return;
    }
    setSubmitting(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("room-images").upload(path, imageFile);
      if (upErr) {
        toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }
      imageUrl = supabase.storage.from("room-images").getPublicUrl(path).data.publicUrl;
    }

    const { data, error } = await supabase
      .from("chat_rooms")
      .insert({
        name: name.trim().slice(0, 60),
        description: description.trim().slice(0, 200) || null,
        icon,
        image_url: imageUrl,
        is_custom: true,
        created_by: user.id,
      })
      .select("id")
      .single();

    setSubmitting(false);

    if (error) {
      toast({ title: "Could not create room", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Room created!", description: "Your room is live." });
    navigate("/chat");
  };

  return (
    <div className="animate-fade-in min-h-screen max-w-lg mx-auto pb-24">
      <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-foreground hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-xs font-medium">Back</span>
        </button>
        <h1 className="text-base font-semibold text-foreground">Create Chat Room</h1>
      </div>

      <div className="p-4 space-y-5">
        {/* Image picker */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative h-24 w-24 rounded-full bg-muted overflow-hidden flex items-center justify-center border-2 border-dashed border-border hover:border-primary transition-colors"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="room" className="h-full w-full object-cover" />
            ) : (
              <Camera className="h-8 w-8 text-muted-foreground" />
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
          <p className="text-xs text-muted-foreground">Tap to add a room photo (optional)</p>
        </div>

        {/* Icon picker (used as fallback) */}
        <div>
          <label className="text-xs font-semibold text-foreground mb-2 block">Or pick an icon</label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={`h-10 w-10 rounded-full flex items-center justify-center text-xl transition-all ${
                  icon === emoji ? "bg-primary/20 ring-2 ring-primary" : "bg-muted hover:bg-muted/70"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Room name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="e.g. Grade 8 Math Squad"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-[10px] text-muted-foreground mt-1">{name.length}/60</p>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="What is this room about?"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <p className="text-[10px] text-muted-foreground mt-1">{description.length}/200</p>
        </div>

        <button
          onClick={submit}
          disabled={submitting || !name.trim()}
          className="w-full rounded-xl gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Room
        </button>
      </div>
    </div>
  );
};

export default CreateRoom;
