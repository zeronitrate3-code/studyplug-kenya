import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, UserPlus, Check, X, UserMinus, Clock } from "lucide-react";

type Profile = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  grade: number | null;
};

type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted";
};

type RelStatus =
  | { kind: "none" }
  | { kind: "outgoing"; id: string }
  | { kind: "incoming"; id: string }
  | { kind: "friends"; id: string };

const People = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: p }, { data: f }] = await Promise.all([
      supabase.from("profiles").select("user_id, display_name, avatar_url, grade").neq("user_id", user.id),
      supabase.from("friendships").select("*").or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
    ]);
    setProfiles((p as Profile[]) || []);
    setFriendships((f as Friendship[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadAll();
  }, [user, navigate, loadAll]);

  const getRel = (otherId: string): RelStatus => {
    if (!user) return { kind: "none" };
    const f = friendships.find(
      (x) =>
        (x.requester_id === user.id && x.addressee_id === otherId) ||
        (x.requester_id === otherId && x.addressee_id === user.id)
    );
    if (!f) return { kind: "none" };
    if (f.status === "accepted") return { kind: "friends", id: f.id };
    if (f.requester_id === user.id) return { kind: "outgoing", id: f.id };
    return { kind: "incoming", id: f.id };
  };

  const sendRequest = async (otherId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("friendships")
      .insert({ requester_id: user.id, addressee_id: otherId, status: "pending" });
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Friend request sent!" });
      loadAll();
    }
  };

  const acceptRequest = async (id: string) => {
    const { error } = await supabase.from("friendships").update({ status: "accepted" }).eq("id", id);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Friend added!" });
      loadAll();
    }
  };

  const removeFriendship = async (id: string) => {
    const { error } = await supabase.from("friendships").delete().eq("id", id);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else loadAll();
  };

  const filtered = profiles.filter((p) =>
    (p.display_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const friendIds = new Set(
    friendships
      .filter((f) => f.status === "accepted")
      .map((f) => (f.requester_id === user?.id ? f.addressee_id : f.requester_id))
  );
  const incomingReqs = friendships.filter((f) => f.status === "pending" && f.addressee_id === user?.id);

  const renderRow = (p: Profile) => {
    const rel = getRel(p.user_id);
    const initials = (p.display_name || "?").charAt(0).toUpperCase();
    return (
      <div key={p.user_id} className="flex items-center gap-3 p-3 border-b border-border last:border-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={p.avatar_url || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {p.display_name || "Anonymous"}
          </p>
          <p className="text-xs text-muted-foreground">Grade {p.grade ?? "—"}</p>
        </div>
        {rel.kind === "none" && (
          <Button size="sm" onClick={() => sendRequest(p.user_id)}>
            <UserPlus className="h-4 w-4 mr-1" /> Add
          </Button>
        )}
        {rel.kind === "outgoing" && (
          <Button size="sm" variant="outline" onClick={() => removeFriendship(rel.id)}>
            <Clock className="h-4 w-4 mr-1" /> Pending
          </Button>
        )}
        {rel.kind === "incoming" && (
          <div className="flex gap-1">
            <Button size="sm" onClick={() => acceptRequest(rel.id)}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => removeFriendship(rel.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {rel.kind === "friends" && (
          <Button size="sm" variant="outline" onClick={() => removeFriendship(rel.id)}>
            <UserMinus className="h-4 w-4 mr-1" /> Friends
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Find People</h1>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Everyone</TabsTrigger>
          <TabsTrigger value="requests">
            Requests{incomingReqs.length > 0 && ` (${incomingReqs.length})`}
          </TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {loading ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No users found.</p>
            ) : (
              filtered.map(renderRow)
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {incomingReqs.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No pending requests.</p>
            ) : (
              incomingReqs
                .map((r) => profiles.find((p) => p.user_id === r.requester_id))
                .filter((p): p is Profile => !!p)
                .map(renderRow)
            )}
          </div>
        </TabsContent>

        <TabsContent value="friends" className="mt-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {friendIds.size === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No friends yet — add some!</p>
            ) : (
              profiles.filter((p) => friendIds.has(p.user_id)).map(renderRow)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default People;
