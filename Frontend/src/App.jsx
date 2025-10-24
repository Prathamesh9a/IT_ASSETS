import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Login from "./page/Login";
import { useDispatch, useSelector } from "react-redux";
import UserDashboard from "./page/user/UserDashboard";
import { useEffect } from "react";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";
import { loginSuccess } from "./store/Slice/authSlice"; // make sure this path is correct
import SuperAdminDashboard from "./page/superAdmin/SuperAdminDashboard";
import AdminDashboard from "./page/admin/AdminDashboard";
import SubmitAssetsRequest from "./page/user/SubmitAssetsRequest";
import AddNewAsset from "./page/superAdmin/AddNewAsset";
import { useLazyGetProfileQuery } from "./store/api/authApi";
import AssetsAssignmentManagement from "./page/admin/AssetsAssignmentManagement";
import SystemAuditTrail from "./page/admin/SystemAuditTrail";
import NotificationPage from "./page/NotificationPage";
import RepairRequest from "./page/RepairRequest";
import AssetTransferWorkFlow from "./page/AssetTransferWorkFlow";
import ReportsAndAnalytics from "./page/ReportsAndAnalytics";
import AddEmployee from "./page/superAdmin/AddEmployee";
import { NotificationToaster } from "./components/NotificationToaster";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicOnlyRoute>
        {" "}
        <Login />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/userDashboard",
    element: (
      <ProtectedRoute role="user">
        <UserDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/assetsRequest",
    element: (
      <ProtectedRoute role="user">
        <SubmitAssetsRequest />
      </ProtectedRoute>
    ),
  },
  {
    path: "/adminDashboard",
    element: (
      <ProtectedRoute role="admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/assestAssingment",
    element: (
      <ProtectedRoute role="admin">
        <AssetsAssignmentManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/systemAuditTrail",
    element: (
      <ProtectedRoute role="admin">
        <SystemAuditTrail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/superAdminDashboard",
    element: (
      <ProtectedRoute role="super_admin">
        <SuperAdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/addAssets",
    element: (
      <ProtectedRoute role="super_admin">
        <AddNewAsset />
      </ProtectedRoute>
    ),
  },
  {
    path: "/addEmployee",
    element: (
      <ProtectedRoute role="super_admin">
        <AddEmployee />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notification",
    element: <NotificationPage />,
  },
  {
    path: "/requestDetailsProcessing",
    element: <RepairRequest />,
  },
  {
    path: "/assetTransferFlow",
    element: <AssetTransferWorkFlow />,
  },
  {
    path: "/systemreportanalytics",
    element: <ReportsAndAnalytics />,
  },
]);

function App() {
  const dispatch = useDispatch();
  const { user: data } = useSelector((state) => state.auth);

  const [getProfile] = useLazyGetProfileQuery();

  useEffect(() => {
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    if (token && role && username) {
      // First, immediately restore from localStorage to prevent logout flash
      dispatch(loginSuccess({ role, username }));

      // Then fetch latest user profile
      const fetchUserProfile = async () => {
        try {
          const user = await getProfile().unwrap();
          // Merge fetched data with role from localStorage (since /me doesn’t send it)
          dispatch(loginSuccess({ ...user, role }));
        } catch (error) {
          // Optional: clear if token invalid
          // localStorage.clear();
          console.error("Failed to fetch user profile", error);
        }
      };

      fetchUserProfile();
    }
  }, [dispatch]);

  return (
    <>
      <RouterProvider router={router} />
      <NotificationToaster />
    </>
  );
}

export default App;
