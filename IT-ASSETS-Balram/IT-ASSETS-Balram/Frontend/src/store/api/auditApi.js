import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

const auditApi = createApi({
  reducerPath: "auditApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AuditLogs"], // add tags for cache
  endpoints: (builder) => ({
    // Fetch all logs
    getAuditLogs: builder.query({
      query: () => ({
        url: "/logs/audit-logs/",
        method: "GET",
      }),
      providesTags: ["AuditLogs"], // cache tag
    }),

    // Fetch logs by user ID
    getAuditLogsByUser: builder.query({
      query: (userId) => ({
        url: `/logs/audit-logs/${userId}/`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [{ type: "AuditLogs", id: userId }],
    }),
  }),
});

export const { useGetAuditLogsQuery, useGetAuditLogsByUserQuery } = auditApi;
export default auditApi;
