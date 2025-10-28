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
} from "@/store/api/assetsApi";
import { toast } from "sonner";
const tableData = [
  {
    id: "INV001",
    type: "Laptop",
    image: assetImage,
    model: "MacBook Pro",
    status: "Under Repair",
    assignedTo: "Alice Johnson",
    purchasedDate: "2023-06-10",
    action: "Retire",
  },
  {
    id: "INV002",
    type: "Desktop",
    image: assetImage,
    model: "Dell OptiPlex",
    status: "Assigned",
    assignedTo: "Bob Smith",
    purchasedDate: "2022-11-05",
    action: "Edit",
  },
  {
    id: "INV003",
    type: "Monitor",
    image: assetImage,
    model: 'Samsung 24"',
    status: "Under Repair",
    assignedTo: "Charlie Brown",
    purchasedDate: "2023-01-20",
    action: "Edit",
  },
  {
    id: "INV004",
    type: "Printer",
    image: assetImage,
    model: "HP LaserJet",
    status: "Assigned",
    assignedTo: "Diana Prince",
    purchasedDate: "2022-09-15",
    action: "Retire",
  },
  {
    id: "INV005",
    type: "Tablet",
    image: assetImage,
    model: "iPad Pro",
    status: "Under Repair",
    assignedTo: "Ethan Hunt",
    purchasedDate: "2023-03-12",
  },
  {
    id: "INV006",
    type: "Laptop",
    image: assetImage,
    model: "Lenovo ThinkPad",
    status: "Assigned",
    assignedTo: "Fiona Gallagher",
    purchasedDate: "2022-12-01",
  },
  // Add more entries similarly...
];
const AssetsAssignmentManagement = () => {
  // for use in customVdropdown
  const [activeField, setActiveField] = useState("");
  const [assingmentData, setAssignmentData] = useState({
    asset_id: "",
    employee_id: "",
  });
  const [selectedDepartment, setSelectedDepartment] = useState("");
  // const [selectedAsset, setSelectedAsset] = useState('');
  const [selectedAssetType, setSelectedAssetType] = useState("");

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
    data: assetType,
    isLoading: assetIsLoading,
    isError: assetIsError,
  } = useGetCategoriesQuery();
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
  // department data for customVdropdown
  const departmentOptions = (data?.departments || []).map((dept) => ({
    label: dept,
    value: dept.toLowerCase(),
  }));
  // employee data for user dropdown (filtered by department)
  const employeeOptions =
    employeeData
      ?.filter((emp) => emp?.user?.is_active) // only active users
      ?.filter((emp) => {
        if (!selectedDepartment) return true; // agar department select nahi hai toh sab dikhao
        return (
          emp?.department?.toLowerCase() === selectedDepartment?.toLowerCase()
        );
      })
      .map((emp) => ({
        value: emp.id, // employee id
        label: `${emp.user.first_name} ${emp.user.last_name}`, // full name
      })) || [];

  // asset data for asset dropdown (filtered by asset type + available)
  const assetOptions =
    assetsData
      ?.filter((asset) => asset?.status?.toLowerCase() === "available")
      ?.filter((asset) => {
        if (!selectedAssetType) return true; // agar asset type select nahi hai toh sab dikhao
        return asset?.type?.toLowerCase() === selectedAssetType?.toLowerCase();
      })
      .map((asset) => ({
        label: asset?.name || "Unnamed Asset",
        value: asset?.id,
      })) || [];

  // asset type data for asset type dropdown
  // const assetTypeOptions =
  //   assetType?.asset_categories?.map((cat) => ({
  //     label: cat,
  //     value: cat,
  //   })) || [];
  const assetTypeOptions = [
    {
      label: "Hardware",
      value: "hardware",
    },
    {
      label: "Software",
      value: "software",
    },
  ];
  const getFieldStyles = (field) => ({
    label: {
      color: activeField === field ? "#2066FF" : "#6F7C8E",
      fontWeight: "normal",
    },
    input: {
      borderColor: activeField === field ? "#2066FF" : "#E1E1E1",
    },
  });

  // User Dropdown Functions

  const handleAssignAsset = async () => {
    try {
      if (!assingmentData.asset_id || !assingmentData.employee_id) {
        toast.error("Please select both asset and employee");
        return;
      }

      const response = await assignAsset(assingmentData).unwrap();

      toast.success(response?.detail || "Asset assigned successfully");

      // reset form
      setAssignmentData({
        asset_id: "",
        employee_id: "",
      });
      setSelectedDepartment("");
      setSelectedAssetType("");
    } catch (error) {
      console.error("Assign asset failed:", error);
      toast.error(error?.data?.message || "Failed to assign asset");
    }
  };

  const handleReset = () => {
    setSelectedDepartment("");
    setSelectedAssetType("");
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
                <div className="relative w-full mb-6 ">
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
                </div>
                {/* User Dropdown */}
                <div
                  className="relative w-full mb-6 "
                  onClick={() => {
                    if (!selectedDepartment) {
                      toast("Please select department first");
                    }
                  }}
                >
                  <label
                    htmlFor="id"
                    className="absolute bg-white z-10 text-[#6F7C8E] left-2 -top-2 text-xs roboto"
                  >
                    Select User
                  </label>
                  <CustomVDropdown
                    onChange={(e) =>
                      setAssignmentData((prev) => ({
                        ...prev,
                        employee_id: e.target.value,
                      }))
                    }
                    value={assingmentData.employee_id}
                    options={employeeOptions ?? []} // safe fallback
                    placeholder={
                      employeeIsLoading
                        ? "Loading employee..."
                        : employeeIsError
                        ? "Failed to load employee"
                        : "Select employee"
                    }
                    style={getFieldStyles("employee").input}
                    onFocus={() => setActiveField("employee")}
                    onBlur={() => setActiveField(null)}
                    disableWhen={
                      !selectedDepartment ||
                      employeeIsLoading ||
                      employeeIsError
                    }
                  />
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Asset Type Dropdown */}
                <div className="relative w-full mb-6 ">
                  <label
                    htmlFor="id"
                    className="absolute bg-white z-10 text-[#6F7C8E] left-2 -top-2 text-xs roboto"
                  >
                    Asset Type
                  </label>
                  <CustomVDropdown
                    onChange={(e) => setSelectedAssetType(e.target.value)}
                    value={selectedAssetType}
                    options={assetTypeOptions ?? []} // safe fallback
                    placeholder={
                      assetIsLoading
                        ? "Loading Asset type..."
                        : assetIsError
                        ? "Failed to load Asset type..."
                        : "Select Asset type"
                    }
                    style={getFieldStyles("asset").input}
                    onFocus={() => setActiveField("asset")}
                    onBlur={() => setActiveField(null)}
                    disableWhen={assetIsLoading || assetIsError}
                  />
                </div>
                {/* Asset Dropdown */}
                <div
                  className="relative w-full mb-6 "
                  onClick={() => {
                    if (!selectedAssetType) {
                      toast("Please first select asset type");
                    }
                  }}
                >
                  <label
                    htmlFor="id"
                    className="absolute bg-white z-10 text-[#6F7C8E] left-2 -top-2 text-xs roboto"
                  >
                    Available Assets
                  </label>
                  <CustomVDropdown
                    onChange={(e) =>
                      setAssignmentData((prev) => ({
                        ...prev,
                        asset_id: e.target.value,
                      }))
                    }
                    value={assingmentData.asset_id}
                    options={assetOptions ?? []} // safe fallback
                    placeholder={
                      assetsDataIsLoading
                        ? "Loading Asset..."
                        : assetsDataIsError
                        ? "Failed to load Asset"
                        : "Select Asset"
                    }
                    style={getFieldStyles("availableasset").input}
                    onFocus={() => setActiveField("availableasset")}
                    onBlur={() => setActiveField(null)}
                    disableWhen={
                      !selectedAssetType ||
                      assetsDataIsLoading ||
                      assetsDataIsError
                    }
                  />
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
                    Department
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
                {tableData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                      <img
                        src={item.image || "https://placehold.co/100x100"}
                        alt=""
                        className="  h-20"
                      />
                    </td>
                    <td className=" whitespace-nowrap text-center p-3 text-base roboto font-normal">
                      {item.id}
                    </td>
                    <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                      {item.type}
                    </td>
                    <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                      {item.model}
                    </td>
                    <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                      <div className="flex justify-center ">
                        <StatusButton status={item.status} />
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                      {item.assignedTo}
                    </td>
                    <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                      {item.purchasedDate}
                    </td>
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
