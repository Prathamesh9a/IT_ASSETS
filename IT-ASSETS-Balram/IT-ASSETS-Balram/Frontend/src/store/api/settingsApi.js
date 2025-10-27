import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";



export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Categories", "Departments", "Locations"], // cache identifiers
  endpoints: (builder) => ({
    // ===== Categories =====
    getCategories: builder.query({
      query: () => "/settings/categories/",
      providesTags: ["Categories"],
    }),

    // ===== Departments =====
    getDepartments: builder.query({
      query: () => "/settings/departments/",
      providesTags: ["Departments"],
    }),

    // ===== Locations =====
    getLocations: builder.query({
      query: () => "/settings/locations/",
      providesTags: ["Locations"],
    }),
  }),
});

// ✅ Auto-generated hooks
export const {
  useGetCategoriesQuery,
  useGetDepartmentsQuery,
  useGetLocationsQuery,
} = settingsApi;
