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

const BASE_URL = ""; // Set to your backend base if needed, e.g., "http://127.0.0.1:8000"

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

  return (
    <>
      <Header
        great="Welcome"
        userName={user?.username}
        dept="Engineering Dept"
        showNotification={true}
      />
      <div className="px-6 mt-16">
        <NavigationTabs tabs={tabs} onTabChange={handleTabChange} />

        {/* ================== MY ASSETS TAB ================== */}
        {activeTab === "My Assets" && (
          <>
            <h1 className="mt-6 md:mt-10 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
              My Assigned Assets
            </h1>
            <div className="overflow-x-auto pb-3 border-b-[2px] border-b-[#E1E1E1] my-6 md:mt-9">
              <div className="max-h-[400px] md:max-h-[440px] overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full min-w-max overflow-x-auto">
                  <thead className="bg-[#000C63] text-white font-medium">
                    <tr>
                      {/* <th className="sticky top-0 z-20 rounded-tl-[12px] border-r-[1px] border-r-[#EAECF0] bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Asset Image
                      </th> */}
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Asset ID
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Type
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Name
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Status
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Assigned On
                      </th>
                      <th className="sticky top-0 z-20 rounded-tr-[12px] bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {myAssetsIsLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr
                          key={i}
                          className={`border-b border-gray-200 ${
                            i % 2 === 0 ? "bg-gray-100" : ""
                          }`}
                        >
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-20 w-20 mx-auto rounded-md" />
                          </td>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-6 w-16 mx-auto" />
                          </td>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-6 w-24 mx-auto" />
                          </td>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-6 w-20 mx-auto" />
                          </td>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-6 w-20 mx-auto" />
                          </td>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-6 w-28 mx-auto" />
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-2">
                              <Skeleton className="h-10 w-20 rounded-full" />
                              <Skeleton className="h-10 w-20 rounded-full" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : myAssetsData?.length > 0 ? (
                      sortedAssets.map((item, i) => (
                        <tr
                          key={i}
                          className={`border-b border-gray-200 ${
                            i % 2 === 0 ? "bg-gray-100" : ""
                          }`}
                        >
                          {/* <td className="whitespace-nowrap flex items-center justify-center text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            <img
                              src={
                                item?.images?.[0]?.image
                                  ? `${BASE_URL}${item.images[0].image}`
                                  : "https://placehold.co/100x100"
                              }
                              alt={item?.product_name || "Asset"}
                              className="h-20 mx-auto rounded-md"
                            />
                          </td> */}
                          <td className="whitespace-nowrap text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            {item?.id}
                          </td>
                          <td className="whitespace-nowrap text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            {item?.asset_type_name}
                          </td>
                          <td className="whitespace-nowrap text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            {item?.product_name}
                          </td>
                          <td className="whitespace-nowrap text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            <div className="flex justify-center">
                              <StatusButton status={item?.status} />
                            </div>
                          </td>
                          <td className="whitespace-nowrap text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            {new Date(item?.created_at).toLocaleDateString("en-gb", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                            <div className="flex gap-2 justify-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button className="px-6 py-2 rounded-full bg-[#F45E60] hover:bg-[#f82e32] border border-[#F45E60] text-base roboto font-semibold cursor-pointer">
                                    Actions
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="border-none">
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      navigate(
                                        `/assetsRequest?action=assetsRequest&id=${encodeURIComponent(item.id)}`
                                      )
                                    }
                                  >
                                    Surrender
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      navigate(
                                        `/assetsRequest?action=assetsRequest&id=${encodeURIComponent(item.id)}`
                                      )
                                    }
                                  >
                                    Transfer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      navigate(
                                        `/assetsRequest?action=assetsRequest&id=${encodeURIComponent(item.id)}`
                                      )
                                    }
                                  >
                                    Maintenance
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      navigate(
                                        `/assetsRequest?action=assetsRequest&id=${encodeURIComponent(item.id)}`
                                      )
                                    }
                                  >
                                    Renew
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      navigate(
                                        `/assetsRequest?action=reportIssue&id=${encodeURIComponent(item.id)}`
                                      )
                                    }
                                  >
                                    Damaged
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      navigate(
                                        `/assetsRequest?action=reportIssue&id=${encodeURIComponent(item.id)}`
                                      )
                                    }
                                  >
                                    Expired
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center p-6 text-gray-500 roboto">
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
            <h1 className="mt-6 md:mt-10 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
              Pending Requests
            </h1>
            <div className="overflow-x-auto pb-3 border-b-[2px] border-b-[#E1E1E1] my-6 md:mt-9">
              <div className="max-h-[400px] md:max-h-[440px] overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full min-w-max overflow-x-auto">
                  <thead className="bg-[#000C63] text-white font-medium">
                    <tr>
                      {/* <th className="sticky top-0 z-20 rounded-tl-[12px] border-r-[1px] border-r-[#EAECF0] bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Asset Image
                      </th> */}
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Asset ID
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Type
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Name
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Request Type
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Requested On
                      </th>
                      <th className="sticky top-0 z-20 rounded-tr-[12px] bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestsLoading ? (
                      [...Array(3)].map((_, i) => (
                        <tr
                          key={i}
                          className={`border-b border-gray-200 ${
                            i % 2 === 0 ? "bg-gray-100" : ""
                          }`}
                        >
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-20 w-20 mx-auto rounded-md" />
                          </td>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-6 w-16 mx-auto" />
                          </td>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-6 w-24 mx-auto" />
                          </td>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-6 w-32 mx-auto" />
                          </td>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-6 w-28 mx-auto" />
                          </td>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-6 w-24 mx-auto" />
                          </td>
                          <td className="p-3 text-center">
                            <Skeleton className="h-6 w-20 mx-auto" />
                          </td>
                        </tr>
                      ))
                    ) : requestsError ? (
                      <tr>
                        <td colSpan="7" className="text-center p-6">
                          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg roboto text-sm">
                            <strong>Error:</strong> {requestError?.data?.detail || "Failed to load requests."}
                          </div>
                        </td>
                      </tr>
                    ) : pendingRequests.length > 0 ? (
                      pendingRequests.map((req, i) => (
                        <tr
                          key={req.id}
                          className={`border-b border-gray-200 ${
                            i % 2 === 0 ? "bg-gray-100" : ""
                          }`}
                        >
                          {/* ASSET IMAGE – SAME AS MY ASSETS */}
                          {/* <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0]">
                            <img
                              src={
                                req.asset?.images?.[0]?.image
                                  ? `${BASE_URL}${req.asset.images[0].image}`
                                  : "https://placehold.co/100x100"
                              }
                              alt={req.asset?.product_name || "Asset"}
                              className="h-20 mx-auto rounded-md"
                            />
                          </td> */}
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            {req.asset?.id}
                          </td>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            {req.asset?.asset_type_name}
                          </td>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            {req.asset?.product_name}
                          </td>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            <span className="capitalize">
                              {req.status.replace("_requested", "").replace("_", " ")}
                            </span>
                          </td>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            {new Date(req.assigned_date).toLocaleDateString("en-gb", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-3 text-center">
                            <StatusButton status="Pending" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center p-6 text-gray-500 roboto">
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
        <h1 className="roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
          Quick Actions
        </h1>
        <div className="flex-wrap flex gap-4 justify-self-start sm:justify-center sm:items-center my-3">
          <Button
            onClick={() => navigate("/assetsRequest?action=assetsRequest")}
            className="flex-shrink-0 min-w-[185px] rounded-full py-2.5 px-5 poppins-medium md:text-xl text-base text-white cursor-pointer bg-[#000C63] hover:bg-[#8A5CFF]"
          >
            Request Asset
          </Button>
          <Button
            onClick={() => navigate("/assetsRequest?action=reportIssue")}
            className="flex-shrink-0 min-w-[185px] rounded-full py-2.5 px-5 poppins-medium md:text-xl text-base text-white cursor-pointer bg-[#000C63] hover:bg-[#8A5CFF]"
          >
            Report Issue
          </Button>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;