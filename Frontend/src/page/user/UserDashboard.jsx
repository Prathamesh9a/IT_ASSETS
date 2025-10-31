// src/pages/user/UserDashboard.jsx
import Header from "@/components/Header";
import NavigationTabs from "@/components/NavigationTabs";
import StatusButton from "@/components/StatusButoon";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGetmyAssetsQuery,
  useGetPendingRequestsQuery,
} from "@/store/api/assetsApi";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Dynamic BASE_URL from .env
const BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL || "http://127.0.0.1:8000";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const {
    data: myAssetsData,
    isLoading: myAssetsIsLoading,
  } = useGetmyAssetsQuery();

  const {
    data: pendingRequests = [],
    isLoading: requestsLoading,
    isError: requestsError,
    error: requestError,
  } = useGetPendingRequestsQuery();

  const tabs = ["My Assets", "Requests", "Notifications"];
  const [activeTab, setActiveTab] = useState("My Assets");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "Notifications") {
      navigate("/notification");
    }
  };

  const sortedAssets = myAssetsData
    ? [...myAssetsData].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )
    : [];

  // Safe image URL builder
  const getImageUrl = (asset) => {
    if (!asset?.images?.[0]?.image) {
      return "https://placehold.co/60x60?text=NA";
    }
    const path = asset.images[0].image;
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return (
    <>
      <Header
        great=""
        userName={user?.username}
        dept="Engineering Dept"
        showNotification={true}
      />
      <div className="px-4 mt-14 text-sm">
        <NavigationTabs tabs={tabs} onTabChange={handleTabChange} />

        {/* ================== MY ASSETS TAB ================== */}
        {activeTab === "My Assets" && (
          <>
            <h1 className="mt-5 md:mt-8 roboto font-bold text-lg sm:text-xl md:text-2xl">
              My Assigned Assets
            </h1>
            <div className="overflow-x-auto pb-2 border-b-[1.5px] border-b-[#E1E1E1] my-4 md:my-6">
              <div className="max-h-[380px] overflow-y-auto border border-gray-200 rounded-md text-xs">
                <table className="w-full min-w-max">
                  <thead className="bg-[#000C63] text-white text-xs md:text-sm">
                    <tr>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r border-r-[#EAECF0] text-center p-2 roboto font-medium">
                        Image
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r border-r-[#EAECF0] text-center p-2 roboto font-medium">
                        Asset ID
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r border-r-[#EAECF0] text-center p-2 roboto font-medium">
                        Type
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r border-r-[#EAECF0] text-center p-2 roboto font-medium">
                        Name
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r border-r-[#EAECF0] text-center p-2 roboto font-medium">
                        Status
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r border-r-[#EAECF0] text-center p-2 roboto font-medium">
                        Assigned On
                      </th>
                      <th className="sticky top-0 z-20 rounded-tr-md bg-[#000C63] text-center p-2 roboto font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {myAssetsIsLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr
                          key={i}
                          className={`border-b border-gray-200 ${i % 2 === 0 ? "bg-gray-50" : ""}`}
                        >
                          <td className="p-2 text-center border-r border-r-[#EAECF0]">
                            <Skeleton className="h-12 w-12 mx-auto rounded-full" />
                          </td>
                          <td className="p-2 text-center border-r border-r-[#EAECF0]">
                            <Skeleton className="h-5 w-12 mx-auto" />
                          </td>
                          <td className="p-2 text-center border-r border-r-[#EAECF0]">
                            <Skeleton className="h-5 w-16 mx-auto" />
                          </td>
                          <td className="p-2 text-center border-r border-r-[#EAECF0]">
                            <Skeleton className="h-5 w-20 mx-auto" />
                          </td>
                          <td className="p-2 text-center border-r border-r-[#EAECF0]">
                            <Skeleton className="h-5 w-14 mx-auto" />
                          </td>
                          <td className="p-2 text-center border-r border-r-[#EAECF0]">
                            <Skeleton className="h-5 w-20 mx-auto" />
                          </td>
                          <td className="p-2 text-center">
                            <Skeleton className="h-8 w-16 mx-auto rounded-full" />
                          </td>
                        </tr>
                      ))
                    ) : myAssetsData?.length > 0 ? (
                      sortedAssets.map((item, i) => (
                        <tr
                          key={i}
                          className={`border-b border-gray-200 ${i % 2 === 0 ? "bg-gray-50" : ""}`}
                        >
                          {/* IMAGE */}
                          <td className="p-2 text-center border-r border-r-[#EAECF0]">
                            <img
                              src={getImageUrl(item)}
                              alt={item?.product_name}
                              className="h-12 w-12 mx-auto rounded-full object-cover border border-gray-300"
                              onError={(e) => {
                                e.target.src = "https://placehold.co/60x60?text=NA";
                              }}
                            />
                          </td>
                          <td className="whitespace-nowrap text-center p-2 border-r border-r-[#EAECF0] text-xs roboto font-normal">
                            {item?.id}
                          </td>
                          <td className="whitespace-nowrap text-center p-2 border-r border-r-[#EAECF0] text-xs roboto font-normal">
                            {item?.asset_type_name}
                          </td>
                          <td className="whitespace-nowrap text-center p-2 border-r border-r-[#EAECF0] text-xs roboto font-normal">
                            {item?.product_name}
                          </td>
                          <td className="whitespace-nowrap text-center p-2 border-r border-r-[#EAECF0] text-xs roboto font-normal">
                            <div className="flex justify-center">
                              <StatusButton status={item?.status} />
                            </div>
                          </td>
                          <td className="whitespace-nowrap text-center p-2 border-r border-r-[#EAECF0] text-xs roboto font-normal">
                            {new Date(item?.created_at).toLocaleDateString("en-gb", {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                            })}
                          </td>
                          <td className="whitespace-nowrap text-center p-2 text-xs roboto font-normal">
                            <div className="flex justify-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button className="px-4 py-1.5 text-xs rounded-full bg-[#F45E60] hover:bg-[#f82e32] border border-[#F45E60] roboto font-medium">
                                    Actions
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="border-none text-xs">
                                  {["Surrender", "Transfer", "Maintenance", "Renew"].map((act) => (
                                    <DropdownMenuItem
                                      key={act}
                                      className="cursor-pointer"
                                      onClick={() =>
                                        navigate(
                                          `/assetsRequest?action=assetsRequest&id=${encodeURIComponent(item.id)}`
                                        )
                                      }
                                    >
                                      {act}
                                    </DropdownMenuItem>
                                  ))}
                                  {["Damaged", "Expired"].map((act) => (
                                    <DropdownMenuItem
                                      key={act}
                                      className="cursor-pointer"
                                      onClick={() =>
                                        navigate(
                                          `/assetsRequest?action=reportIssue&id=${encodeURIComponent(item.id)}`
                                        )
                                      }
                                    >
                                      {act}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center p-5 text-gray-500 text-xs roboto">
                          No assets found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ================== PENDING REQUESTS TAB ================== */}
        {activeTab === "Requests" && (
          <>
            <h1 className="mt-5 md:mt-8 roboto font-bold text-lg sm:text-xl md:text-2xl">
              Pending Requests
            </h1>
            <div className="overflow-x-auto pb-2 border-b-[1.5px] border-b-[#E1E1E1] my-4 md:my-6">
              <div className="max-h-[380px] overflow-y-auto border border-gray-200 rounded-md text-xs">
                <table className="w-full min-w-max">
                  <thead className="bg-[#000C63] text-white text-xs md:text-sm">
                    <tr>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r border-r-[#EAECF0] text-center p-2 roboto font-medium">
                        Image
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r border-r-[#EAECF0] text-center p-2 roboto font-medium">
                        Asset ID
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r border-r-[#EAECF0] text-center p-2 roboto font-medium">
                        Type
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r border-r-[#EAECF0] text-center p-2 roboto font-medium">
                        Name
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r border-r-[#EAECF0] text-center p-2 roboto font-medium">
                        Request Type
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r border-r-[#EAECF0] text-center p-2 roboto font-medium">
                        Requested On
                      </th>
                      <th className="sticky top-0 z-20 rounded-tr-md bg-[#000C63] text-center p-2 roboto font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestsLoading ? (
                      [...Array(3)].map((_, i) => (
                        <tr
                          key={i}
                          className={`border-b border-gray-200 ${i % 2 === 0 ? "bg-gray-50" : ""}`}
                        >
                          <td className="p-2 text-center border-r border-r-[#EAECF0]">
                            <Skeleton className="h-12 w-12 mx-auto rounded-full" />
                          </td>
                          <td className="p-2 text-center border-r border-r-[#EAECF0]">
                            <Skeleton className="h-5 w-12 mx-auto" />
                          </td>
                          <td className="p-2 text-center border-r border-r-[#EAECF0]">
                            <Skeleton className="h-5 w-16 mx-auto" />
                          </td>
                          <td className="p-2 text-center border-r border-r-[#EAECF0]">
                            <Skeleton className="h-5 w-20 mx-auto" />
                          </td>
                          <td className="p-2 text-center border-r border-r-[#EAECF0]">
                            <Skeleton className="h-5 w-20 mx-auto" />
                          </td>
                          <td className="p-2 text-center border-r border-r-[#EAECF0]">
                            <Skeleton className="h-5 w-18 mx-auto" />
                          </td>
                          <td className="p-2 text-center">
                            <Skeleton className="h-5 w-14 mx-auto" />
                          </td>
                        </tr>
                      ))
                    ) : requestsError ? (
                      <tr>
                        <td colSpan="7" className="text-center p-5">
                          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-xs roboto">
                            <strong>Error:</strong> {requestError?.data?.detail || "Failed to load requests."}
                          </div>
                        </td>
                      </tr>
                    ) : pendingRequests.length > 0 ? (
                      pendingRequests.map((req, i) => (
                        <tr
                          key={req.id}
                          className={`border-b border-gray-200 ${i % 2 === 0 ? "bg-gray-50" : ""}`}
                        >
                          {/* IMAGE */}
                          <td className="p-2 text-center border-r border-r-[#EAECF0]">
                            <img
                              src={getImageUrl(req.asset)}
                              alt={req.asset?.product_name}
                              className="h-12 w-12 mx-auto rounded-full object-cover border border-gray-300"
                              onError={(e) => {
                                e.target.src = "https://placehold.co/60x60?text=NA";
                              }}
                            />
                          </td>
                          <td className="p-2 text-center border-r border-r-[#EAECF0] text-xs roboto font-normal">
                            {req.asset?.id}
                          </td>
                          <td className="p-2 text-center border-r border-r-[#EAECF0] text-xs roboto font-normal">
                            {req.asset?.asset_type_name}
                          </td>
                          <td className="p-2 text-center border-r border-r-[#EAECF0] text-xs roboto font-normal">
                            {req.asset?.product_name}
                          </td>
                          <td className="p-2 text-center border-r border-r-[#EAECF0] text-xs roboto font-normal">
                            <span className="capitalize">
                              {req.status.replace("_requested", "").replace("_", " ")}
                            </span>
                          </td>
                          <td className="p-2 text-center border-r border-r-[#EAECF0] text-xs roboto font-normal">
                            {new Date(req.assigned_date).toLocaleDateString("en-gb", {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                            })}
                          </td>
                          <td className="p-2 text-center">
                            <StatusButton status="Pending" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center p-5 text-gray-500 text-xs roboto">
                          No pending requests.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ================== QUICK ACTIONS ================== */}
        <h1 className="roboto font-bold text-lg sm:text-xl md:text-2xl mt-6">
          Quick Actions
        </h1>
        <div className="flex flex-wrap gap-3 justify-start my-3">
          <Button
            onClick={() => navigate("/assetsRequest?action=assetsRequest")}
            className="min-w-[140px] rounded-full py-2 px-4 text-sm md:text-base text-white bg-[#000C63] hover:bg-[#8A5CFF] roboto font-medium"
          >
            Request Asset
          </Button>
          <Button
            onClick={() => navigate("/assetsRequest?action=reportIssue")}
            className="min-w-[140px] rounded-full py-2 px-4 text-sm md:text-base text-white bg-[#000C63] hover:bg-[#8A5CFF] roboto font-medium"
          >
            Report Issue
          </Button>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;