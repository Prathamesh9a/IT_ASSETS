import Header from "@/components/Header";
import { useGetAssetsQuery } from "@/store/api/assetsApi";
import { useGetDepartmentsQuery } from "@/store/api/settingsApi";
import React, { useState } from "react";
import CardIcon1 from "@/components/icons/CardIcon1";
import CardIcon2 from "@/components/icons/CardIcon2";
import CardIcon3 from "@/components/icons/CardIcon3";
import CardIcon4 from "@/components/icons/CardIcon4";
import Card from "@/components/Card";
import { CustomVDropdown } from "@/components/CustomVDropdown";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import PieChart from "@/components/PieChart";
import assetImage from "/images/assetImage.png";
import StatusButton from "@/components/StatusButoon";

const tableData = [
  {
    id: "LP001",
    image: assetImage,
    date: "2024-08-06",
    asset: "LP001",
    fromUser: "John Doe",
    toUser: "Jane Smith",
    processedBy: "Admin Sarah",
    status: "Complete",
  },
  {
    id: "DSK002",
    image: assetImage,
    date: "2024-08-07",
    asset: "DSK002",
    fromUser: "Emily Brown",
    toUser: "Michael Lee",
    processedBy: "Admin Sarah",
    status: "Pending",
  },
  {
    id: "PRN003",
    image: assetImage,
    date: "2024-08-08",
    asset: "PRN003",
    fromUser: "Sophia Wilson",
    toUser: "David Miller",
    processedBy: "Admin James",
    status: "Rejected",
  },
  {
    id: "MON004",
    image: assetImage,
    date: "2024-08-09",
    asset: "MON004",
    fromUser: "John Doe",
    toUser: "Emma Johnson",
    processedBy: "Admin Sarah",
    status: "Complete",
  },
  {
    id: "TAB005",
    image: assetImage,
    date: "2024-08-10",
    asset: "TAB005",
    fromUser: "Liam Davis",
    toUser: "Olivia Martinez",
    processedBy: "Admin James",
    status: "Pending",
  },
  {
    id: "LP006",
    image: assetImage,
    date: "2024-08-11",
    asset: "LP006",
    fromUser: "Noah Anderson",
    toUser: "Sophia Taylor",
    processedBy: "Admin Sarah",
    status: "Complete",
  },
  {
    id: "DSK007",
    image: assetImage,
    date: "2024-08-12",
    asset: "DSK007",
    fromUser: "Mason Thomas",
    toUser: "Isabella White",
    processedBy: "Admin James",
    status: "Rejected",
  },
  {
    id: "MON008",
    image: assetImage,
    date: "2024-08-13",
    asset: "MON008",
    fromUser: "Ethan Hall",
    toUser: "Mia Harris",
    processedBy: "Admin Sarah",
    status: "Pending",
  },
];
const ReportsAndAnalytics = () => {
  const [activeField, setActiveField] = useState("");
  const [reportType, setRepotType] = useState();
  const [department, setDepartment] = useState();
  const [focusedInput, setFocusedInput] = useState(null);
  const [toDate, setToDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [format, setFormat] = useState();
  const { data: getAsset, isLoading: getAssetIsLoading } = useGetAssetsQuery();
  const { data: departmentData, isLoading: departmentIsLoading } =
    useGetDepartmentsQuery();

  // safely handle conversion
  const departmentOptions = (departmentData?.departments || []).map((dep) => ({
    label: dep.charAt(0).toUpperCase() + dep.slice(1), // capitalize first letter
    value: dep, // keep original value
  }));

  const availableCount = getAsset?.filter(
    (item) => item?.status?.toLowerCase() === "available"
  ).length;

  const counts = [getAsset?.length, 10, availableCount, 12];
  const loadings = [getAssetIsLoading, false, getAssetIsLoading, false];
  const cardName = [
    "Total Assets",
    "Assigned Assets",
    "Available Assets",
    "Under Repair",
  ];

  const svgMap = {
    assetsSvg1: CardIcon1,
    assetsSvg2: CardIcon2,
    assetsSvg3: CardIcon3,
    assetsSvg4: CardIcon4,
  };
  const iconKeys = ["assetsSvg1", "assetsSvg2", "assetsSvg3", "assetsSvg4"];
  const getFieldStyles = (field) => ({
    label: {
      color: activeField === field ? "#2066FF" : "#6F7C8E",
      fontWeight: "normal",
    },
    input: {
      borderColor: activeField === field ? "#2066FF" : "#E1E1E1",
    },
  });
  const report_type = [
    {
      label: "Asset Summary Report",
      value: "asset_summary",
    },
    {
      label: "Assigned Assets Report",
      value: "assigned_assets",
    },
    {
      label: "Under Repair Report",
      value: "under_repair",
    },
  ];
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
  return (
    <>
      <Header great={"System Reports & Analytics"} showNotification={true} />
      <div className="px-6 mt-20">
        <h1 className=" mt-6 md:mt-10 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
          Quick Status
        </h1>
        {/* card */}
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

        {/* cards end */}
        <h1 className=" mt-6 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
          Report Generation
        </h1>
        <div className="flex mt-4 sm:gap-4 gap-6 flex-col">
          <div className="flex sm:flex-row flex-col gap-6 sm:gap-16">
            <div className="relative w-full sm:w-72 ">
              <span className="absolute bg-white -top-3 text-[#6F7C8E] text-sm z-5 left-4">
                Report Type
              </span>
              <CustomVDropdown
                value={reportType}
                onChange={(e) => setRepotType(e.target.value)}
                placeholder={"Select Report Type"}
                options={report_type}
                style={getFieldStyles("report").input}
                onFocus={() => setActiveField("report")}
                onBlur={() => setActiveField(null)}
              />
            </div>
            <div className="relative w-full sm:w-72">
              <span className="absolute bg-white -top-3 text-[#6F7C8E] text-sm z-5 left-4">
                Department Filter
              </span>
              <CustomVDropdown
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder={"All Department"}
                options={departmentOptions}
                style={getFieldStyles("department").input}
                onFocus={() => setActiveField("department")}
                onBlur={() => setActiveField(null)}
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:gap-6 gap-3 ">
              {/* From Date */}
              <div
                className={`flex items-center relative justify-between px-3 py-3 rounded-md border-2 w-full sm:w-72 cursor-text transition
        ${focusedInput === "from" ? "border-[#2066FF]" : "border-[#E1E1E1]"}`}
                onClick={() => setFocusedInput("from")}
                onFocus={() => setFocusedInput("from")}
                onBlur={() => setFocusedInput(null)}
                tabIndex={0}
              >
                <span className="absolute bg-white -top-3 text-[#6F7C8E] text-sm z-5 left-4">
                  Date range
                </span>
                <input
                  type="text"
                  placeholder="DD / MM / YYYY"
                  value={fromDate}
                  onChange={(e) => handleDateInput(e, setFromDate)}
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
              <span className="text-black poppins-regular  ">To</span>
              {/* To Date */}
              <div
                className={`flex items-center justify-between px-3 py-3 rounded-md border-2 w-full sm:w-72 cursor-text transition
        ${focusedInput === "to" ? "border-[#2066FF]" : "border-[#E1E1E1]"}`}
                onClick={() => setFocusedInput("to")}
                onFocus={() => setFocusedInput("to")}
                onBlur={() => setFocusedInput(null)}
                tabIndex={0}
              >
                <input
                  type="text"
                  placeholder="DD / MM / YYYY"
                  value={toDate}
                  onChange={(e) => handleDateInput(e, setToDate)}
                  className="w-full bg-transparent outline-none text-sm placeholder-[#808080] poppins-medium text-[#808080]"
                />
                <Calendar
                  className={`h-5 w-5 ${
                    focusedInput === "to" ? "text-[#2066FF]" : "text-[#808080]"
                  }`}
                />
              </div>{" "}
            </div>
            <div className="relative w-full sm:w-72">
              <span className="absolute bg-white -top-3 text-[#6F7C8E] text-sm z-5 left-4">
                Export Format
              </span>
              <CustomVDropdown
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                placeholder={"Select Export Format"}
                options={departmentOptions}
                style={getFieldStyles("format").input}
                onFocus={() => setActiveField("formt")}
                onBlur={() => setActiveField(null)}
              />
            </div>
          </div>
        </div>
        <div className=" mt-6 flex sm:gap-6 gap-2 flex-wrap">
          <Button className="rounded-full text-xl py-3 sm:px-4 px-[10px] border cursor-pointer  roboto font-medium text-white bg-[#000C63] hover:bg-[#8A5CFF] transition-all duration-300 ">
            Generate Report
          </Button>
          <Button className="rounded-full text-xl py-3 sm:px-4 px-[10px] bg-white  hover:bg-[#6b43e6] border border-[#000C63] hover:text-white  text-[#000C63] transition-all duration-300 roboto font-medium cursor-pointer ">
            Preview
          </Button>
          <Button className="rounded-full text-xl py-3 sm:px-4 px-[10px] bg-[#2e3ca753]  hover:bg-[#6b43e6] text-[#000C63] hover:text-white  transition-all duration-300 roboto font-medium cursor-pointer ">
            Schedule Report
          </Button>
        </div>
        {/* divider */}
        <div className="border my-6 border-[#E1E1E1] " />
        <h1 className=" roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
          Generated Report
        </h1>
        <div className="flex justify-center">
          <PieChart />
        </div>
        {/* divider */}
        <div className="border my-6 border-[#E1E1E1] " />
        <div className="overflow-x-auto my-6">
          <div className="max-h-[400px] md:max-h-[440px] overflow-y-auto scrollbar-hide hide-scrollbar border border-gray-200 rounded-lg">
            <table className="table-auto w-full min-w-max">
              <thead className="bg-[#000C63] text-white  font-medium">
                <tr>
                  <th className="sticky top-0 z-20 rounded-tl-[12px] bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Asset Image
                  </th>
                  <th className="sticky top-0 z-20  bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Date
                  </th>
                  <th className="sticky top-0 z-20  bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Asset
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    From User
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    To User
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Processed By
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Status
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
                    <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                      {item.date}
                    </td>
                    <td className=" whitespace-nowrap text-center p-3 text-base roboto font-normal">
                      {item.asset}
                    </td>
                    <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                      {item.fromUser}
                    </td>
                    <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                      {item.toUser}
                    </td>
                    <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                      {item.processedBy}
                    </td>
                    <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                      <div className="flex justify-center ">
                        <StatusButton status={item.status} />
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

export default ReportsAndAnalytics;
