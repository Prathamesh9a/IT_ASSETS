// src/components/NotificationDropdown.jsx
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetNotificationsQuery, useMarkAllReadMutation } from "@/store/api/notificationApi";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";

export function NotificationDropdown() {
  const [markAllRead, { isLoading: isMarking }] = useMarkAllReadMutation();
  const [selected, setSelected] = useState(null);
  const { data = [], isLoading } = useGetNotificationsQuery(undefined, {
    pollingInterval: 300000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const unread = data.filter((n) => !n.is_read);
  const unreadCount = unread.length;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="relative cursor-pointer">
            <svg className="w-7 h-7" viewBox="0 0 25 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1.03632 21.4584C0.77848 23.1459 1.92969 24.3165 3.33874 24.8999C8.74132 27.1394 16.2587 27.1394 21.6613 24.8999C23.0703 24.3165 24.2215 23.1447 23.9637 21.4584C23.8063 20.421 23.0231 19.5579 22.4433 18.7142C21.6843 17.5956 21.6092 16.3766 21.608 15.0789C21.6092 10.0649 17.5322 6 12.5 6C7.46785 6 3.3908 10.0649 3.3908 15.0789C3.3908 16.3766 3.31574 17.5968 2.55553 18.7142C1.9769 19.5579 1.1949 20.421 1.03632 21.4584Z" 
    stroke="currentColor" 
    strokeWidth="1.8" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  />
  <path d="M7.65771 26.5791C8.21214 28.6673 10.1708 30.2107 12.4998 30.2107C14.8301 30.2107 16.7863 28.6673 17.3419 26.5791"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>


            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                {unreadCount}
              </span>
            )}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-[90vw] max-w-md rounded-xl shadow-lg border bg-white p-2"
        >
          <DropdownMenuLabel className="flex justify-between items-center px-2 font-semibold">
            Notifications
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                disabled={isMarking}
                className="text-xs text-blue-600 hover:underline disabled:opacity-50"
              >
                {isMarking ? "..." : "Mark all read"}
              </button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Loading Skeleton */}
          {isLoading &&
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-full rounded my-1" />)}

          {!isLoading && unread.length === 0 && (
            <DropdownMenuItem disabled className="text-gray-500">
              No notifications
            </DropdownMenuItem>
          )}

          {/* SCROLLABLE CONTAINER WITH ONLY FIRST 2 VISIBLE INITIALLY */}
          {!isLoading && unread.length > 0 && (
            <div
              className="overflow-y-auto pr-1"
              style={{
                maxHeight: "120px", // ~ first 2 items height
                scrollbarWidth: "thin",
              }}
            >
              {unread.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => setSelected(n)}
                  className="rounded-md px-2 py-2 flex flex-col items-start cursor-pointer hover:bg-gray-100"
                >
                  <p className="text-sm font-medium truncate w-full">{n.message}</p>
                  <span className="text-xs text-gray-400 mt-1">
                    {n.asset_name && `${n.asset_name} • `}
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notification Modal */}
      {selected && (
        <Dialog open={true} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-md mx-auto p-6 rounded-xl">
            <DialogHeader>
              <h3 className="text-lg font-semibold">Notification</h3>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{selected.message}</p>
              {selected.asset_name && (
                <p className="text-gray-600">
                  <strong>Asset:</strong> {selected.asset_name} ({selected.asset_serial})
                </p>
              )}
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(selected.created_at), { addSuffix: true })}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
