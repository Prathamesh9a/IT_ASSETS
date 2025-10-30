// src/components/NotificationToaster.jsx
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useGetNotificationsQuery } from "@/store/api/notificationApi";
import { useSelector } from "react-redux";

const WS_BASE = "ws://127.0.0.1:8000/ws/notifications";

export function NotificationToaster() {
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id;
  const ws = useRef(null);
  const shownIds = useRef(new Set());

  const { data = [], isFetching, refetch } = useGetNotificationsQuery(undefined, {
    pollingInterval: 300000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // Show unread on load
  useEffect(() => {
    if (!isFetching && data.length > 0) {
      data
        .filter((n) => !n.is_read && !shownIds.current.has(n.id))
        .forEach((n) => {
          toast.success("New Notification", {
            description: <span className="text-black font-medium">{n.message}</span>,
            duration: 5000,
          });
          shownIds.current.add(n.id);
        });
    }
  }, [data, isFetching]);

  // WebSocket
  useEffect(() => {
    if (!userId) return;

    const wsUrl = `${WS_BASE}/${userId}/`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => console.log("WS Connected:", wsUrl);
    ws.current.onclose = () => {
      setTimeout(() => {
        if (userId) ws.current = new WebSocket(wsUrl);
      }, 3000);
    };
    ws.current.onmessage = (e) => {
      try {
        const n = JSON.parse(e.data);
        if (n.id && !shownIds.current.has(n.id)) {
          toast.success("New Notification", {
            description: <span className="text-black font-medium">{n.message}</span>,
            duration: 5000,
          });
          shownIds.current.add(n.id);
          refetch();
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };
    ws.current.onerror = (err) => console.error("WS error:", err);

    return () => ws.current?.close();
  }, [userId, refetch]);

  return null;
}
