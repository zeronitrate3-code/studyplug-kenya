import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { disablePush, enablePush, getExistingSubscription, pushSupported } from "@/lib/push";

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [supported] = useState(pushSupported());
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default",
  );

  useEffect(() => {
    if (!supported) return;
    getExistingSubscription().then((sub) => setEnabled(!!sub));
  }, [supported, user]);

  const enable = useCallback(async () => {
    if (!user) return;
    setBusy(true);
    try {
      await enablePush(user.id);
      setEnabled(true);
      setPermission("granted");
    } finally {
      setBusy(false);
    }
  }, [user]);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      await disablePush();
      setEnabled(false);
    } finally {
      setBusy(false);
    }
  }, []);

  return { supported, enabled, busy, permission, enable, disable };
};
