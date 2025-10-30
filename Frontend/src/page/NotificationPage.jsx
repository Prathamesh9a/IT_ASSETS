// 📂 src/pages/NotificationPage.jsx
import Header from "@/components/Header";
import Notification from "@/components/Notification";
import React from "react";
import { useGetNotificationsQuery } from "@/store/api/notificationApi";

const NotificationPage = () => {
  const { data = [], isLoading } = useGetNotificationsQuery();

  // Sirf unread notifications
  const unreadNotifications = data.filter((item) => !item.is_read);

  return (
    <>
      <Header
        showNotification={false}
        great={"Notification Settings & History"}
      />
      <div className="px-6 mt-20">
        <h1 className="mt-6 md:mt-5 roboto font-bold text-lg sm:text-xl md:text-2xl">
          Recent Notification
        </h1>

        <div>
          {/* ✅ Loading Skeleton */}
          {isLoading && (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse flex flex-col border p-4 rounded-md shadow-sm w-full mt-5 bg-[#FAFAFA] border-[#E1E1E1] border-l-8 border-l-[#E5E5E5]"
                >
                  <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </>
          )}

          {/* ✅ No Notifications */}
          {!isLoading && unreadNotifications.length === 0 && (
            <div className="flex justify-center items-center min-h-[60vh]">
              <p className="text-gray-500 font-medium roboto">
                No notifications found.
              </p>
            </div>
          )}

          {/* ✅ Notifications */}
          {!isLoading &&
            unreadNotifications.length > 0 &&
            unreadNotifications.map((item) => (
              <Notification
                key={item.id}
                title={item.actor_name}
                message={item.message}
                type={item.notification_type}
                time={new Date(item.created_at).toLocaleString()}
                details={{
                  type: item.notification_type,
                }}
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default NotificationPage;
