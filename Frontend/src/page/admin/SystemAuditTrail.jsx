import Header from "@/components/Header";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import NavigationTabs from "@/components/NavigationTabs";
import { Calendar } from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown";
import { Button } from "@/components/ui/button";
import assetImage from "/images/assetImage.png";
import { useNavigate } from "react-router-dom";
import { CSVLink } from "react-csv";
import {
  useGetAuditLogsByUserQuery,
  useGetAuditLogsQuery,
} from "@/store/api/auditApi";
import {
  useGetAssetLogsQuery,
  useGetDashboardSummaryQuery,
} from "@/store/api/assetsApi";
const tabs = ["My Assets", "Request", "Notification"];
// const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
const VITE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;

const SystemAuditTrail = () => {
  const { user } = useSelector((state) => state.auth);
  const [focusedInput, setFocusedInput] = useState(null);
  const [toDate, setToDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  const { data } = useGetAuditLogsQuery();
  const { data: auditLogDataUser } = useGetAuditLogsByUserQuery();
  const { data: assetLogs, isLoading: isLoadingassetLogs } =
    useGetAssetLogsQuery();
  console.log("assetLogs ", assetLogs);

  const [filteredData, setFilteredData] = useState([]);

  // Dynamic dropdown options
  const uniqueUsers =
    [...new Set(assetLogs?.map((item) => item.employee))] || [];
  const uniqueActions =
    [...new Set(assetLogs?.map((item) => item.action))] || [];

  // Apply filters on button click
  const handleApplyFilter = () => {
    if (!assetLogs) {
      setFilteredData([]);
      return;
    }

    const filtered = assetLogs.filter((item) => {
      const itemDate = new Date(item.timestamp);
      const fromDateObj = fromDate
        ? new Date(fromDate.split(" / ").reverse().join("-"))
        : null;
      const toDateObj = toDate
        ? new Date(toDate.split(" / ").reverse().join("-"))
        : null;

      const isDateValid =
        (!fromDateObj || itemDate >= fromDateObj) &&
        (!toDateObj || itemDate <= toDateObj);
      const isUserValid = !selectedUser || item.employee === selectedUser;
      const isActionValid = !selectedAction || item.action === selectedAction;

      return isDateValid && isUserValid && isActionValid;
    });

    setFilteredData(filtered);
  };

  // Clear all filters
  const handleClearFilter = () => {
    setFromDate("");
    setToDate("");
    setSelectedUser(null);
    setSelectedAction(null);
    setFilteredData(assetLogs || []);
  };
  // Function to format input as DD / MM / YYYY
  const handleDateInput = (e, setValue) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (value.length > 8) value = value.slice(0, 8); // Restrict to 8 digits (DDMMYYYY)
    // Insert slashes automatically
    if (value.length > 4) {
      value = value.replace(/(\d{2})(\d{2})(\d{0,4})/, "$1 / $2 / $3");
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d{0,2})/, "$1 / $2");
    }
    setValue(value);
  };

  // Initialize filteredData with assetLogs
  useEffect(() => {
    if (assetLogs) {
      setFilteredData(assetLogs);
    }
  }, [assetLogs]);

  const formattedData = Array.isArray(assetLogs)
    ? assetLogs.map((log) => ({
        id: log.id,
        employee: log.employee,
        action: log.action,
        description: log.description,
        timestamp: log.timestamp,
        asset_type_name: log.asset?.asset_type_name,
        product_name: log.asset?.product_name,
        model_no: log.asset?.model_no,
        configuration: log.asset?.configuration,
        status: log.asset?.status,
        image_url: log.asset?.images?.[0]?.image
          ? `${VITE_BASE_URL}${log.asset.images[0].image}`
          : "",
      }))
    : [];

  const headers = [
    { label: "ID", key: "id" },
    { label: "Employee", key: "employee" },
    { label: "Action", key: "action" },
    { label: "Description", key: "description" },
    { label: "Timestamp", key: "timestamp" },
    { label: "Asset Type", key: "asset_type_name" },
    { label: "Product Name", key: "product_name" },
    { label: "Model No", key: "model_no" },
    { label: "Configuration", key: "configuration" },
    { label: "Status", key: "status" },
    { label: "Image URL", key: "image_url" },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]); // default: Overview
  //     const handleTabChange = (tab) => {
  //     setActiveTab(tab) // Update selected tab
  //   }

  //   const renderTabContent = () => {
  //     switch (activeTab) {
  //       case "Overview":
  //         return <Overview />
  //       case "Asset Management":
  //         return <AssetManagement />
  //       case "System Audit":
  //         return <SystemAudit />
  //       case "Reports":
  //         return <Reports />
  //       case "Setting":
  //         return <Setting />
  //       default:
  //         return null
  //     }
  //   }
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Call API depending on the tab
    if (tab === "My Assets") {
      console.log("My Assets");
    } else if (tab === "Request") {
      console.log("Request");
    } else if (tab === "Notification") {
      navigate("/notification");
    }
  };
  return (
    <>
      <Header
        great={"System Audit Trail"}
        userName={user?.role}
        showNotification={false}
      />
      <div className="px-6 mt-22">
        {/* <NavigationTabs onTabChange={handleTabChange} tabs={tabs} /> */}
        {/* <h1 className=" mt-4 md:mt-4 roboto font-bold text-lg sm:text-xl md:text-2xl">
          Filters
        </h1> */}
        {/* filters */}
        <div className="border border-[#E1E1E1] bg-[#FAFAFA] rounded-2xl px-4 py-6 w-full">
          {/* Label */}
          <label
            className={`block mb-4 poppins-medium ${
              focusedInput === "to" || focusedInput === "from"
                ? "text-[#2066FF]"
                : "text-[#808080]"
            }`}
          >
            Date Range
          </label>

          {/* Main Container with wrap */}
          <div className="grid grid-cols-1 md:grid-cols-2 justify-center md:justify-start gap-6 w-full">
            {/* Date Inputs */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 flex-1 ">
              {/* From Date */}
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-md border w-full sm:w-64 cursor-text transition
        ${focusedInput === "from" ? "border-[#2066FF]" : "border-[#E1E1E1]"}`}
                onClick={() => setFocusedInput("from")}
              >
                <input
                  type="text"
                  placeholder="DD / MM / YYYY"
                  value={fromDate}
                  onChange={(e) => handleDateInput(e, setFromDate)}
                  onFocus={() => setFocusedInput("from")}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full bg-transparent outline-none text-sm placeholder-[#808080] poppins-medium text-[#808080]"
                />
                <Calendar
                  className={`h-5 w-5 ${
                    focusedInput === "from"
                      ? "text-[#2066FF]"
                      : "text-[#808080]"
                  }`}
                />
              </div>

              <span className="text-black poppins-regular hidden [@media(min-width:1221px)]:block ">
                To
              </span>

              {/* To Date */}
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-md border w-full sm:w-64 cursor-text transition
        ${focusedInput === "to" ? "border-[#2066FF]" : "border-[#E1E1E1]"}`}
                onClick={() => setFocusedInput("to")}
              >
                <input
                  type="text"
                  placeholder="DD / MM / YYYY"
                  value={toDate}
                  onChange={(e) => handleDateInput(e, setToDate)}
                  onFocus={() => setFocusedInput("to")}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full bg-transparent outline-none text-sm placeholder-[#808080] poppins-medium text-[#808080]"
                />
                <Calendar
                  className={`h-5 w-5 ${
                    focusedInput === "to" ? "text-[#2066FF]" : "text-[#808080]"
                  }`}
                />
              </div>
            </div>

            {/* Dropdowns */}
            <div className="flex flex-col sm:flex-row justify-center md:justify-start  gap-6 flex-1 min-w-[250px]">
              <CustomDropdown
                label="User"
                options={uniqueUsers}
                value={selectedUser}
                onChange={setSelectedUser}
                placeholder="All Users"
              />
              <CustomDropdown
                label="Action Type"
                options={uniqueActions}
                value={selectedAction}
                onChange={setSelectedAction}
                placeholder="All Actions"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row  gap-4 items-stretch flex-1 min-w-[250px]">
              <Button
                onClick={handleApplyFilter}
                className="bg-[#000C63] hover:bg-[#8A5CFF] cursor-pointer px-6 py-3 roboto font-medium text-base md:text-lg rounded-full w-full sm:w-auto"
              >
                Apply Filter
              </Button>
              <Button
                onClick={handleClearFilter}
                className="text-red-400 hover:bg-red-200 bg-red-100 cursor-pointer px-6 py-3 roboto font-medium text-base md:text-lg rounded-full w-full sm:w-auto"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* divider */}
        <div className="mt-6 w-full border-b-[2px] border-b-[#E1E1E1]" />
        <h1 className=" mt-4 roboto font-bold text-lg sm:text-xl md:text-2xl">
          Audit Log
        </h1>
        {/* table */}
        <div className="overflow-x-auto pb-3 border-b-[2px] border-b-[#E1E1E1]  my-6 md:mt-6">
          <div className="max-h-[300px] md:max-h-[340px] overflow-y-auto  border border-gray-200 rounded-lg">
            <table className="table-auto w-full min-w-max">
              <thead className="bg-[#000C63] text-white font-medium sticky top-0 z-30">
                <tr>
                  {/* <th className="text-center p-2 rounded-tl-[12px] border-r border-[#EAECF0]">
                    Asset Image
                  </th> */}
                  <th className="text-center p-2 rounded-tl-[12px] border-r border-[#EAECF0]">
                    Timestamp
                  </th>
                  <th className="text-center p-2 border-r border-[#EAECF0]">
                    Actor
                  </th>
                  <th className="text-center p-2 border-r border-[#EAECF0]">
                    Asset Name
                  </th>
                  <th className="text-center p-2 border-r border-[#EAECF0]">
                    Action
                  </th>
                  <th className="text-center p-2 border-r border-[#EAECF0]">
                    Target User
                  </th>
                  <th className="text-center p-2 border-r border-[#EAECF0]">
                    Status
                  </th>
                  <th className="text-center p-2 rounded-tr-[12px]">Remark</th>
                </tr>
              </thead>

              <tbody>
                {!isLoadingassetLogs && filteredData.length > 0
                  ? filteredData.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`border-b border-gray-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-300"
                        }`}
                      >
                        <td className="text-center p-2 border-r border-[#EAECF0]">
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                        <td className="text-center p-2 border-r border-[#EAECF0]">
                          {item.employee || "N/A"}
                        </td>
                        <td className="text-center p-2 border-r border-[#EAECF0]">
                          {item.asset?.product_name || "N/A"}
                        </td>
                        <td className="text-center p-2 border-r border-[#EAECF0]">
                          {item.action || "N/A"}
                        </td>
                        <td className="text-center p-2 border-r border-[#EAECF0]">
                          {item.employee || "-"}
                        </td>
                        <td className="text-center p-2 border-r border-[#EAECF0]">
                          {item.asset?.status || "N/A"}
                        </td>
                        <td className="text-center p-2">
                          {item.description || "-"}
                        </td>
                      </tr>
                    ))
                  : !isLoadingassetLogs && (
                      <tr>
                        <td
                          colSpan="8"
                          className="text-center p-6 text-gray-500 bg-gray-50 roboto text-base"
                        >
                          No asset logs found.
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>
        </div>
        {/* <h1 className=" mt-4 md:mt-4 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
          Audit Log
        </h1> */}
        <CSVLink
          data={formattedData}
          headers={headers}
          filename="asset-log.csv"
        >
          <Button className="bg-[#000C63] hover:bg-[#8A5CFF] cursor-pointer px-6 py-3 mb-4 roboto font-medium text-base rounded-full">
            Export To CSV
          </Button>
        </CSVLink>
      </div>
    </>
  );
};

export default SystemAuditTrail;
