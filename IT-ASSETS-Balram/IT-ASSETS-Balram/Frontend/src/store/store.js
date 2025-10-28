
import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi"
import authSlice from "./Slice/authSlice"
import { assetsApi } from "./api/assetsApi";
import { settingsApi } from "./api/settingsApi";
import { userApi } from "./api/userApi";
import { employeeApi } from "./api/employeeApi";
import { notificationApi } from "./api/notificationApi";
import modalSlice  from "./Slice/modalBulkImportEmployeeSlice"
import auditApi from "./api/auditApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
     [assetsApi.reducerPath]: assetsApi.reducer,
     [settingsApi.reducerPath]: settingsApi.reducer,
     [userApi.reducerPath]:userApi.reducer,
     [employeeApi.reducerPath]:employeeApi.reducer,
     [notificationApi.reducerPath]:notificationApi.reducer,
     [auditApi.reducerPath]:auditApi.reducer,
    auth:authSlice,
    modal:modalSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware,assetsApi.middleware,settingsApi.middleware,userApi.middleware,employeeApi.middleware,notificationApi.middleware,auditApi.middleware),
});
