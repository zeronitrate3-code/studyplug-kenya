import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import RankBadge from "@/components/RankBadge";
import { Settings, Bell, Shield, LogOut, HelpCircle, ChevronRight, Camera, FileText, Users, Lock, Unlock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GRADES } from "@/lib/mockData";

const Profile = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editName, setEditName] = useState(profile?.display_name || "");
  const [editGrade, setEditGrade] = useState(String(profile?.grade || 7));
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
    await refreshProfile();
    toast({ title: "Profile picture updated!" });
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: editName,
      grade: parseInt(editGrade),
    }).eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Profile updated!" });
      setEditOpen(false);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (!user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Button onClick={() => navigate("/auth")}>Sign In</Button>
      </div>
    );
  }

  const displayName = profile.display_name || user.email?.split("@")[0] || "Student";
  const initials = displayName.charAt(0).toUpperCase();

  const togglePrivacy = async () => {
    if (!user || !profile) return;
    const next = !profile.is_private;
    const { error } = await supabase.from("profiles").update({ is_private: next }).eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await refreshProfile();
    toast({
      title: next ? "Profile is now private" : "Profile is now public",
      description: next ? "Only friends can see your stats." : "Anyone can view your profile.",
    });
  };

  const settingsItems = [
    {
      icon: Settings, label: "Edit Profile", desc: "Name & grade",
      action: () => {
        setEditName(profile.display_name || "");
        setEditGrade(String(profile.grade || 7));
        setEditOpen(true);
      }
    },
    { icon: Users, label: "Find People", desc: "Browse users & add friends", action: () => navigate("/people") },
    {
      icon: profile.is_private ? Lock : Unlock,
      label: profile.is_private ? "Profile: Private 🔒" : "Profile: Public 🌍",
      desc: profile.is_private ? "Only friends see your stats — tap to change" : "Anyone can see your stats — tap to lock",
      action: togglePrivacy,
    },
    { icon: Bell, label: "Notifications", desc: "Manage alerts" },
    { icon: FileText, label: "Privacy Policy", desc: "Read our policy", action: () => navigate("/privacy") },
    { icon: HelpCircle, label: "Help & FAQ", desc: "Get support" },
    { icon: LogOut, label: "Log Out", desc: "Sign out", destructive: true, action: handleSignOut },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-24 px-4 pt-6 max-w-lg mx-auto">
      {/* Profile Card */}
      <div className="rounded-2xl gradient-hero p-6 text-primary-foreground shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl font-bold bg-primary-foreground/20">{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 shadow-md"
            >
              <Camera className="h-3 w-3 text-primary-foreground" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{displayName}</h1>
            <p className="text-sm opacity-80">Grade {profile.grade || 7}</p>
          </div>
          <RankBadge rank={15} size="lg" />
        </div>
      </div>

      {/* Settings */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Settings</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          {settingsItems.map((item, i) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted ${
                i < settingsItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <item.icon className={`h-5 w-5 ${item.destructive ? "text-destructive" : "text-muted-foreground"}`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${item.destructive ? "text-destructive" : "text-card-foreground"}`}>{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground">Display Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Grade</label>
              <Select value={editGrade} onValueChange={setEditGrade}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={String(g)}>Grade {g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
