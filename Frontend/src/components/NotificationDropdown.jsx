
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetNotificationsQuery, useMarkAllReadMutation } from "@/store/api/notificationApi"
import { Dialog, DialogContent, DialogHeader, DialogClose } from "@/components/ui/dialog"
import { useSelector } from "react-redux"

// Demo notifications

export function NotificationDropdown() {
  const [markAllRead, { isLoading: isMarking }] = useMarkAllReadMutation()
  const [selectedNotification, setSelectedNotification] = useState(null)
const { data = [], isLoading,refetch } = useGetNotificationsQuery(undefined,{
    pollingInterval:150000,
    refetchOnFocus:true,
    refetchOnReconnect:true
  })
   const { user } = useSelector((state) => state.auth);
   const userId = user?.id;
    useEffect(() => {
      if (userId) {
        refetch(); // Fetch notifications when userId changes
      }
    }, [userId]);

  const unreadCount = data?.filter((n) => !n.is_read).length || 0

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="relative rounded-full cursor-pointer">
            {/* Bell SVG */}
            <svg
              className="cursor-pointer w-7 h-7"
              viewBox="0 0 25 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.03632 21.4584C0.77848 23.1459 1.92969 24.3165 3.33874 24.8999C8.74132 27.1394 16.2587 27.1394 21.6613 24.8999C23.0703 24.3165 24.2215 23.1447 23.9637 21.4584C23.8063 20.421 23.0231 19.5579 22.4433 18.7142C21.6843 17.5956 21.6092 16.3766 21.608 15.0789C21.6092 10.0649 17.5322 6 12.5 6C7.46785 6 3.3908 10.0649 3.3908 15.0789C3.3908 16.3766 3.31574 17.5968 2.55553 18.7142C1.9769 19.5579 1.1949 20.421 1.03632 21.4584Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.65771 26.5791C8.21214 28.6673 10.1708 30.2107 12.4998 30.2107C14.8301 30.2107 16.7863 28.6673 17.3419 26.5791"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-medium">
                {unreadCount}
              </span>
            )}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-[90vw] max-w-md sm:max-w-lg rounded-xl shadow-lg border border-gray-200 bg-white z-[9999] p-2"
          align="end"
        >
          <DropdownMenuLabel className="flex justify-between items-center text-base font-semibold px-2">
            Notifications
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                disabled={isMarking}
                className="text-xs text-blue-600 hover:underline cursor-pointer disabled:opacity-50"
              >
                {isMarking ? "Marking..." : "Mark all read"}
              </button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {isLoading && (
            <div className="space-y-2 px-2 py-1">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
          )}

          {!isLoading && data?.length === 0 && (
            <DropdownMenuItem disabled className="text-gray-500">
              No notifications
            </DropdownMenuItem>
          )}

          {!isLoading &&
  data
    ?.filter((n) => !n.is_read) // ✅ sirf unread wali
    .map((n) => (
      <DropdownMenuItem
        key={n.id}
        onClick={() => setSelectedNotification(n)}
        className={`rounded-md px-2 py-2 flex flex-col items-start cursor-pointer break-words font-medium text-black hover:bg-gray-100`}
      >
        <p className="truncate w-full">{n.message}</p>
        <span className="text-xs text-gray-400 mt-1">
          {n.actor_name ? `${n.actor_name} • ` : ""}
          {new Date(n.created_at).toLocaleString()}
        </span>
      </DropdownMenuItem>
    ))}

        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal for full notification */}
      {selectedNotification && (
        <Dialog
          open={!!selectedNotification}
          onOpenChange={() => setSelectedNotification(null)}
        >
          <DialogContent className="w-[95vw] h-auto max-w-md sm:max-w-lg mx-auto p-4 sm:p-6 rounded-xl overflow-y-scroll hide-scrollbar">
            {/* Close button top right */}

            <DialogHeader>
              <h3 className="text-lg font-semibold roboto">
                Notification Details
              </h3>
              <p className="text-sm text-gray-500 roboto">
                Full details of the notification
              </p>
            </DialogHeader>

            <div className="space-y-3 mt-2">
              <p className="text-sm break-words">{selectedNotification.message}</p>
              <p className="text-xs text-gray-500">
                Type: {selectedNotification.notification_type}
              </p>
              <p className="text-xs text-gray-500">
                {selectedNotification.actor_name
                  ? `By ${selectedNotification.actor_name} • `
                  : ""}
                {new Date(selectedNotification.created_at).toLocaleString()}
              </p>

              {selectedNotification.asset && (
                <p className="text-xs text-gray-500  cursor-pointer">
                  Asset: {selectedNotification.asset}
                </p>
              )}
              {selectedNotification.assignment && (
                <p className="text-xs text-gray-500  cursor-pointer">
                   Assignment: {selectedNotification.assignment}
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
