import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Users", "Roles"], // caching tags
  endpoints: (builder) => ({
    // ✅ Get all users
    getUsers: builder.query({
      query: () => "/users/",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Users", id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    // ✅ Create new user
    createUser: builder.mutation({
      query: (newUser) => ({
        url: "/users/",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    // ✅ Assign role to a user
    assignRole: builder.mutation({
      query: (payload) => ({
        url: "/users/assign-role/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }, { type: "Roles", id: "LIST" }],
    }),

    // ✅ Get all roles
    getRoles: builder.query({
      query: () => "/users/roles/",
      providesTags: [{ type: "Roles", id: "LIST" }],
    }),

    // ✅ Update user
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Users", id }],
    }),

    // ✅ Delete user
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),
  }),
});

// Auto-generated hooks
export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useAssignRoleMutation,
  useGetRolesQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
