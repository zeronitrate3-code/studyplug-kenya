import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Lock, UserPlus, Check, X, Loader2, MessageSquare, Trophy, Calendar, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getRankForPoints } from "@/lib/ranks";
import { usePresenceState, formatLastSeen } from "@/hooks/usePresence";
import { toast } from "@/hooks/use-toast";

interface ProfileData {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  grade: number | null;
  is_private: boolean;
  last_seen_at: string | null;
}

interface Stats {
  total_points: number;
  exams_taken: number;
  avg_percentage: number;
}

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const onlineIds = usePresenceState();

  const [target, setTarget] = useState<ProfileData | null>(null);
  const [canViewFull, setCanViewFull] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [friendStatus, setFriendStatus] = useState<"none" | "pending_out" | "pending_in" | "accepted" | "self">("none");
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!userId || !user) return;
    if (userId === user.id) {
      setFriendStatus("self");
    }

    (async () => {
      setLoading(true);

      // Fetch target profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_id,display_name,avatar_url,grade,is_private,last_seen_at")
        .eq("user_id", userId)
        .single();

      if (!prof) {
        toast({ title: "User not found", variant: "destructive" });
        navigate(-1);
        return;
      }
      setTarget(prof as ProfileData);

      // Friendship lookup
      const { data: friendships } = await supabase
        .from("friendships")
        .select("id,requester_id,addressee_id,status")
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`);

      const f = friendships?.[0];
      if (f) {
        setFriendshipId(f.id);
        if (f.status === "accepted") setFriendStatus("accepted");
        else if (f.status === "pending" && f.requester_id === user.id) setFriendStatus("pending_out");
        else if (f.status === "pending" && f.addressee_id === user.id) setFriendStatus("pending_in");
      }

      // Determine visibility
      const isFriend = f?.status === "accepted";
      const isSelf = userId === user.id;
      const visible = isSelf || !prof.is_private || isFriend;
      setCanViewFull(visible);

      if (visible) {
        const { data: results } = await supabase
          .from("exam_results")
          .select("id,subject_name,percentage,score,total_questions,points,created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (results) {
          const total_points = results.reduce((s, r) => s + (r.points || 0), 0);
          const exams_taken = results.length;
          const avg_percentage = exams_taken
            ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / exams_taken)
            : 0;
          setStats({ total_points, exams_taken, avg_percentage });
          setRecent(results.slice(0, 5));
        }
      }

      setLoading(false);
    })();
  }, [userId, user, navigate]);

  const sendRequest = async () => {
    if (!user || !userId) return;
    setWorking(true);
    const { data, error } = await supabase
      .from("friendships")
      .insert({ requester_id: user.id, addressee_id: userId, status: "pending" })
      .select("id")
      .single();
    setWorking(false);
    if (error) {
      toast({ title: "Could not send request", description: error.message, variant: "destructive" });
      return;
    }
    setFriendshipId(data.id);
    setFriendStatus("pending_out");
    toast({ title: "Friend request sent!" });
  };

  const acceptRequest = async () => {
    if (!friendshipId) return;
    setWorking(true);
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", friendshipId);
    setWorking(false);
    setFriendStatus("accepted");
    toast({ title: "You are now friends!" });
  };

  const removeFriend = async () => {
    if (!friendshipId) return;
    if (!confirm("Remove this friend?")) return;
    setWorking(true);
    await supabase.from("friendships").delete().eq("id", friendshipId);
    setWorking(false);
    setFriendshipId(null);
    setFriendStatus("none");
    toast({ title: "Friend removed" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!target) return null;

  const displayName = target.display_name || "Student";
  const initials = displayName.charAt(0).toUpperCase();
  const isOnline = onlineIds.has(target.user_id);
  const rank = stats ? getRankForPoints(stats.total_points) : null;

  return (
    <div className="animate-fade-in min-h-screen max-w-lg mx-auto pb-24">
      <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-foreground hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-xs font-medium">Back</span>
        </button>
        <h1 className="text-base font-semibold text-foreground">Profile</h1>
      </div>

      <div className="p-4 space-y-5">
        {/* Hero */}
        <div className="rounded-2xl gradient-hero p-6 text-primary-foreground shadow-lg">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20 ring-2 ring-primary-foreground/30">
                <AvatarImage src={target.avatar_url || undefined} />
                <AvatarFallback className="text-2xl font-bold bg-primary-foreground/20">{initials}</AvatarFallback>
              </Avatar>
              {isOnline && (
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-success ring-2 ring-primary-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{displayName}</h2>
              {canViewFull && (
                <p className="text-sm opacity-80">Grade {target.grade ?? "-"}</p>
              )}
              <p className="text-xs opacity-70 mt-1">
                {isOnline ? "🟢 Online now" : `Last seen ${formatLastSeen(target.last_seen_at)}`}
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {friendStatus !== "self" && (
          <Button variant="secondary" className="w-full" onClick={() => navigate(`/messages/${target.user_id}`)}>
            <MessageSquare className="h-4 w-4 mr-2" /> Send Message
          </Button>
        )}

        {/* Friend action */}
        {friendStatus === "self" ? null : friendStatus === "none" ? (
          <Button onClick={sendRequest} disabled={working} className="w-full">
            <UserPlus className="h-4 w-4 mr-2" /> Add Friend
          </Button>
        ) : friendStatus === "pending_out" ? (
          <Button disabled variant="secondary" className="w-full">
            Request sent · Pending
          </Button>
        ) : friendStatus === "pending_in" ? (
          <div className="flex gap-2">
            <Button onClick={acceptRequest} disabled={working} className="flex-1">
              <Check className="h-4 w-4 mr-2" /> Accept
            </Button>
            <Button onClick={removeFriend} disabled={working} variant="outline" className="flex-1">
              <X className="h-4 w-4 mr-2" /> Decline
            </Button>
          </div>
        ) : (
          <Button onClick={removeFriend} disabled={working} variant="outline" className="w-full">
            ✓ Friends · Tap to remove
          </Button>
        )}

        {/* Locked notice */}
        {!canViewFull && (
          <div className="rounded-2xl border border-border bg-muted/40 p-6 text-center space-y-2">
            <Lock className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-foreground">This profile is private</p>
            <p className="text-xs text-muted-foreground">Add {displayName.split(" ")[0]} as a friend to see their stats and activity.</p>
          </div>
        )}

        {/* Stats */}
        {canViewFull && stats && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <Trophy className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{stats.total_points}</p>
                <p className="text-[10px] text-muted-foreground">Points</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <BookOpen className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{stats.exams_taken}</p>
                <p className="text-[10px] text-muted-foreground">Exams</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <Calendar className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{stats.avg_percentage}%</p>
                <p className="text-[10px] text-muted-foreground">Accuracy</p>
              </div>
            </div>

            {rank && (
              <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full text-lg ${rank.color}`}>{rank.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{rank.name}</p>
                  <p className="text-xs text-muted-foreground">Current rank</p>
                </div>
              </div>
            )}

            {/* Recent exams */}
            {recent.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Recent exams</h3>
                <div className="space-y-2">
                  {recent.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.subject_name}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-sm font-bold ${r.percentage >= 80 ? "text-success" : r.percentage >= 60 ? "text-warning" : "text-destructive"}`}>
                        {r.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
