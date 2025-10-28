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
} from "@/store/api/assetsApi";
import { toast } from "sonner";
import { useGetUsersQuery } from "@/store/api/userApi";

const AssetsAssignmentManagement = () => {
  const BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
  // for use in customVdropdown
  const [activeField, setActiveField] = useState("");
  const [assingmentData, setAssignmentData] = useState({
    asset_id: "",
    employee_id: "",
  });
  const [selectedDepartment, setSelectedDepartment] = useState("");
  // const [selectedAsset, setSelectedAsset] = useState('');

  const [selectedAssetType, setSelectedAssetType] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");

  const { data: assetType, isLoading: isLoadingAssetType } =
    useGetAssetTypeQuery();
  const { data: assetsList, isLoading: isLoadingAssetsList } =
    useGetAssignedListQuery();
  console.log("assetlist", assetsList);

  const {
    data: assetData,
    isLoading: assetIsLoading,
    error: assetError,
    isSuccess: assetIsSuccess,
  } = useGetAssetsQuery();

  const filteredAssets =
    assetData?.filter(
      (asset) =>
        asset.asset_type_name?.toLowerCase() ===
          selectedAssetType?.toLowerCase() &&
        asset.status?.toLowerCase() == "available"
    ) || [];

  console.log("assetname : ", assetData);
  const {
    data: userData,
    isLoading: userIsLoading,
    error: userError,
    isSuccess: userIsSuccess,
  } = useGetUsersQuery();
  console.log("username : ", userData);

  const {
    data,
    isLoading: departmentIsLoading,
    isError: departmentIsError,
  } = useGetDepartmentsQuery();
  const {
    data: employeeData,
    isLoading: employeeIsLoading,
    isError: employeeIsError,
  } = useGetEmployeesQuery();

  const {
    data: assetsData,
    isLoading: assetsDataIsLoading,
    isError: assetsDataIsError,
  } = useGetAssetsQuery();
  const [
    assignAsset,
    {
      data: assignAssetData,
      isLoading: assignAssetIsLoading,
      isError: assignAssetIsError,
    },
  ] = useAssignAssetMutation();

  // User Dropdown Functions

  const handleAssignAsset = async () => {
    try {
      if (!selectedAssetType || !assingmentData.employee_id || !selectedAsset) {
        toast.error("Please select asset type, user, and asset");
        return;
      }

      // Find the selected asset type name
      const selectedAssetTypeObj = assetType?.find(
        (type) => type.name === selectedAssetType
      );
      const assetTypeName = selectedAssetTypeObj?.name;

      // Find the selected asset ID
      const selectedAssetObj = filteredAssets.find(
        (asset) => asset.product_name === selectedAsset
      );
      const assetId = selectedAssetObj?.id;

      // Prepare the data to send
      const dataToSend = {
        asset_type: assetTypeName, // Asset type name
        employee_id: assingmentData.employee_id, // Employee ID from state
        asset_id: assetId,
      };

      console.log("Payload:", dataToSend); // Debug: Check the payload before sending

      const response = await assignAsset(dataToSend).unwrap();
      toast.success(response?.detail || "Asset assigned successfully");

      // Reset form
      setAssignmentData({
        asset_id: "",
        employee_id: "",
      });
      setSelectedAssetType("");
      setSelectedAsset("");
    } catch (error) {
      console.error("Assign asset failed:", error);
      toast.error(error?.data?.message || "Failed to assign asset");
    }
  };

  const handleReset = () => {
    setSelectedAssetType("");
    setSelectedAsset("");
    setAssignmentData({
      asset_id: "",
      employee_id: "",
    });
  };

  return (
    <>
      <Header great={"Asset Assignment Management"} />
      <div className="px-6 mt-22">
        <h1 className=" mt-6 md:mt-5 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
          {" "}
          Assign New Asset
        </h1>
        <div className="w-full border-b-[2px] border-b-[#E1E1E1] pb-4 mt-6">
          <div className="w-full max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              {/* Left Column */}
              <div>
                {/* Department Dropdown */}
                {/* <div className="relative w-full mb-6 ">
                  <label
                    htmlFor="id"
                    className="absolute bg-white z-10 text-[#6F7C8E] left-2 -top-2 text-xs roboto"
                  >
                    Department Filter
                  </label>
                  <CustomVDropdown
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    value={selectedDepartment}
                    options={departmentOptions ?? []} // safe fallback
                    placeholder={
                      departmentIsLoading
                        ? "Loading Departments..."
                        : departmentIsError
                        ? "Failed to load departments"
                        : "Select Department"
                    }
                    style={getFieldStyles("department").input}
                    onFocus={() => setActiveField("department")}
                    onBlur={() => setActiveField(null)}
                    disableWhen={departmentIsLoading || departmentIsError}
                  />
                </div> */}
                {/* Asset Type Dropdown */}
                <div className="relative w-full mb-6">
                  <label
                    htmlFor="assetType"
                    className="absolute bg-white z-10 text-[#6F7C8E] left-2 -top-2 text-xs roboto"
                  >
                    Asset Type
                  </label>
                  <select
                    id="assetType"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedAssetType}
                    onChange={(e) => {
                      setSelectedAssetType(e.target.value);
                      setSelectedAsset(""); // Reset selected asset when asset type changes
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

                {/* User Dropdown */}
                <div
                  className="relative w-full mb-6 "
                  // onClick={() => {
                  //   if (!selectedDepartment) {
                  //     toast("Please select department first");
                  //   }
                  // }}
                >
                  <label
                    htmlFor="id"
                    className="absolute bg-white z-10 text-[#6F7C8E] left-2 -top-2 text-xs roboto"
                  >
                    Select User
                  </label>

                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={assingmentData.employee_id}
                    onChange={(e) =>
                      setAssignmentData({
                        ...assingmentData,
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

              {/* Right Column */}
              <div>
                {/* Asset Dropdown */}
                <div className="relative w-full mb-6">
                  <label
                    htmlFor="asset"
                    className="absolute bg-white z-10 text-[#6F7C8E] left-2 -top-2 text-xs roboto"
                  >
                    Available Assets
                  </label>
                  <select
                    id="asset"
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
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAssignAsset}
                className="px-7 py-2 bg-[#000C63] hover:bg-[#8A5CFF] cursor-pointer poppins-medium text-white font-medium rounded-full transition-colors duration-200"
              >
                Assign Asset
              </button>
              <button
                onClick={handleReset}
                className="px-7 py-2 text-red-400 hover:bg-red-200  bg-red-100 cursor-pointer poppins-medium  font-medium rounded-full transition-colors duration-200"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        <h1 className=" roboto font-bold text-xl sm:text-[24px] md:text-[30px] mt-3">
          Current Assignments
        </h1>
        <div className="overflow-x-auto my-6 md:mt-9">
          <div className="max-h-[400px] md:max-h-[440px] overflow-y-auto scrollbar-hide hide-scrollbar border border-gray-200 rounded-lg">
            <table className="table-auto w-full min-w-max">
              <thead className="bg-[#000C63] text-white  font-medium">
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
                {!isLoadingAssetsList &&
                  assetsList?.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      {/* Image */}
                      <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                        <img
                          src={
                            item.asset?.images?.[0]?.image
                              ? `${BASE_URL}${item.asset?.images?.[0]?.image}`
                              : "https://placehold.co/100x100"
                          }
                          alt="Asset"
                          className="h-20"
                        />
                      </td>

                      {/* Asset ID */}
                      <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                        {item.asset?.id}
                      </td>

                      {/* Asset name */}
                      <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                        {item.asset?.product_name}
                      </td>
                      {/* Assigned To */}
                      <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                        {item.employee?.first_name} {item.employee?.last_name}
                      </td>

                      {/* Purchased/Assigned Date */}
                      <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                        {item.assigned_date}
                      </td>

                      {/* Status (your custom component) */}
                      <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                        <div className="flex justify-center ">
                          <StatusButton status={item.status} />
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                        <div className="flex gap-2 justify-center">
                          <button className="px-6 py-2 bg-[#000C63] hover:bg-[#8A5CFF] text-white rounded-full text-base cursor-pointer roboto font-semibold transition-colors duration-300">
                            Transfer
                          </button>

                          <button className="px-6 py-2 bg-[#F45E60] hover:bg-[#d94b4c] text-white rounded-full text-base cursor-pointer roboto font-semibold transition-colors duration-300">
                            Unassign
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
