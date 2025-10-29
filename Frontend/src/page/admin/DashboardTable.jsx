import Header from "@/components/Header";
import React, { useState } from "react";
import NavigationTabs from "@/components/NavigationTabs";
import { useSelector } from "react-redux";
import Card from "@/components/Card";
import CardIcon1 from "@/components/icons/CardIcon1";
import CardIcon2 from "@/components/icons/CardIcon2";
import CardIcon3 from "@/components/icons/CardIcon3";
import CardIcon4 from "@/components/icons/CardIcon4";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  useGetAssetsQuery,
  useGetDashboardSummaryQuery,
} from "@/store/api/assetsApi";
import { useGetDepartmentsQuery } from "@/store/api/settingsApi";
import { useGetEmployeesQuery } from "@/store/api/employeeApi";
const DashboardTable = () => {
  const { data, isLoading } = useGetAssetsQuery();
  console.log("dtata", data);
  const { data: dashboardSummary, isLoading: isLoadingdashboardSummary } =
    useGetDashboardSummaryQuery();
  console.log("dashboardSummary", dashboardSummary);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { data: getAsset, isLoading: getAssetIsLoading } = useGetAssetsQuery();
  const { data: departmentData, isLoading: getDepartmentIsLoading } =
    useGetDepartmentsQuery();
  const { data: employeeData, isLoading: employeeDataIsLoading } =
    useGetEmployeesQuery();
  const activeUsers = !employeeDataIsLoading
    ? (employeeData || []).filter((emp) => emp?.user?.is_active)
    : [];

  const loadings = [
    getAssetIsLoading,
    employeeDataIsLoading,
    false,
    getDepartmentIsLoading,
  ];
  const counts = [
    dashboardSummary?.total_assets,
    dashboardSummary?.assigned_assets,
    dashboardSummary?.pending_requests,
    dashboardSummary?.under_repair,
  ];

  const cardName = [
    "Total Assets",
    "Assigned Assets",
    "Pending Requests",
    "Under Maintainance",
  ];
  const tabs = [
    "Overview",
    "Asset Management",
    "System Audit",
    "Reports",
    "Setting",
  ];
  const svgMap = {
    assetsSvg1: CardIcon1,
    assetsSvg2: CardIcon2,
    assetsSvg3: CardIcon3,
    assetsSvg4: CardIcon4,
  };
  const iconKeys = ["assetsSvg1", "assetsSvg2", "assetsSvg3", "assetsSvg4"];

  const [activeTab, setActiveTab] = useState(tabs[0]); // default: Overview

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Call API depending on the tab
    if (tab === "Overview") {
      console.log("overviews");
    } else if (tab === "Asset Management") {
      console.log("Assets managment");
    } else if (tab === "System Audit") {
      console.log("system Audits");
    } else if (tab === "Reports") {
      console.log("reports");
    } else if (tab === "Setting") {
      console.log("settings");
    }
  };
  //   console.log(activeTab);

  const redirectToAddAssets = () => {
    navigate("/addAssets");
  };
  return (
    <>
      <Header
        great={"Welcome"}
        userName={user?.role}
        dept={"(System Administrator)"}
        showNotification={true}
      />
      <div className=" ">
        <h1 className=" mt-6 md:mt-6 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
          Assets
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
        {/* <h1 className=" mt-6 md:mt-6 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
          Assets 
        </h1> */}
        {/* tabel */}
        <div className="overflow-x-auto pb-3 border-b-[2px] border-b-[#E1E1E1]  my-6 md:mt-6">
          <div className="max-h-[200px]  mx-auto md:max-h-[240px] overflow-y-auto  border border-gray-200 rounded-lg">
            <table className=" w-full min-w-max overflow-x-auto">
              <thead className="bg-[#000C63] text-white  font-medium">
                <tr>
                  <th className="sticky top-0 z-20 rounded-tl-[12px] border-r-[1px] border-r-[#EAECF0]  bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Type Name
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Product Name
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Model Number
                  </th>{" "}
                  <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Purchase Date
                  </th>{" "}
                  <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Vendor Name
                  </th>{" "}
                  <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Is AMC
                  </th>{" "}
                  <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    AMC Start Date
                  </th>{" "}
                  <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    AMC End Date
                  </th>{" "}
                  <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    AMC Vender Name
                  </th>{" "}
                  <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Warranty Expiry{" "}
                  </th>{" "}
                  <th className="sticky top-0 z-20 bg-[#000C63] border-r-[1px] border-r-[#EAECF0] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Status
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Configuration
                  </th>
                </tr>
              </thead>

              <tbody>
                {data?.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    {/* <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                        <img src={item.image} alt="" className='  h-20' />
                    </td> */}
                    <td className=" whitespace-nowrap text-start p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                      {item.asset_type_name}
                    </td>
                    <td className="whitespace-nowrap text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                      {item.product_name}
                    </td>
                    <td className="whitespace-nowrap text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                      {item.model_no}
                    </td>
                    <td className=" whitespace-nowrap text-start p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                      {item.purchase_date}
                    </td>
                    <td className="whitespace-nowrap text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                      {item.vendor_name}
                    </td>
                    <td className="whitespace-nowrap text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                      {item.is_amc ? "Yes" : "No"}
                    </td>{" "}
                    <td className=" whitespace-nowrap text-start p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                      {item.amc_start_date}
                    </td>
                    <td className="whitespace-nowrap text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                      {item.amc_end_date}
                    </td>
                    <td className="whitespace-nowrap text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                      {item.amc_vendor_name}
                    </td>
                    <td className="whitespace-nowrap text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                      {item.warranty_expiry}
                    </td>
                    <td className="whitespace-nowrap text-center p-3 border-r-[1px] border-r-[#EAECF0] text-base roboto font-normal">
                      {item.status}
                    </td>
                    <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                      {item.configuration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <h1 className=" roboto font-bold text-xl sm:text-[24px] md:text-[30px] ">
          Quick Action
        </h1>
        <div className="flex-wrap  flex gap-4 justify-self-start sm:justify-center sm:items-center my-3">
          <Button
            onClick={() => redirectToAddAssets()}
            className="flex-shrink-0 min-w-[185px] rounded-full py-2.5 px-5 poppins-medium md:text-xl text-base text-white cursor-pointer bg-[#000C63] hover:bg-[#8A5CFF]"
          >
            Add new Assets
          </Button>
        </div>
      </div>
    </>
  );
};

export default DashboardTable;
