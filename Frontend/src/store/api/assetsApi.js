// src/store/api/assetsApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const assetsApi = createApi({
  reducerPath: "assetsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Assets"],
  endpoints: (builder) => ({
    getAssets: builder.query({
      query: () => "/assets/",
      providesTags: ["Assets"],
    }),
    getAssignedList: builder.query({
      query: () => "/assets/assigned/list/",
      providesTags: ["Assets"],
    }),
    getDashboardSummary: builder.query({
      query: () => "/assets/dashboard/summary/",
      providesTags: ["Assets"],
    }),
    getAssetById: builder.query({
      query: (id) => `/assets/${id}/`,
      providesTags: ["Assets"],
    }),
    getAssetType: builder.query({
      query: () => `/assets/asset-types/`,
      providesTags: ["Assets"],
    }),
    getAssetLogs: builder.query({
      query: () => `/assets/assets/logs/`,
      providesTags: ["Assets"],
    }),

    createAsset: builder.mutation({
      query: (body) => ({
        url: "/assets/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Assets"],
    }),

    updateAsset: builder.mutation({
      query: ({ id, data }) => ({
        url: `/assets/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Assets"],
    }),
    deleteAsset: builder.mutation({
      query: (id) => ({
        url: `/assets/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assets"],
    }),
    assignAsset: builder.mutation({
      query: (data) => ({
        url: `/assets/assign/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Assets"],
    }),
    reqTransfer: builder.mutation({
      query: (data) => ({
        url: `/assets/reqTransfer/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Assets"],
    }),
    requestAction: builder.mutation({
      query: (data) => ({
        url: `/assets/request/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Assets"],
    }),
    getmyAssets: builder.query({
      query: () => "/assets/my-assets/",
      providesTags: ["Assets"],
    }),
    getAssetStatusSummary: builder.query({
      query: () => "/assets/status-summary/",
      providesTags: ["Assets"],
    }),

    createAssetByForm: builder.mutation({
      query: (assetData) => {
        const formData = new FormData();
        Object.entries(assetData).forEach(([key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            key !== "images"
          ) {
            formData.append(key, value);
          }
        });
        if (assetData.images && Array.isArray(assetData.images)) {
          assetData.images.forEach((file) => formData.append("images", file));
        }
        return {
          url: "/assets/create/",
          method: "POST",
          body: formData,
        };
      },
    }),

    uploadAssetImage: builder.mutation({
      query: ({ id, data }) => ({
        url: `/assets/${id}/upload-images/`,
        method: "POST",
        body: data,
        headers: {},
      }),
      invalidatesTags: ["Assets"],
    }),
    assetApproveRejectForTransferByAdmin: builder.mutation({
      query: (data) => ({
        url: `/assets/appr-rej-transfer/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Assets"],
    }),
    approveAssetRequestByAdmin: builder.mutation({
      query: (data) => ({
        url: `/assets/approve/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Assets"],
    }),
    rejectAssetRequestByAdmin: builder.mutation({
      query: (data) => ({
        url: `/assets/reject/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Assets"],
    }),
    importAssets: builder.mutation({
      query: (data) => ({
        url: `/assets/import/`,
        method: "POST",
        body: data,
        headers: {},
      }),
      invalidatesTags: ["Assets"],
    }),
    getPendingAssets: builder.query({
      query: () => "/assets/pending/",
      providesTags: ["Assets"],
    }),
    decideAssetRequest: builder.mutation({
      query: (data) => ({
        url: `/assets/requests/decision/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Assets"],
    }),
    getPendingRequests: builder.query({
      query: () => "/assets/assets/requests/pending/user/",
      providesTags: ["Assets"],
    }),

    // NEW: Revoke (Unassign) Asset
    revokeAsset: builder.mutation({
      query: (data) => ({
        url: "/assets/revoke/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Assets"],
    }),
  }),
});

export const {
  useGetAssetsQuery,
  useGetAssignedListQuery,
  useGetDashboardSummaryQuery,
  useGetAssetByIdQuery,
  useGetAssetTypeQuery,
  useGetAssetLogsQuery,
  useCreateAssetMutation,
  useCreateAssetByFormMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useUploadAssetImageMutation,
  useAssignAssetMutation,
  useReqTransferMutation,
  useRequestActionMutation,
  useGetmyAssetsQuery,
  useGetAssetStatusSummaryQuery,
  useAssetApproveRejectForTransferByAdminMutation,
  useApproveAssetRequestByAdminMutation,
  useRejectAssetRequestByAdminMutation,
  useImportAssetsMutation,
  useGetPendingAssetsQuery,
  useDecideAssetRequestMutation,
  useGetPendingRequestsQuery,
  useRevokeAssetMutation, // NEW HOOK
} = assetsApi;
