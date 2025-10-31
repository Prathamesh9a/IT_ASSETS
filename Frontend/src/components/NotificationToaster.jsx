// src/components/NotificationToaster.jsx
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useGetNotificationsQuery, useMarkAllReadMutation } from "@/store/api/notificationApi";
import { useSelector } from "react-redux";

const WS_BASE = "ws://127.0.0.1:8000/ws/notifications";

export function NotificationToaster() {
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id;
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false); // Connection state

  const seenKey = `seen_notifications_${userId}`;
  const seenIds = useRef(new Set(JSON.parse(sessionStorage.getItem(seenKey) || "[]")));

  const { data = [], isFetching, refetch } = useGetNotificationsQuery(undefined, {
    pollingInterval: 300000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [markAllRead] = useMarkAllReadMutation();

  // Show only NEW unread notifications on load
  useEffect(() => {
    if (!isFetching && data.length > 0) {
      data
        .filter((n) => !n.is_read && !seenIds.current.has(n.id))
        .forEach((n) => {
          toast.success("New Notification", {
            description: <span className="text-black font-medium">{n.message}</span>,
            duration: 5000,
          });
          seenIds.current.add(n.id);
        });
      sessionStorage.setItem(seenKey, JSON.stringify([...seenIds.current]));
    }
  }, [data, isFetching]);

  // WebSocket with connection status
  useEffect(() => {
    if (!userId) return;

    const wsUrl = `${WS_BASE}/${userId}/`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket Connected:", wsUrl);
      setIsConnected(true); // Connected
    };

    ws.current.onmessage = (e) => {
      try {
        const n = JSON.parse(e.data);
        if (n.id && !n.is_read && !seenIds.current.has(n.id)) {
          toast.success("New Notification", {
            description: <span className="text-black font-medium">{n.message}</span>,
            duration: 5000,
          });
          seenIds.current.add(n.id);
          sessionStorage.setItem(seenKey, JSON.stringify([...seenIds.current]));
          refetch();
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket Disconnected");
      setIsConnected(false); // Disconnected
      // Reconnect after 3s
      setTimeout(() => {
        if (userId) ws.current = new WebSocket(wsUrl);
      }, 3000);
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket Error:", err);
      setIsConnected(false);
    };

    return () => {
      ws.current?.close();
      setIsConnected(false);
    };
  }, [userId, refetch]);

  // Optional: Show connection status in UI
  useEffect(() => {
    if (isConnected) {
      toast.success("Connected to real-time notifications", { duration: 2000 });
    }
  }, [isConnected]);

  return null;
}