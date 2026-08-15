import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Loader2 } from "lucide-react";

const isVideo = (p: string) => /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(p);
const isImage = (p: string) => /\.(png|jpe?g|gif|webp|avif|heic)(\?|$)/i.test(p);

/**
 * Renders a media attachment stored either as a full URL (legacy rows)
 * or as a path inside the private `dm-media` bucket.
 */
const DmMedia = ({ value }: { value: string }) => {
  const [url, setUrl] = useState<string | null>(value.startsWith("http") ? value : null);

  useEffect(() => {
    let active = true;
    if (value.startsWith("http")) {
      setUrl(value);
      return;
    }
    (async () => {
      const { data } = await supabase.storage.from("dm-media").createSignedUrl(value, 3600);
      if (active) setUrl(data?.signedUrl ?? null);
    })();
    return () => {
      active = false;
    };
  }, [value]);

  if (!url) {
    return (
      <div className="flex h-24 w-40 items-center justify-center rounded-lg bg-background/30">
        <Loader2 className="h-4 w-4 animate-spin opacity-70" />
      </div>
    );
  }

  if (isImage(value)) {
    return <img src={url} alt="Shared attachment" loading="lazy" className="mb-1 max-h-56 rounded-lg object-cover" />;
  }

  if (isVideo(value)) {
    return <video src={url} controls playsInline className="mb-1 max-h-56 w-56 rounded-lg" />;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mb-1 flex items-center gap-2 rounded-lg bg-background/20 px-3 py-2 text-xs underline"
    >
      <FileText className="h-4 w-4 shrink-0" />
      <span className="truncate">{value.split("/").pop()}</span>
    </a>
  );
};

export default DmMedia;
