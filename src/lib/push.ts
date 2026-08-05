import { supabase } from "@/integrations/supabase/client";

export const VAPID_PUBLIC_KEY =
  "BMCsAwoUecDQPXiP-hpw3mH89I01P3-R5eZFsN5s6J7-CDCwNy1hMfKsR_jYz2cTgSgKQPJob-zKC3qqHoBRQe8";

export const pushSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
};

const bufToBase64 = (buf: ArrayBuffer | null) => {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let str = "";
  bytes.forEach((b) => (str += String.fromCharCode(b)));
  return window.btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const getRegistration = async () => {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ?? (await navigator.serviceWorker.ready.catch(() => null));
};

export const getExistingSubscription = async () => {
  const reg = await getRegistration();
  if (!reg) return null;
  return reg.pushManager.getSubscription();
};

/** Ask for permission and register this device for push notifications. */
export const enablePush = async (userId: string) => {
  if (!pushSupported()) throw new Error("Push notifications are not supported on this device or browser.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was blocked. Enable it in browser settings.");

  const reg = await getRegistration();
  if (!reg) throw new Error("Install StudyPlug to your home screen first, then turn notifications on.");

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const json = sub.toJSON() as { keys?: { p256dh?: string; auth?: string } };
  const p256dh = json.keys?.p256dh ?? bufToBase64(sub.getKey("p256dh"));
  const auth = json.keys?.auth ?? bufToBase64(sub.getKey("auth"));

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: sub.endpoint,
      p256dh,
      auth,
      user_agent: navigator.userAgent.slice(0, 200),
    },
    { onConflict: "endpoint" },
  );
  if (error) throw new Error(error.message);
  return true;
};

export const disablePush = async () => {
  const sub = await getExistingSubscription();
  if (!sub) return;
  await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
  await sub.unsubscribe().catch(() => undefined);
};

interface NotifyArgs {
  recipientId?: string;
  recipientIds?: string[];
  title: string;
  body?: string;
  link?: string;
  type?: string;
  broadcast?: boolean;
}

/** Fire a device + in-app notification through the backend. Never throws. */
export const sendNotification = async (args: NotifyArgs) => {
  try {
    const { error } = await supabase.functions.invoke("send-push", {
      body: {
        recipient_id: args.recipientId,
        recipient_ids: args.recipientIds,
        title: args.title,
        body: args.body ?? "",
        link: args.link ?? "/",
        type: args.type ?? "general",
        broadcast: args.broadcast ?? false,
      },
    });
    if (error) console.error("send-push failed", error);
    return !error;
  } catch (err) {
    console.error("send-push failed", err);
    return false;
  }
};
