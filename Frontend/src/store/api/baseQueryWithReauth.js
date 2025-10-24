import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, loginSuccess } from "../Slice/authSlice";

const baseUrl = import.meta.env.VITE_BASE_URL;

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("access");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

// The rest of your code remains same ✅

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  const skipRefreshFor = ["auth/logout/", "auth/login/"];

  // Determine the request URL safely
  const requestUrl = typeof args === "string" ? args : args.url;
  //   console.log("Requesting:", requestUrl);
  //   console.log("Args:", args);

  let result = await baseQuery(args, api, extraOptions);

  // Check if the error indicates an invalid or expired access token
  const is401 =
    result.error &&
    (result.error.status === 401 ||
      result.error.originalStatus === 401 ||
      result.error?.data?.code === "token_not_valid" ||
      (typeof result.error?.data?.detail === "string" &&
        result.error.data.detail.toLowerCase().includes("token is invalid")));

  if (is401 && !skipRefreshFor.some((url) => requestUrl.includes(url))) {
    const refresh = localStorage.getItem("refresh");
    // console.log("Access token invalid. Refresh token:", refresh);

    if (refresh) {
      const refreshResult = await baseQuery(
        {
          url: "auth/token/refresh/",
          method: "POST",
          body: { refresh },
        },
        api,
        extraOptions
      );

      if (refreshResult.data?.access) {
        // console.log("New access token obtained:", refreshResult.data.access);

        // Update localStorage
        localStorage.setItem("access", refreshResult.data.access);
        if (refreshResult.data.refresh) {
          localStorage.setItem("refresh", refreshResult.data.refresh);
        }

        // Update Redux state
        api.dispatch(
          loginSuccess({
            access: refreshResult.data.access,
            refresh: refreshResult.data.refresh || refresh,
          })
        );

        // Retry the original query with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        console.warn("Refresh token invalid or expired. Logging out.");
        api.dispatch(logout());
        localStorage.clear();
      }
    } else {
      console.warn("No refresh token found. Logging out.");
      api.dispatch(logout());
      localStorage.clear();
    }
  }

  return result;
};
