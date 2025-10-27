// src/services/authApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({ url: "/auth/login/", method: "POST", body }),
    }),
    getProfile: builder.query({
      query: () => "/auth/me/",
    }),
      ssoLogin: builder.mutation({
      query: (body) => ({
        url: "/auth/sso-login/",
        method: "POST",
        body,
      }),
    }),
     logoutServer: builder.mutation({
      query: () => ({
        url: "/auth/logout/",
        method: "POST", // tu ne bola yaha POST hai
        body: {}, // agar body nahi chahi to empty
      }),
    }),
  }),
});

export const { useLoginMutation,useSsoLoginMutation, useGetProfileQuery,useLazyGetProfileQuery,useLogoutServerMutation } = authApi;
