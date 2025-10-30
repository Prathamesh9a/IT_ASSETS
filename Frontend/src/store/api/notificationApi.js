// src/store/api/notificationApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    // GET /api/v1/assets/notifications/
    getNotifications: builder.query({
      query: () => "/assets/notifications/",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Notifications", id })),
              { type: "Notifications", id: "LIST" },
            ]
          : [{ type: "Notifications", id: "LIST" }],
    }),

    // POST /api/v1/assets/notifications/mark-all-read/
    markAllRead: builder.mutation({
      query: () => ({
        url: "/assets/notifications/mark-all-read/",
        method: "POST",
      }),
      invalidatesTags: [{ type: "Notifications", id: "LIST" }],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkAllReadMutation } = notificationApi;