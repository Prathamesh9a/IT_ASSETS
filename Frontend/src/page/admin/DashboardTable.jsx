// import Header from "@/components/Header";
// import React, { useState } from "react";
// import NavigationTabs from "@/components/NavigationTabs";
// import { useSelector } from "react-redux";
// import { toast } from "sonner";

// import Card from "@/components/Card";
// import CardIcon1 from "@/components/icons/CardIcon1";
// import CardIcon2 from "@/components/icons/CardIcon2";
// import CardIcon3 from "@/components/icons/CardIcon3";
// import CardIcon4 from "@/components/icons/CardIcon4";
// import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router-dom";
// import {
//   useGetAssetsQuery,
//   useGetDashboardSummaryQuery,
//   useUpdateAssetMutation,
// } from "@/store/api/assetsApi";
// import { useGetDepartmentsQuery } from "@/store/api/settingsApi";
// import { useGetEmployeesQuery } from "@/store/api/employeeApi";

// const DashboardTable = () => {
//   const { data, isLoading } = useGetAssetsQuery();
//   // console.log("dtata", data);
//   const { data: dashboardSummary, isLoading: isLoadingdashboardSummary } =
//     useGetDashboardSummaryQuery();
//   // console.log("dashboardSummary", dashboardSummary);

//   const { isAuthenticated, user } = useSelector((state) => state.auth);
//   const navigate = useNavigate();
//   const { data: getAsset, isLoading: getAssetIsLoading } = useGetAssetsQuery();

//   const { data: employeeData, isLoading: employeeDataIsLoading } =
//     useGetEmployeesQuery();

//   const [editingCell, setEditingCell] = useState({ id: null, key: null });
//   const [tempValue, setTempValue] = useState("");
//   const [updateAsset] = useUpdateAssetMutation();

//   const handleCellClick = (id, key, currentValue) => {
//     if (key === "is_amc") {
//       setTempValue(
//         currentValue === true || currentValue === "true"
//           ? "Yes"
//           : currentValue === false || currentValue === "false"
//           ? "No"
//           : currentValue || "No"
//       );
//     } else {
//       setTempValue(currentValue ?? "");
//     }
//     setEditingCell({ id, key });
//   };

//   const handleBlur = async (item) => {
//     if (!editingCell.key) return;

//     const key = editingCell.key;
//     let value = tempValue;

//     if (key === "is_amc") {
//       value = tempValue === "Yes";

//       const hasVendor =
//         item.amc_vendor_name && item.amc_vendor_name.trim() !== "";

//       if (value === true && !hasVendor) {
//         toast.error("Please add AMC Vendor before selecting AMC");
//         setEditingCell({ id: null, key: null });
//         setTempValue("");
//         return;
//       }
//     }

//     const formData = new FormData();
//     formData.append(key, value);

//     try {
//       await updateAsset({ id: item.id, data: formData }).unwrap();
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setEditingCell({ id: null, key: null });
//       setTempValue("");
//     }
//   };

//   const activeUsers = !employeeDataIsLoading
//     ? (employeeData || []).filter((emp) => emp?.user?.is_active)
//     : [];

//   const loadings = [getAssetIsLoading, employeeDataIsLoading, false];
//   const counts = [
//     dashboardSummary?.total_assets,
//     dashboardSummary?.assigned_assets,
//     dashboardSummary?.pending_requests,
//     dashboardSummary?.under_repair,
//   ];

//   const cardName = [
//     "Total Assets",
//     "Assigned Assets",
//     "Pending Requests",
//     "Under Maintainance",
//   ];
//   const tabs = [
//     "Overview",
//     "Asset Management",
//     "System Audit",
//     "Reports",
//     "Setting",
//   ];
//   const svgMap = {
//     assetsSvg1: CardIcon1,
//     assetsSvg2: CardIcon2,
//     assetsSvg3: CardIcon3,
//     assetsSvg4: CardIcon4,
//   };
//   const iconKeys = ["assetsSvg1", "assetsSvg2", "assetsSvg3", "assetsSvg4"];

//   const [activeTab, setActiveTab] = useState(tabs[0]);

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     if (tab === "Overview") {
//       console.log("overviews");
//     } else if (tab === "Asset Management") {
//       console.log("Assets managment");
//     } else if (tab === "System Audit") {
//       console.log("system Audits");
//     } else if (tab === "Reports") {
//       console.log("reports");
//     } else if (tab === "Setting") {
//       console.log("settings");
//     }
//   };

//   const redirectToAddAssets = () => {
//     navigate("/addAssets");
//   };

//   return (
//     <>
//       <Header
//         great={""}
//         userName={user?.role}
//         dept={"(System Administrator)"}
//         showNotification={true}
//       />
//       <div className=" ">
//         {/* <h1 className=" mt-3 roboto font-bold text-lg sm:text-xl md:text-2xl">
//           Assets
//         </h1> */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-10 mt-3 border-b-[2px] border-b-[#E1E1E1] pb-4">
//           {Array.from({ length: 4 }).map((_, index) => {
//             const SvgIcon = svgMap[iconKeys[index]];
//             return (
//               <Card
//                 key={index}
//                 SvgIcon={SvgIcon}
//                 name={cardName[index]}
//                 count={counts[index]}
//                 isLoading={loadings[index]}
//               />
//             );
//           })}
//         </div>
//       <div className="flex gap-4 items-center">
//           <h1 className="mt-2 roboto font-bold text-lg sm:text-xl md:text-2xl">
//           Assets
//         </h1>
//         <input type="text" className="border border-gray-200" name="" id="" />
//       </div>
//         {/* tabel */}
//         <div className="overflow-x-auto pb-3 border-b-[2px] border-b-[#E1E1E1]  mb-2">
//           <div className="max-h-[50vh] overflow-y-auto  border border-gray-200 rounded-lg">
//             <table className="table-auto w-full min-w-max">
//               <thead className="bg-[#000C63] text-white font-medium sticky top-0 z-30">
//                 <tr>
//                   <th className="sticky border-r border-r-white top-0 z-20 rounded-tl-[10px] bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
//                     Type Name
//                   </th>
//                   <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
//                     Product Name
//                   </th>
//                   <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
//                     Model Number
//                   </th>
//                   <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
//                     Purchase Date
//                   </th>
//                   <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
//                     Vendor Name
//                   </th>
//                   <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
//                     Is AMC
//                   </th>
//                   <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
//                     AMC Start Date
//                   </th>
//                   <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
//                     AMC End Date
//                   </th>
//                   <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
//                     AMC Vender Name
//                   </th>
//                   <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
//                     Warranty Expiry
//                   </th>
//                   <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
//                     Status
//                   </th>
//                   <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base rounded-tr-[10px] font-medium">
//                     Configuration
//                   </th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {data && data.length > 0 ? (
//                   data.map((item, index) => (
//                     <tr
//                       key={item.id}
//                       className={`border-b border-gray-200 ${
//                         index % 2 === 0 ? "bg-white" : "bg-gray-300"
//                       }`}
//                     >
//                       {/* asset_type_name */}
//                       <td
//                         className="whitespace-nowrap border-r border-r-white text-start p-2 text-base roboto font-normal"
//                         onDoubleClick={() =>
//                           handleCellClick(
//                             item.id,
//                             "asset_type",
//                             item.asset_type
//                           )
//                         }
//                       >
//                         {editingCell.id === item.id &&
//                         editingCell.key === "asset_type" ? (
//                           <input
//                             value={tempValue}
//                             autoFocus
//                             onChange={(e) => setTempValue(e.target.value)}
//                             onBlur={() => handleBlur(item)}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter") {
//                                 e.preventDefault();
//                                 handleBlur(item);
//                               }
//                             }}
//                             className="border rounded p-1 w-full text-black"
//                           />
//                         ) : (
//                           item.asset_type_name
//                         )}
//                       </td>

//                       {/* product_name */}
//                       <td
//                         className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
//                         onDoubleClick={() =>
//                           handleCellClick(
//                             item.id,
//                             "product_name",
//                             item.product_name
//                           )
//                         }
//                       >
//                         {editingCell.id === item.id &&
//                         editingCell.key === "product_name" ? (
//                           <input
//                             value={tempValue}
//                             autoFocus
//                             onChange={(e) => setTempValue(e.target.value)}
//                             onBlur={() => handleBlur(item)}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter") {
//                                 e.preventDefault();
//                                 handleBlur(item);
//                               }
//                             }}
//                             className="border rounded p-1 w-full text-black"
//                           />
//                         ) : (
//                           item.product_name
//                         )}
//                       </td>

//                       {/* model_no */}
//                       <td
//                         className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
//                         onDoubleClick={() =>
//                           handleCellClick(item.id, "model_no", item.model_no)
//                         }
//                       >
//                         {editingCell.id === item.id &&
//                         editingCell.key === "model_no" ? (
//                           <input
//                             value={tempValue}
//                             autoFocus
//                             onChange={(e) => setTempValue(e.target.value)}
//                             onBlur={() => handleBlur(item)}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter") {
//                                 e.preventDefault();
//                                 handleBlur(item);
//                               }
//                             }}
//                             className="border rounded p-1 w-full text-black"
//                           />
//                         ) : (
//                           item.model_no
//                         )}
//                       </td>

//                       {/* purchase_date */}
//                       <td
//                         className="whitespace-nowrap border-r border-r-white text-start p-2 text-base roboto font-normal"
//                         onDoubleClick={() =>
//                           handleCellClick(
//                             item.id,
//                             "purchase_date",
//                             item.purchase_date
//                           )
//                         }
//                       >
//                         {editingCell.id === item.id &&
//                         editingCell.key === "purchase_date" ? (
//                           <input
//                             type="date"
//                             value={tempValue}
//                             autoFocus
//                             onChange={(e) => setTempValue(e.target.value)}
//                             onBlur={() => handleBlur(item)}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter") {
//                                 e.preventDefault();
//                                 handleBlur(item);
//                               }
//                             }}
//                             className="border rounded p-1 w-full text-black"
//                           />
//                         ) : (
//                           item.purchase_date
//                         )}
//                       </td>

//                       {/* vendor */}
//                       <td
//                         className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
//                         onDoubleClick={() =>
//                           handleCellClick(item.id, "vendor", item.vendor)
//                         }
//                       >
//                         {editingCell.id === item.id &&
//                         editingCell.key === "vendor" ? (
//                           <input
//                             value={tempValue}
//                             autoFocus
//                             onChange={(e) => setTempValue(e.target.value)}
//                             onBlur={() => handleBlur(item)}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter") {
//                                 e.preventDefault();
//                                 handleBlur(item);
//                               }
//                             }}
//                             className="border rounded p-1 w-full text-black"
//                           />
//                         ) : (
//                           item.vendor_name
//                         )}
//                       </td>

//                       {/* is_amc */}
//                       <td
//                         className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
//                         onDoubleClick={
//                           () => handleCellClick(item.id, "is_amc", item.is_amc) // pass boolean here
//                         }
//                       >
//                         {editingCell.id === item.id &&
//                         editingCell.key === "is_amc" ? (
//                           <select
//                             autoFocus
//                             value={tempValue}
//                             onClick={(e) => e.stopPropagation()}
//                             onMouseDown={(e) => e.stopPropagation()}
//                             onChange={(e) => setTempValue(e.target.value)}
//                             onBlur={() => handleBlur(item)}
//                             className="border rounded p-1 w-full text-black"
//                           >
//                             <option value="Yes">Yes</option>
//                             <option value="No">No</option>
//                           </select>
//                         ) : item.is_amc ? (
//                           "Yes"
//                         ) : (
//                           "No"
//                         )}
//                       </td>

//                       {/* amc_start_date */}
//                       <td
//                         className="whitespace-nowrap border-r border-r-white text-start p-2 text-base roboto font-normal"
//                         onDoubleClick={() =>
//                           handleCellClick(
//                             item.id,
//                             "amc_start_date",
//                             item.amc_start_date
//                           )
//                         }
//                       >
//                         {editingCell.id === item.id &&
//                         editingCell.key === "amc_start_date" ? (
//                           <input
//                             type="date"
//                             value={tempValue}
//                             autoFocus
//                             onChange={(e) => setTempValue(e.target.value)}
//                             onBlur={() => handleBlur(item)}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter") {
//                                 e.preventDefault();
//                                 handleBlur(item);
//                               }
//                             }}
//                             className="border rounded p-1 w-full text-black"
//                           />
//                         ) : (
//                           item.amc_start_date
//                         )}
//                       </td>

//                       {/* amc_end_date */}
//                       <td
//                         className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
//                         onDoubleClick={() =>
//                           handleCellClick(
//                             item.id,
//                             "amc_end_date",
//                             item.amc_end_date
//                           )
//                         }
//                       >
//                         {editingCell.id === item.id &&
//                         editingCell.key === "amc_end_date" ? (
//                           <input
//                             type="date"
//                             value={tempValue}
//                             autoFocus
//                             onChange={(e) => setTempValue(e.target.value)}
//                             onBlur={() => handleBlur(item)}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter") {
//                                 e.preventDefault();
//                                 handleBlur(item);
//                               }
//                             }}
//                             className="border rounded p-1 w-full text-black"
//                           />
//                         ) : (
//                           item.amc_end_date
//                         )}
//                       </td>

//                       {/* amc_vendor */}
//                       <td
//                         className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
//                         onDoubleClick={() =>
//                           handleCellClick(
//                             item.id,
//                             "amc_vendor",
//                             item.amc_vendor_name
//                           )
//                         }
//                       >
//                         {editingCell.id === item.id &&
//                         editingCell.key === "amc_vendor" ? (
//                           <input
//                             value={tempValue}
//                             autoFocus
//                             onChange={(e) => setTempValue(e.target.value)}
//                             onBlur={() => handleBlur(item)}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter") {
//                                 e.preventDefault();
//                                 handleBlur(item);
//                               }
//                             }}
//                             className="border rounded p-1 w-full text-black"
//                           />
//                         ) : (
//                           item.amc_vendor_name
//                         )}
//                       </td>

//                       {/* warranty_expiry */}
//                       <td
//                         className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
//                         onDoubleClick={() =>
//                           handleCellClick(
//                             item.id,
//                             "warranty_expiry",
//                             item.warranty_expiry
//                           )
//                         }
//                       >
//                         {editingCell.id === item.id &&
//                         editingCell.key === "warranty_expiry" ? (
//                           <input
//                             type="date"
//                             value={tempValue}
//                             autoFocus
//                             onChange={(e) => setTempValue(e.target.value)}
//                             onBlur={() => handleBlur(item)}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter") {
//                                 e.preventDefault();
//                                 handleBlur(item);
//                               }
//                             }}
//                             className="border rounded p-1 w-full text-black"
//                           />
//                         ) : (
//                           item.warranty_expiry
//                         )}
//                       </td>

//                       {/* status */}
//                       <td
//                         className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
//                         onDoubleClick={() =>
//                           handleCellClick(item.id, "status", item.status)
//                         }
//                       >
//                         {item.status}
//                       </td>

//                       {/* configuration */}
//                       <td
//                         className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
//                         onDoubleClick={() =>
//                           handleCellClick(
//                             item.id,
//                             "configuration",
//                             item.configuration
//                           )
//                         }
//                       >
//                         {editingCell.id === item.id &&
//                         editingCell.key === "configuration" ? (
//                           <input
//                             value={tempValue}
//                             autoFocus
//                             onChange={(e) => setTempValue(e.target.value)}
//                             onBlur={() => handleBlur(item)}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter") {
//                                 e.preventDefault();
//                                 handleBlur(item);
//                               }
//                             }}
//                             className="border rounded p-1 w-full text-black"
//                           />
//                         ) : (
//                           item.configuration
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan="12"
//                       className="text-center p-6 text-gray-500 bg-gray-50 roboto text-base"
//                     >
//                       No asset logs found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//         {/* <h1 className=" roboto font-bold text-lg sm:text-xl md:text-2xl ">
//           Quick Action
//         </h1> */}
//         <div className="flex-wrap  flex gap-4 justify-self-start sm:justify-center sm:items-center my-2">
//           <Button
//             onClick={() => redirectToAddAssets()}
//             className="flex-shrink-0 min-w-[170px] rounded-full py-2.5 px-2 poppins-medium text-base text-white cursor-pointer bg-[#000C63] hover:bg-gradient-to-r hover:from-[#000C63] hover:to-[#3B82F6] hover:scale-105 transition-all duration-200"
//           >
//             Add new Assets
//           </Button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default DashboardTable;
































































































import Header from "@/components/Header";
import React, { useState, useMemo, useCallback } from "react";
import NavigationTabs from "@/components/NavigationTabs";
import { useSelector } from "react-redux";
import { toast } from "sonner";

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
  useUpdateAssetMutation,
} from "@/store/api/assetsApi";
import { useGetDepartmentsQuery } from "@/store/api/settingsApi";
import { useGetEmployeesQuery } from "@/store/api/employeeApi";
import { Search } from "lucide-react";

const DashboardTable = () => {
  const { data: assetsData, isLoading } = useGetAssetsQuery();
  // console.log("dtata", assetsData);
  const { data: dashboardSummary, isLoading: isLoadingdashboardSummary } =
    useGetDashboardSummaryQuery();
  // console.log("dashboardSummary", dashboardSummary);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { data: getAsset, isLoading: getAssetIsLoading } = useGetAssetsQuery();

  const { data: employeeData, isLoading: employeeDataIsLoading } =
    useGetEmployeesQuery();

  const [editingCell, setEditingCell] = useState({ id: null, key: null });
  const [tempValue, setTempValue] = useState("");
  const [updateAsset] = useUpdateAssetMutation();
  
  // Add search state
  const [searchQuery, setSearchQuery] = useState("");

  const handleCellClick = (id, key, currentValue) => {
    if (key === "is_amc") {
      setTempValue(
        currentValue === true || currentValue === "true"
          ? "Yes"
          : currentValue === false || currentValue === "false"
          ? "No"
          : currentValue || "No"
      );
    } else {
      setTempValue(currentValue ?? "");
    }
    setEditingCell({ id, key });
  };

  const handleBlur = async (item) => {
    if (!editingCell.key) return;

    const key = editingCell.key;
    let value = tempValue;

    if (key === "is_amc") {
      value = tempValue === "Yes";

      const hasVendor =
        item.amc_vendor_name && item.amc_vendor_name.trim() !== "";

      if (value === true && !hasVendor) {
        toast.error("Please add AMC Vendor before selecting AMC");
        setEditingCell({ id: null, key: null });
        setTempValue("");
        return;
      }
    }

    const formData = new FormData();
    formData.append(key, value);

    try {
      await updateAsset({ id: item.id, data: formData }).unwrap();
    } catch (error) {
      console.error(error);
    } finally {
      setEditingCell({ id: null, key: null });
      setTempValue("");
    }
  };

  const activeUsers = !employeeDataIsLoading
    ? (employeeData || []).filter((emp) => emp?.user?.is_active)
    : [];

  const loadings = [getAssetIsLoading, employeeDataIsLoading, false];
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
    "Under Maintenance",
  ];
  const tabs = [
    "Overview",
    "Asset Management",
    "System Audit",
    "Reports",
    "Settings",
  ];
  const svgMap = {
    assetsSvg1: CardIcon1,
    assetsSvg2: CardIcon2,
    assetsSvg3: CardIcon3,
    assetsSvg4: CardIcon4,
  };
  const iconKeys = ["assetsSvg1", "assetsSvg2", "assetsSvg3", "assetsSvg4"];

  const [activeTab, setActiveTab] = useState(tabs[0]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "Overview") {
      console.log("overview");
    } else if (tab === "Asset Management") {
      console.log("Assets management");
    } else if (tab === "System Audit") {
      console.log("system Audit");
    } else if (tab === "Reports") {
      console.log("reports");
    } else if (tab === "Settings") {
      console.log("settings");
    }
  };

  const redirectToAddAssets = () => {
    navigate("/addAssets");
  };

  // Search functionality - filter assets based on search query
  const filteredAssets = useMemo(() => {
    if (!assetsData || !Array.isArray(assetsData)) return [];
    
    if (!searchQuery.trim()) return assetsData;

    const query = searchQuery.toLowerCase().trim();
    
    return assetsData.filter((asset) => {
      // Search through all relevant string fields
      const searchableFields = [
        asset.asset_type_name,
        asset.product_name,
        asset.model_no,
        asset.vendor_name,
        asset.status,
        asset.configuration,
        asset.amc_vendor_name,
      ];

      // Convert boolean field to searchable string
      const amcStatus = asset.is_amc ? "yes" : "no";
      
      // Check if any field contains the search query
      return (
        searchableFields.some(field => 
          field && field.toString().toLowerCase().includes(query)
        ) ||
        amcStatus.includes(query) ||
        // Search in date fields (formatted as strings)
        (asset.purchase_date && asset.purchase_date.includes(query)) ||
        (asset.amc_start_date && asset.amc_start_date.includes(query)) ||
        (asset.amc_end_date && asset.amc_end_date.includes(query)) ||
        (asset.warranty_expiry && asset.warranty_expiry.includes(query))
      );
    });
  }, [assetsData, searchQuery]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <>
      <Header
        great={""}
        userName={user?.role}
        dept={"(System Administrator)"}
        showNotification={true}
      />
      <div className=" ">
        {/* <h1 className=" mt-3 roboto font-bold text-lg sm:text-xl md:text-2xl">
          Assets
        </h1> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-10 mt-3 border-b-[2px] border-b-[#E1E1E1] pb-4">
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
        
        {/* Search and Title Section */}
        <div className="flex flex-col sm:flex-row gap-12 items-start my-2">
          <h1 className="mt-2 roboto font-bold text-lg sm:text-xl md:text-2xl">
            Assets
          </h1>
          
          <div className="relative w-full sm:w-auto flex items-end gap-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search in assets table..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-[#000C63] focus:border-transparent transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}  
            </div>
            
            {/* Search result count */}
            {searchQuery && (
              <div className="mt-1 text-xs text-gray-600">
                Found {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''} 
                {assetsData && filteredAssets.length !== assetsData.length && 
                  ` of ${assetsData.length} total`}
              </div>
            )}
          </div>
        </div>
        
        {/* tabel */}
        <div className="overflow-x-auto pb-3 border-b-[2px] border-b-[#E1E1E1] mb-2">
          <div className="max-h-[49vh] overflow-y-auto border border-gray-200 rounded-lg">
            <table className="table-auto w-full min-w-max">
              <thead className="bg-[#000C63] text-white font-medium sticky top-0 z-30">
                <tr>
                  <th className="sticky border-r border-r-white top-0 z-20 rounded-tl-[10px] bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
                    Type Name
                  </th>
                  <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
                    Product Name
                  </th>
                  <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
                    Model Number
                  </th>
                  <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
                    Purchase Date
                  </th>
                  <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
                    Vendor Name
                  </th>
                  <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
                    Is AMC
                  </th>
                  <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
                    AMC Start Date
                  </th>
                  <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
                    AMC End Date
                  </th>
                  <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
                    AMC Vender Name
                  </th>
                  <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
                    Warranty Expiry
                  </th>
                  <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base font-medium">
                    Status
                  </th>
                  <th className="sticky border-r border-r-white top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base rounded-tr-[10px] font-medium">
                    Configuration
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAssets && filteredAssets.length > 0 ? (
                  filteredAssets.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-300"
                      }`}
                    >
                      {/* asset_type_name */}
                      <td
                        className="whitespace-nowrap border-r border-r-white text-start p-2 text-base roboto font-normal"
                        onDoubleClick={() =>
                          handleCellClick(
                            item.id,
                            "asset_type",
                            item.asset_type
                          )
                        }
                      >
                        {editingCell.id === item.id &&
                        editingCell.key === "asset_type" ? (
                          <input
                            value={tempValue}
                            autoFocus
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => handleBlur(item)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleBlur(item);
                              }
                            }}
                            className="border rounded p-1 w-full text-black"
                          />
                        ) : (
                          item.asset_type_name
                        )}
                      </td>

                      {/* product_name */}
                      <td
                        className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
                        onDoubleClick={() =>
                          handleCellClick(
                            item.id,
                            "product_name",
                            item.product_name
                          )
                        }
                      >
                        {editingCell.id === item.id &&
                        editingCell.key === "product_name" ? (
                          <input
                            value={tempValue}
                            autoFocus
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => handleBlur(item)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleBlur(item);
                              }
                            }}
                            className="border rounded p-1 w-full text-black"
                          />
                        ) : (
                          item.product_name
                        )}
                      </td>

                      {/* model_no */}
                      <td
                        className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
                        onDoubleClick={() =>
                          handleCellClick(item.id, "model_no", item.model_no)
                        }
                      >
                        {editingCell.id === item.id &&
                        editingCell.key === "model_no" ? (
                          <input
                            value={tempValue}
                            autoFocus
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => handleBlur(item)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleBlur(item);
                              }
                            }}
                            className="border rounded p-1 w-full text-black"
                          />
                        ) : (
                          item.model_no
                        )}
                      </td>

                      {/* purchase_date */}
                      <td
                        className="whitespace-nowrap border-r border-r-white text-start p-2 text-base roboto font-normal"
                        onDoubleClick={() =>
                          handleCellClick(
                            item.id,
                            "purchase_date",
                            item.purchase_date
                          )
                        }
                      >
                        {editingCell.id === item.id &&
                        editingCell.key === "purchase_date" ? (
                          <input
                            type="date"
                            value={tempValue}
                            autoFocus
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => handleBlur(item)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleBlur(item);
                              }
                            }}
                            className="border rounded p-1 w-full text-black"
                          />
                        ) : (
                          item.purchase_date
                        )}
                      </td>

                      {/* vendor */}
                      <td
                        className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
                        onDoubleClick={() =>
                          handleCellClick(item.id, "vendor", item.vendor)
                        }
                      >
                        {editingCell.id === item.id &&
                        editingCell.key === "vendor" ? (
                          <input
                            value={tempValue}
                            autoFocus
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => handleBlur(item)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleBlur(item);
                              }
                            }}
                            className="border rounded p-1 w-full text-black"
                          />
                        ) : (
                          item.vendor_name
                        )}
                      </td>

                      {/* is_amc */}
                      <td
                        className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
                        onDoubleClick={
                          () => handleCellClick(item.id, "is_amc", item.is_amc) // pass boolean here
                        }
                      >
                        {editingCell.id === item.id &&
                        editingCell.key === "is_amc" ? (
                          <select
                            autoFocus
                            value={tempValue}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => handleBlur(item)}
                            className="border rounded p-1 w-full text-black"
                          >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        ) : item.is_amc ? (
                          "Yes"
                        ) : (
                          "No"
                        )}
                      </td>

                      {/* amc_start_date */}
                      <td
                        className="whitespace-nowrap border-r border-r-white text-start p-2 text-base roboto font-normal"
                        onDoubleClick={() =>
                          handleCellClick(
                            item.id,
                            "amc_start_date",
                            item.amc_start_date
                          )
                        }
                      >
                        {editingCell.id === item.id &&
                        editingCell.key === "amc_start_date" ? (
                          <input
                            type="date"
                            value={tempValue}
                            autoFocus
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => handleBlur(item)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleBlur(item);
                              }
                            }}
                            className="border rounded p-1 w-full text-black"
                          />
                        ) : (
                          item.amc_start_date
                        )}
                      </td>

                      {/* amc_end_date */}
                      <td
                        className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
                        onDoubleClick={() =>
                          handleCellClick(
                            item.id,
                            "amc_end_date",
                            item.amc_end_date
                          )
                        }
                      >
                        {editingCell.id === item.id &&
                        editingCell.key === "amc_end_date" ? (
                          <input
                            type="date"
                            value={tempValue}
                            autoFocus
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => handleBlur(item)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleBlur(item);
                              }
                            }}
                            className="border rounded p-1 w-full text-black"
                          />
                        ) : (
                          item.amc_end_date
                        )}
                      </td>

                      {/* amc_vendor */}
                      <td
                        className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
                        onDoubleClick={() =>
                          handleCellClick(
                            item.id,
                            "amc_vendor",
                            item.amc_vendor_name
                          )
                        }
                      >
                        {editingCell.id === item.id &&
                        editingCell.key === "amc_vendor" ? (
                          <input
                            value={tempValue}
                            autoFocus
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => handleBlur(item)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleBlur(item);
                              }
                            }}
                            className="border rounded p-1 w-full text-black"
                          />
                        ) : (
                          item.amc_vendor_name
                        )}
                      </td>

                      {/* warranty_expiry */}
                      <td
                        className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
                        onDoubleClick={() =>
                          handleCellClick(
                            item.id,
                            "warranty_expiry",
                            item.warranty_expiry
                          )
                        }
                      >
                        {editingCell.id === item.id &&
                        editingCell.key === "warranty_expiry" ? (
                          <input
                            type="date"
                            value={tempValue}
                            autoFocus
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => handleBlur(item)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleBlur(item);
                              }
                            }}
                            className="border rounded p-1 w-full text-black"
                          />
                        ) : (
                          item.warranty_expiry
                        )}
                      </td>

                      {/* status */}
                      <td
                        className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
                        onDoubleClick={() =>
                          handleCellClick(item.id, "status", item.status)
                        }
                      >
                        {item.status}
                      </td>

                      {/* configuration */}
                      <td
                        className="whitespace-nowrap border-r border-r-white text-center p-2 text-base roboto font-normal"
                        onDoubleClick={() =>
                          handleCellClick(
                            item.id,
                            "configuration",
                            item.configuration
                          )
                        }
                      >
                        {editingCell.id === item.id &&
                        editingCell.key === "configuration" ? (
                          <input
                            value={tempValue}
                            autoFocus
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => handleBlur(item)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleBlur(item);
                              }
                            }}
                            className="border rounded p-1 w-full text-black"
                          />
                        ) : (
                          item.configuration
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="12"
                      className="text-center p-6 text-gray-500 bg-gray-50 roboto text-base"
                    >
                      {searchQuery 
                        ? `No assets found matching "${searchQuery}"` 
                        : "No asset logs found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* <h1 className=" roboto font-bold text-lg sm:text-xl md:text-2xl ">
          Quick Action
        </h1> */}
        <div className="flex-wrap flex gap-4 justify-self-start sm:justify-center sm:items-center my-2">
          <Button
            onClick={() => redirectToAddAssets()}
            className="flex-shrink-0 min-w-[170px] rounded-full py-2.5 px-2 poppins-medium text-base text-white cursor-pointer bg-[#000C63] hover:bg-gradient-to-r hover:from-[#000C63] hover:to-[#3B82F6] hover:scale-105 transition-all duration-200"
          >
            Add new Assets
          </Button>
        </div>
      </div>
    </>
  );
};

export default DashboardTable;