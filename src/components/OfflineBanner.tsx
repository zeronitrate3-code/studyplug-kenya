import { CloudOff, UploadCloud } from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";

const OfflineBanner = () => {
  const { online, pending } = useOfflineSync();

  if (online && pending === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-muted px-4 py-1.5 text-[11px] font-medium text-muted-foreground">
      {online ? (
        <>
          <UploadCloud className="h-3.5 w-3.5" />
          Uploading {pending} saved exam result{pending > 1 ? "s" : ""}…
        </>
      ) : (
        <>
          <CloudOff className="h-3.5 w-3.5" />
          You're offline — exams are saved and will upload automatically.
        </>
      )}
    </div>
  );
};

export default OfflineBanner;
