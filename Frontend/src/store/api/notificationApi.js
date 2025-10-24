import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Notifications"], // enable caching with tags
  endpoints: (builder) => ({
    // GET /notifications/
    getNotifications: builder.query({
      query: () => ({
        url: "/notifications/",
        method: "GET",  
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Notifications", id })),
              { type: "Notifications", id: "LIST" },
            ]
          : [{ type: "Notifications", id: "LIST" }],
    }),

    // POST /notifications/mark-all-read/
    markAllRead: builder.mutation({
      query: () => ({
        url: "/notifications/mark-all-read/",
        method: "POST",
      }),
      invalidatesTags: [{ type: "Notifications", id: "LIST" }], // refetch list after marking all read
    }),
  }),
});

// Export hooks
export const {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
} = notificationApi;
