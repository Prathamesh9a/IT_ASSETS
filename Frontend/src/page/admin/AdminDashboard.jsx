import Header from "@/components/Header";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import NavigationTab from "@/components/NavigationTabs";
import Card from "@/components/Card";
import CardIcon1 from "@/components/icons/CardIcon1";
import CardIcon2 from "@/components/icons/CardIcon2";
import CardIcon3 from "@/components/icons/CardIcon3";
import CardIcon4 from "@/components/icons/CardIcon4";
import assetImage from "/images/assetImage.png";
import StatusButton from "@/components/StatusButoon";
import {
  useApproveAssetRequestByAdminMutation,
  useAssetApproveRejectForTransferByAdminMutation,
  useGetAssetsQuery,
  useGetPendingAssetsQuery,
  useRejectAssetRequestByAdminMutation,
  useDecideAssetRequestMutation,
} from "@/store/api/assetsApi";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { toast } from "sonner";
import SuperAdminDashboard from "../superAdmin/SuperAdminDashboard";
import DashboardTable from "./DashboardTable";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const cardName = [
  "Pending Request",
  "Total Assets",
  "Assigned Assets",
  "Under Repair",
];
const tabs = [
  "Dashboard",
  "Pending Request",
  "Assets Assignment",
  "Audit Trail",
];
const svgMap = {
  assetsSvg1: CardIcon1,
  assetsSvg2: CardIcon2,
  assetsSvg3: CardIcon3,
  assetsSvg4: CardIcon4,
};
const iconKeys = ["assetsSvg1", "assetsSvg2", "assetsSvg3", "assetsSvg4"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [assetApproveRejectForTransferByAdmin] =
    useAssetApproveRejectForTransferByAdminMutation();
  const [approveAssetRequestByAdmin] = useApproveAssetRequestByAdminMutation();
  const [rejectAssetRequestByAdmin] = useRejectAssetRequestByAdminMutation();
  const [decideAssetRequest] = useDecideAssetRequestMutation();
  const { data: pendingAssets, isLoading: pendingAssetsIsLoading } =
    useGetPendingAssetsQuery();
  console.log(pendingAssets);

  const { data: getAsset, isLoading: getAssetIsLoading } = useGetAssetsQuery();
  const assignedAssets = (getAsset || []).filter(
    (asset) => asset?.status?.toLowerCase() === "assigned"
  );
  const [isRoleOverlay, setIsRoleOverlay] = useState(false);

  const counts = [
    pendingAssets?.length,
    getAsset?.length,
    assignedAssets.length,
    5,
  ];
  const loadings = [false, getAssetIsLoading, getAssetIsLoading, false];

  const [activeTab, setActiveTab] = useState(tabs[0]); // default: Overview
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Call API depending on the tab
    if (tab === "Dashboard") {
      console.log("Dashboard");
    } else if (tab === "Pending Request") {
      console.log("Pending Request");
    } else if (tab === "Assets Assignment") {
      navigate("/assestAssingment");
    } else if (tab === "Audit Trail") {
      navigate("/systemAuditTrail");
    }
  };

  const [rejectReason, setRejectReason] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  // Approve/Reject button click
  const handelClick = (item, action) => {
    if (action === "reject") {
      setIsRoleOverlay(true);
      setSelectedAction("reject");
      setSelectedItem(item);
    } else {
      handleSubmit(item, "approve");
    }
  };
  // Final API call
  const handleSubmit = async (item = selectedItem, action = selectedAction) => {
    try {
      let response;
      // Use the new decision endpoint for both approve and reject
      response = await decideAssetRequest({
        assignment_id: item.id,
        action,
        ...(action === "reject" ? { reason: rejectReason } : {}),
      }).unwrap();

      // Reset
      setIsRoleOverlay(false);
      setRejectReason("");
      setSelectedItem(null);
      setSelectedAction(null);

      // ✅ Success toast
      toast.success(
        response?.detail || `Request ${action}d successfully.`
      );
    } catch (error) {
      console.error(error);
      // ❌ Error toast
      toast.error(error?.data?.detail || "Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Header
        great={"Welcome"}
        userName={user?.role}
        dept={"(IT Department)"}
        showNotification={true}
      />{" "}
      {isRoleOverlay && (
        <div className="fixed z-[3000] flex justify-center items-center inset-0 bg-black/70 h-screen w-full px-2">
          <div className="relative bg-white rounded-[20px] p-12 flex flex-col justify-center w-full sm:w-96">
            <div
              className="absolute top-2 border border-gray-600 p-1 rounded-full right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={() => {
                setIsRoleOverlay(false);
              }}
            >
              <X />
            </div>
            <div className="w-full relative ">
              <label className="top-3 left-3 bg-white relative font-normal text-[#6F7C8E] roboto text-sm mb-2">
                Reason/Comments
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-500 resize-none"
                placeholder="Please provide details......."
              />
            </div>

            <div className="flex gap-2 items-center justify-center mx-auto max-w-3xs mt-4">
              <button
                onClick={() => handleSubmit()}
                className="px-6 py-2 bg-[#9ACD68] hover:bg-[#7CB556] text-white rounded-full text-base cursor-pointer roboto font-semibold transition"
              >
                {" "}
                Submit{" "}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="px-6 mt-14">
        <NavigationTab tabs={tabs} onTabChange={handleTabChange} />
        {activeTab === "Dashboard" && <DashboardTable />}
        {activeTab === "Pending Request" && (
          <div className="pendingRequest">
            <h1 className=" mt-6 md:mt-6 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
              System Overview
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-10 mt-5 md:mt-6 border-b-[2px] border-b-[#E1E1E1] pb-4">
              {Array.from({ length: 4 }).map((_, index) => {
                const SvgIcon = svgMap[iconKeys[index]];
                return (
                  <Card
                    key={index}
                    SvgIcon={SvgIcon}
                    name={cardName[index]}
                    count={counts[index]}
                    isLoading={loadings[index]}
                  />
                );
              })}
            </div>
            <h1 className=" mt-6 md:mt-6 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
              Recent Requests
            </h1>

            <div className="overflow-x-auto pb-3 border-b-[2px] border-b-[#E1E1E1] my-6 md:mt-6">
              <div className="max-h-[400px] mx-auto md:max-h-[440px] overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full min-w-max overflow-x-auto">
                  <thead className="bg-[#000C63] text-white font-medium">
                    <tr>
                      <th className="sticky top-0 z-20 rounded-tl-[12px] border-r-[1px] border-r-[#EAECF0] bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Asset Image
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Request ID
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-start p-3 roboto text-base md:text-lg font-medium">
                        User
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-start p-3 roboto text-base md:text-lg font-medium">
                        Asset Name
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Request Type
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Status
                      </th>
                      <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-start p-3 roboto text-base md:text-lg font-medium">
                        Date
                      </th>
                      <th className="sticky top-0 z-20 rounded-tr-[12px] bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAssetsIsLoading ? (
                      // 🔹 Show skeleton loaders while fetching
                      [...Array(5)].map((_, index) => (
                        <tr key={index} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-100' : ''}`}>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-20 w-20 mx-auto rounded-md" />
                          </td>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-6 w-16 mx-auto" />
                          </td>
                          <td className="p-3 text-start border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-6 w-24" />
                          </td>
                          <td className="p-3 text-start border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-6 w-20" />
                          </td>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-6 w-20 mx-auto" />
                          </td>
                          <td className="p-3 text-center border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-6 w-28 mx-auto" />
                          </td>
                          <td className="p-3 text-start border-r-[1px] border-r-[#EAECF0]">
                            <Skeleton className="h-6 w-24" />
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-2">
                              <Skeleton className="h-10 w-20 rounded-full" />
                              <Skeleton className="h-10 w-20 rounded-full" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : pendingAssets && pendingAssets?.length > 0 ? (
                      // 🔹 Render actual data
                      pendingAssets.map((item, index) => (
                        <tr key={item.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-100' : ''}`}>
                          <td className="whitespace-nowrap text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            {item.asset?.images?.length > 0 && item.asset.images[0].image ? (
                              <img
                                src={`${VITE_BASE_URL ? VITE_BASE_URL.replace("/api/v1/", "") : "http://127.0.0.1:8000"}${item.asset.images[0].image}`}
                                alt={item.asset.product_name || "Asset image"}
                                className="h-20 w-20 object-cover mx-auto rounded-md"
                              />
                            ) : (
                              <span className="text-gray-500">{item.asset?.product_name || "No Image"}</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            {item.id || "-"}
                          </td>
                          <td className="whitespace-nowrap text-start p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            {(item.employee?.first_name || "") + " " + (item.employee?.last_name || "") || "-"}
                          </td>
                          <td className="whitespace-nowrap text-start p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            {item.asset?.product_name || "-"}
                          </td>
                          <td className="whitespace-nowrap text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            {item.status || "-"}
                          </td>
                          <td className="whitespace-nowrap text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            Pending
                          </td>
                          <td className="whitespace-nowrap text-start p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                            {item.assigned_date ? new Date(item.assigned_date).toLocaleDateString() : "-"}
                          </td>
                          <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handelClick(item, "approve")}
                                className="px-6 py-2 bg-[#000C63] hover:bg-[#6938E4] text-white rounded-full text-base roboto font-semibold transition duration-200 min-w-[90px]"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handelClick(item, "reject")}
                                className="px-6 py-2 bg-red-100 text-red-400 hover:bg-red-200 rounded-full text-base roboto font-semibold transition duration-200 min-w-[90px]"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      // 🔹 No data state
                      <tr className="border-b border-gray-200">
                        <td
                          colSpan="8"
                          className="text-center p-6 text-gray-500 roboto text-base"
                        >
                          No pending requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;