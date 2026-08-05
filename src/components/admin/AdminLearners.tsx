import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, MessageSquare, Search, Unlock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { formatLastSeen } from "@/hooks/usePresence";

interface LearnerRow {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  grade: number | null;
  pathway: string | null;
  is_private: boolean;
  last_seen_at: string | null;
  created_at: string;
}

/** Owner-only learner directory — includes locked/private profiles. */
const AdminLearners = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<LearnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id,display_name,avatar_url,grade,pathway,is_private,last_seen_at,created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      setRows((data as LearnerRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (r) =>
        (r.display_name ?? "").toLowerCase().includes(term) ||
        String(r.grade ?? "").includes(term) ||
        (r.pathway ?? "").toLowerCase().includes(term),
    );
  }, [rows, q]);

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Learner directory</h2>
        <span className="text-[11px] text-muted-foreground">{rows.length} learners</span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Owner access — locked profiles are visible here too.
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, grade or pathway" className="pl-9" />
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      <div className="max-h-96 space-y-2 overflow-y-auto">
        {filtered.map((r) => {
          const name = r.display_name || "Unnamed learner";
          return (
            <div key={r.user_id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
              <Avatar className="h-9 w-9">
                <AvatarImage src={r.avatar_url || undefined} />
                <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-xs font-semibold text-card-foreground">
                  {name}
                  {r.is_private ? (
                    <Lock className="h-3 w-3 text-destructive" />
                  ) : (
                    <Unlock className="h-3 w-3 text-muted-foreground" />
                  )}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {r.grade ? `Grade ${r.grade}` : "No grade"}
                  {r.pathway ? ` • ${r.pathway}` : ""} • Last seen {formatLastSeen(r.last_seen_at)}
                </p>
              </div>
              <button
                onClick={() => navigate(`/profile/${r.user_id}`)}
                className="rounded-lg border border-border px-2 py-1 text-[11px] text-foreground"
              >
                View
              </button>
              <button
                onClick={() => navigate(`/messages/${r.user_id}`)}
                className="rounded-lg gradient-primary p-1.5 text-primary-foreground"
                aria-label={`Message ${name}`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <p className="text-xs text-muted-foreground">No learners match that search.</p>
        )}
      </div>
    </div>
  );
};

export default AdminLearners;
