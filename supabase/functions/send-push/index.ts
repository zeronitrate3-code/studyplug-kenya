import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:support@studyplug.app";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

interface Body {
  recipient_ids?: string[];
  recipient_id?: string;
  title?: string;
  body?: string;
  link?: string;
  type?: string;
  broadcast?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await admin.auth.getUser(token);
    if (authError || !userData?.user) {
      return json({ error: "Unauthorized" }, 401);
    }
    const sender = userData.user;

    const payload = (await req.json()) as Body;
    const title = (payload.title || "").toString().slice(0, 120).trim();
    const message = (payload.body || "").toString().slice(0, 400).trim();
    const link = (payload.link || "/").toString().slice(0, 300);
    const type = (payload.type || "general").toString().slice(0, 40);

    if (!title) return json({ error: "title is required" }, 400);

    const { data: roleRows } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", sender.id);
    const isAdmin = (roleRows ?? []).some((r) => r.role === "admin");

    let recipients: string[] = [];
    if (payload.broadcast) {
      if (!isAdmin) return json({ error: "Only admins can broadcast" }, 403);
      const { data: everyone } = await admin.from("profiles").select("user_id");
      recipients = (everyone ?? []).map((p) => p.user_id);
    } else {
      recipients = payload.recipient_ids ?? (payload.recipient_id ? [payload.recipient_id] : []);
      if (!isAdmin && recipients.some((id) => id === sender.id)) {
        // self-notifications are always fine
      }
      if (recipients.length > 50 && !isAdmin) {
        return json({ error: "Too many recipients" }, 400);
      }
    }

    recipients = [...new Set(recipients.filter(Boolean))];
    if (recipients.length === 0) return json({ error: "No recipients" }, 400);

    // Persist in-app notifications
    await admin.from("notifications").insert(
      recipients.map((user_id) => ({ user_id, title, body: message, type, link })),
    );

    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("id,endpoint,p256dh,auth")
      .in("user_id", recipients);

    let sent = 0;
    const stale: string[] = [];

    await Promise.all(
      (subs ?? []).map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            JSON.stringify({ title, body: message, link, tag: type }),
          );
          sent++;
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) stale.push(s.id);
          else console.error("push failed", status, String(err));
        }
      }),
    );

    if (stale.length) await admin.from("push_subscriptions").delete().in("id", stale);

    return json({ ok: true, recipients: recipients.length, pushed: sent });
  } catch (err) {
    console.error("send-push error", err);
    return json({ error: String(err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
