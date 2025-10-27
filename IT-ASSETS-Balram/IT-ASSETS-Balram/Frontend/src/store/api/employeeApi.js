import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const employeeApi = createApi({
  reducerPath: "employeeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Employees"], // for caching & invalidation
  endpoints: (builder) => ({

    // GET all employees
    getEmployees: builder.query({
      query: () => ({
        url: "/employees/",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Employees", id })), // each employee
              { type: "Employees", id: "LIST" }, // the whole list
            ]
          : [{ type: "Employees", id: "LIST" }],
    }),

    // POST new employee
    addEmployee: builder.mutation({
      query: (data) => ({
        url: "/employees/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Employees", id: "LIST" }], // refresh list after add
    }),

    // POST bulk import employees
    importEmployees: builder.mutation({
      query: (data) => ({
        url: "/employees/import/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Employees", id: "LIST" }], // refresh list after import
    }),

    // GET current user’s employee profile
    getMeEmployee: builder.query({
      query: () => ({
        url: "/employees/me/",
        method: "GET",
      }),
      providesTags: [{ type: "Employees", id: "ME" }], // cached separately
    }),

    // GET employee by ID
    getEmployeeById: builder.query({
      query: (id) => ({
        url: `/employees/${id}/`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Employees", id }],
    }),
    //update employee
updateEmployee: builder.mutation({
  query: ({ id, data }) => ({
    url: `/employees/${id}/`,
    method: "PUT",
    body: data,
  }),
  invalidatesTags: (result, error, { id }) => [
    { type: "Employees", id },       // refresh the updated employee
    { type: "Employees", id: "LIST" } // refresh list
  ],
}),

    // ✅ Assign role to a user
    assignRoleEmployee: builder.mutation({
      query: (payload) => ({
        url: "/users/assign-role/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Employees", id: "LIST" }, { type: "Employees", id: "LIST" }],
    }),
     updateEmployeeActiveStatus: builder.mutation({
      query: ({ employeeId,data }) => ({
        url: `/users/${employeeId}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Employees", id }],
    }),

       deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "UserEmployeess", id },
        { type: "Employees", id: "LIST" },
      ],
    })
  }),
});

// Export hooks
export const {
  useGetEmployeesQuery,
  useAddEmployeeMutation,
  useImportEmployeesMutation,
  useGetMeEmployeeQuery,
  useGetEmployeeByIdQuery,
  useDeleteEmployeeMutation,
  useUpdateEmployeeMutation,
  useUpdateEmployeeActiveStatusMutation,
  useAssignRoleEmployeeMutation 
} = employeeApi;
