import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useGetNotificationsQuery } from "@/store/api/notificationApi"
import { useSelector } from "react-redux";

export function NotificationToaster() {
      const { user } = useSelector((state) => state.auth);
   const userId = user?.id;
      
  const { data = [], isFetching ,refetch} = useGetNotificationsQuery(undefined,{
    pollingInterval:150000,
    refetchOnFocus:true,
    refetchOnReconnect:true
  })
  useEffect(() => {
    if (userId) {
      refetch(); // Fetch notifications when userId changes
    }
  }, [userId]);
  const shownIds = useRef(new Set()) // track already shown notifications

  useEffect(() => {
    if (!isFetching && data.length > 0) {
      const unread = data.filter((n) => !n.is_read)

      unread.forEach((n) => {
        if (!shownIds.current.has(n.id)) {
          toast("New Notification", {
             description: (
      <span style={{ color: "black" }}>{n.message}</span>
    ),
            duration: 4000, // auto-hide after 4s
          })
          shownIds.current.add(n.id)
        }
      })
    }
  }, [data, isFetching])

  return null
}
