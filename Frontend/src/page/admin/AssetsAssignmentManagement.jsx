// src/pages/admin/AssetsAssignmentManagement.jsx
import Header from "@/components/Header";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import assetImage from "/images/assetImage.png";
import StatusButton from "@/components/StatusButoon";
import {
  useGetCategoriesQuery,
  useGetDepartmentsQuery,
} from "@/store/api/settingsApi";
import { CustomVDropdown } from "@/components/CustomVDropdown";
import { useGetEmployeesQuery } from "@/store/api/employeeApi";
import {
  useAssignAssetMutation,
  useGetAssetsQuery,
  useGetAssetTypeQuery,
  useGetAssignedListQuery,
  useRevokeAssetMutation, // NEW
} from "@/store/api/assetsApi";
import { toast } from "sonner";
import { useGetUsersQuery } from "@/store/api/userApi";

const AssetsAssignmentManagement = () => {
  const BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;

  const [activeField, setActiveField] = useState("");
  const [assignmentData, setAssignmentData] = useState({
    asset_id: "",
    employee_id: "",
  });
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedAssetType, setSelectedAssetType] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");

  const { data: assetType, isLoading: isLoadingAssetType } =
    useGetAssetTypeQuery();
  const { data: assetsList, isLoading: isLoadingAssetsList } =
    useGetAssignedListQuery();

  const { data: assetData, isLoading: assetIsLoading } = useGetAssetsQuery();

  const filteredAssets =
    assetData?.filter(
      (asset) =>
        asset.asset_type_name?.toLowerCase() ===
          selectedAssetType?.toLowerCase() &&
        asset.status?.toLowerCase() === "available"
    ) || [];

  const { data: userData, isLoading: userIsLoading } = useGetUsersQuery();
  const { data, isLoading: departmentIsLoading } = useGetDepartmentsQuery();
  const { data: employeeData, isLoading: employeeIsLoading } =
    useGetEmployeesQuery();

  const [assignAsset, { isLoading: assignAssetIsLoading }] =
    useAssignAssetMutation();
  const [revokeAsset, { isLoading: isRevoking }] = useRevokeAssetMutation();

  // ASSIGN HANDLER
  const handleAssignAsset = async () => {
    try {
      if (!selectedAssetType || !assignmentData.employee_id || !selectedAsset) {
        toast.error("Please select asset type, user, and asset");
        return;
      }

      const selectedAssetTypeObj = assetType?.find(
        (type) => type.name === selectedAssetType
      );
      const selectedAssetObj = filteredAssets.find(
        (asset) => asset.product_name === selectedAsset
      );

      const dataToSend = {
        asset_type: selectedAssetTypeObj?.name,
        employee_id: assignmentData.employee_id,
        asset_id: selectedAssetObj?.id,
      };

      const response = await assignAsset(dataToSend).unwrap();
      toast.success(response?.detail || "Asset assigned successfully");

      setAssignmentData({ asset_id: "", employee_id: "" });
      setSelectedAssetType("");
      setSelectedAsset("");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to assign asset");
    }
  };

  const handleReset = () => {
    setSelectedAssetType("");
    setSelectedAsset("");
    setAssignmentData({ asset_id: "", employee_id: "" });
  };

  // UNASSIGN HANDLER
  const handleUnassign = async (assignment) => {
    if (
      !window.confirm(
        `Unassign ${assignment.asset.product_name} from ${assignment.employee.first_name}?`
      )
    ) {
      return;
    }

    try {
      const payload = {
        asset_id: assignment.asset.id,
        employee_id: assignment.employee.id,
        remarks: "Unassigned via admin panel",
      };

      await revokeAsset(payload).unwrap();
      toast.success("Asset unassigned successfully");
    } catch (err) {
      console.error("Revoke failed:", err);
      toast.error(err?.data?.detail || "Failed to unassign asset");
    }
  };

  return (
    <>
      <Header great={"Asset Assignment Management"} />
      <div className="px-6 mt-22">
        <h1 className="mt-6 md:mt-5 roboto font-bold text-lg sm:text-xl md:text-2xl">
          Assign New Asset
        </h1>

        {/* === ASSIGN FORM === */}
        <div className="w-full border-b-[2px] border-b-[#E1E1E1] pb-4 mt-6">
          <div className="w-full ">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
              <div className="relative w-full mb-6">
                <label className="absolute bg-white z-10 text-[#6F7C8E] left-2 -top-2 text-xs roboto">
                  Asset Type
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedAssetType}
                  onChange={(e) => {
                    setSelectedAssetType(e.target.value);
                    setSelectedAsset("");
                  }}
                >
                  <option value="">Select Asset Type</option>
                  {!isLoadingAssetType &&
                    assetType?.map((type) => (
                      <option key={type.id} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="relative w-full mb-6">
                <label className="absolute bg-white z-10 text-[#6F7C8E] left-2 -top-2 text-xs roboto">
                  Available Assets
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  disabled={!selectedAssetType}
                >
                  <option value="">Select Asset</option>
                  {!assetIsLoading &&
                    filteredAssets.map((asset) => (
                      <option key={asset.id} value={asset.product_name}>
                        {asset.product_name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="relative w-full mb-6">
                <label className="absolute bg-white z-10 text-[#6F7C8E] left-2 -top-2 text-xs roboto">
                  Select User
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={assignmentData.employee_id}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      employee_id: e.target.value,
                    })
                  }
                >
                  <option value="">Select User</option>
                  {!userIsLoading &&
                    userData?.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                disabled={assignAssetIsLoading}
                onClick={handleAssignAsset}
                className="px-7 py-2 bg-[#000C63] hover:bg-gradient-to-r hover:from-[#000C63] hover:to-[#3B82F6] hover:scale-105 transition-all duration-200 cursor-pointer poppins-medium text-white font-medium rounded-full"
              >
                {assignAssetIsLoading ? "Assigning..." : "Assign Asset"}
              </button>
              <button
                onClick={handleReset}
                className="px-7 py-2 text-red-400 hover:bg-red-200 bg-red-100 cursor-pointer poppins-medium font-medium rounded-full transition-colors duration-200"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* === CURRENT ASSIGNED TABLE === */}
        <h1 className="roboto font-bold text-lg sm:text-xl md:text-2xl mt-3">
          Current Assets Assigned
        </h1>
        <div className="overflow-x-auto my-6 md:mt-7">
          <div className="max-h-[200px] md:max-h-[240px] overflow-y-auto  hide-scrollbar border border-gray-200 rounded-lg">
            <table className="table-auto w-full min-w-max">
              <thead className="bg-[#000C63] text-white font-medium">
                <tr>
                  <th className="sticky top-0 z-20 rounded-tl-[12px] bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Asset Image
                  </th>
                  <th className="sticky top-0 z-20  bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Asset ID
                  </th>

                  <th className="sticky top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Asset Name
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Assigned To
                  </th>

                  <th className="sticky top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Assigned Date
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    status{" "}
                  </th>
                  <th className="sticky top-0 z-20 rounded-tr-[12px] bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {!isLoadingAssetsList && assetsList?.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center p-6 text-gray-500 bg-gray-50 roboto text-base"
                    >
                      No asset logs found.
                    </td>
                  </tr>
                )}
                {!isLoadingAssetsList &&
                  assetsList?.length > 0 &&
                  assetsList?.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="whitespace-nowrap text-center p-2 text-base roboto font-normal">
                        <img
                          src={
                            item.asset?.images?.[0]?.image
                              ? `${BASE_URL}${item.asset?.images?.[0]?.image}`
                              : "https://placehold.co/100x100"
                          }
                          alt="Asset"
                          className="h-20 mx-auto"
                        />
                      </td>
                      <td className="whitespace-nowrap text-center p-2 text-base roboto font-normal">
                        {item.asset?.id}
                      </td>
                      <td className="whitespace-nowrap text-center p-2 text-base roboto font-normal">
                        {item.asset?.product_name}
                      </td>
                      <td className="whitespace-nowrap text-center p-2 text-base roboto font-normal">
                        {item.employee?.first_name} {item.employee?.last_name}
                      </td>
                      <td className="whitespace-nowrap text-center p-2 text-base roboto font-normal">
                        {item.assigned_date}
                      </td>
                      <td className="whitespace-nowrap text-center p-2 text-base roboto font-normal">
                        <div className="flex justify-center">
                          <StatusButton status={item.status} />
                        </div>
                      </td>
                      {/* Action buttons */}
                      <td className="whitespace-nowrap text-center py-2 text-base roboto font-normal">
                        <div className="flex gap-2 justify-center">
                          <button className="py-1.5 px-4 bg-[#000C63] hover:bg-[#2563eb] text-white rounded-full text-base cursor-pointer roboto font-semibold transition-colors duration-300">
                            Transfer
                          </button>
                          {/* UNASSIGN BUTTON */}
                          <button
                            onClick={() => handleUnassign(item)}
                            disabled={isRevoking}
                            className={`py-1.5 px-4 rounded-full text-base cursor-pointer roboto font-semibold transition-colors duration-300 ${
                              isRevoking
                                ? "bg-gray-400 text-white"
                                : "bg-[#F45E60] hover:bg-[#d94b4c] text-white"
                            }`}
                          >
                            {isRevoking ? "Unassigning..." : "Unassign"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssetsAssignmentManagement;
