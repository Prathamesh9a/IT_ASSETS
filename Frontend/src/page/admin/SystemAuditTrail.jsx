import Header from "@/components/Header";
import React, { useState } from "react";
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
const tabs = ["My Assets", "Request", "Notification"];
const tableData = [
  {
    Timestamp: "2024-08-06 10:30",
    type: "Laptop",
    image: assetImage,
    actor: "Admin Sarah",
    action: "Under Repair",
    asset: "LP001",
    targetUser: "John Doe",
    status: "Approved",
    Remark: "Laptop sent for repair",
  },
  {
    Timestamp: "2024-08-06 11:15",
    type: "Monitor",
    image: assetImage,
    actor: "Admin Alex",
    action: "Issued",
    asset: "MN102",
    targetUser: "Jane Smith",
    status: "Pending",
    Remark: "Monitor assigned for new project",
  },
  {
    Timestamp: "2024-08-06 12:45",
    type: "Mouse",
    image: assetImage,
    actor: "Admin Mike",
    action: "Returned",
    asset: "MS203",
    targetUser: "David Johnson",
    status: "Approved",
    Remark: "Old mouse returned to inventory",
  },
  {
    Timestamp: "2024-08-06 14:10",
    type: "Keyboard",
    image: assetImage,
    actor: "Admin Sarah",
    action: "Issued",
    asset: "KB404",
    targetUser: "Emma Wilson",
    status: "Rejected",
    Remark: "Keyboard request denied - stock low",
  },
  {
    Timestamp: "2024-08-06 15:25",
    type: "Laptop",
    image: assetImage,
    actor: "Admin Alex",
    action: "Assigned",
    asset: "LP305",
    targetUser: "Chris Brown",
    status: "Approved",
    Remark: "Laptop allocated for training",
  },
  {
    Timestamp: "2024-08-06 16:50",
    type: "Headset",
    image: assetImage,
    actor: "Admin Mike",
    action: "Under Repair",
    asset: "HS506",
    targetUser: "Sophia Miller",
    status: "Pending",
    Remark: "Headset sent for microphone issue",
  },
  {
    Timestamp: "2024-08-06 18:05",
    type: "Projector",
    image: assetImage,
    actor: "Admin Sarah",
    action: "Issued",
    asset: "PJ607",
    targetUser: "Liam Davis",
    status: "Approved",
    Remark: "Projector provided for client meeting",
  },
];

const SystemAuditTrail = () => {
  const users = ["User 1", "User 2", "User 3"];
  const actions = ["Login", "Logout", "Purchase"];
  const { user } = useSelector((state) => state.auth);
  const [focusedInput, setFocusedInput] = useState(null);
  const [toDate, setToDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  const { data } = useGetAuditLogsQuery();
  const { data: auditLogDataUser } = useGetAuditLogsByUserQuery();

  // Function to format input as DD / MM / YYYY
  const handleDateInput = (e, setValue) => {
    let value = e.target.value.replace(/\D/g, ""); // remove non-numeric

    if (value.length > 8) value = value.slice(0, 8); // restrict YYYY length

    // Insert slashes automatically
    if (value.length > 4) {
      value = value.replace(/(\d{2})(\d{2})(\d{0,4})/, "$1 / $2 / $3");
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d{0,2})/, "$1 / $2");
    }

    setValue(value);
  };

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
      <div className="px-6 mt-12">
        <NavigationTabs onTabChange={handleTabChange} tabs={tabs} />
        <h1 className=" mt-4 md:mt-4 roboto font-bold text-lg sm:text-xl md:text-2xl">
          Filters
        </h1>
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
          <div className="flex sm:flex-row flex-col flex-wrap gap-6 w-full">
            {/* Date Inputs */}
            <div className="flex flex-col sm:flex-row items-center gap-6 flex-1 ">
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
            <div className="flex flex-col sm:flex-row gap-6 flex-1 min-w-[250px">
              <CustomDropdown
                label="User"
                options={users}
                value={selectedUser}
                onChange={setSelectedUser}
                placeholder="All Users"
              />
              <CustomDropdown
                label="Action Type"
                options={actions}
                value={selectedAction}
                onChange={setSelectedAction}
                placeholder="All Actions"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch flex-1 min-w-[250px]">
              <Button className="bg-[#000C63] hover:bg-[#8A5CFF] cursor-pointer px-6 py-3 roboto font-medium text-base md:text-lg rounded-full w-full sm:w-auto">
                Apply Filter
              </Button>
              <Button className="text-red-400 hover:bg-red-200  bg-red-100 cursor-pointer px-6 py-3 roboto font-medium text-base md:text-lg rounded-full w-full sm:w-auto">
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
        <div className="overflow-x-auto pb-3 border-b-[2px] border-b-[#E1E1E1]  my-6 md:mt-6">
          <div className="max-h-[400px] md:max-h-[440px] overflow-y-auto scrollbar-hide hide-scrollbar border border-gray-200 rounded-lg">
            <table className="table-auto w-full min-w-max">
              <thead className="bg-[#000C63] text-white  font-medium">
                <tr>
                  <th className="sticky top-0 z-20 rounded-tl-[12px] border-r-[1px] border-r-[#EAECF0]  bg-[#000C63] text-white text-center p-2 roboto text-base md:text-lg font-medium">
                    Asset Image
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-2 roboto text-base md:text-lg font-medium">
                    Timestamp
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-2 roboto text-base md:text-lg font-medium">
                    Actor
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-2 roboto text-base md:text-lg font-medium">
                    Asset
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-2 roboto text-base md:text-lg font-medium">
                    Action
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-2 roboto text-base md:text-lg font-medium">
                    Target User
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-2 roboto text-base md:text-lg font-medium">
                    Status
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63]  text-white text-center p-2 roboto text-base md:text-lg font-medium">
                    Remark
                  </th>
                </tr>
              </thead>

              <tbody>
                {tableData?.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="whitespace-nowrap text-center p-2 border-r-[1px] border-r-[#EAECF0]  text-base roboto font-normal">
                      <img src={item.image} alt="" className="h-20" />
                    </td>
                    <td className=" whitespace-nowrap text-center p-2 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                      {item.Timestamp}
                    </td>
                    <td className="whitespace-nowrap text-center p-2 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                      {item.actor}
                    </td>
                    <td className="whitespace-nowrap text-center p-2 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                      {item.action}
                    </td>
                    {/* <td className="whitespace-nowrap text-center p-2 text-base roboto font-normal">
                      <div className="flex justify-center ">
                        <StatusButton status={item.status} />
                      </div>
                    </td> */}
                    <td className="whitespace-nowrap text-center p-2 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                      {item.asset}
                    </td>
                    <td className="whitespace-nowrap text-center p-2 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                      {item.targetUser}
                    </td>
                    <td className="whitespace-nowrap text-center p-2 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                      {item.status}
                    </td>
                    <td className="whitespace-nowrap text-center p-2 text-base roboto font-normal">
                      {item.Remark}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* <h1 className=" mt-4 md:mt-4 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
          Audit Log
        </h1> */}
        <CSVLink data={tableData} filename={"table-data.csv"}>
          <Button className="bg-[#000C63] hover:bg-[#8A5CFF]  cursor-pointer px-6 py-3 mb-4 roboto font-medium  text-base rounded-full">
            Export To CSV
          </Button>
        </CSVLink>
      </div>
    </>
  );
};

export default SystemAuditTrail;
