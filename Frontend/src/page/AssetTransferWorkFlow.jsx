import { CustomVDropdown } from "@/components/CustomVDropdown";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import assetImage from "/images/assetImage.png";
import StatusButton from "@/components/StatusButoon";

const AssetTransferWorkFlow = () => {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [transferNote, setTransferNote] = useState("");
  const [activeField, setActiveField] = useState("");

  // Users dropdown data
  const users = [
    { value: "Alfaiz Khan", label: "Alfaiz Khan" },
    { value: "Rahul Sharma", label: "Rahul Sharma" },
    { value: "Priya Verma", label: "Priya Verma" },
    { value: "Amit Patel", label: "Amit Patel" },
    { value: "Sneha Gupta", label: "Sneha Gupta" },
  ];

  // Departments dropdown data
  const departments = [
    { value: "", label: "All Department" },
    { value: "Information Technology", label: "Information Technology" },
    { value: "Human Resources", label: "Human Resources" },
    { value: "Finance", label: "Finance" },
    { value: "Marketing", label: "Marketing" },
    { value: "Operations", label: "Operations" },
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

  return (
    <>
      <Header
        showNotification={true}
        great={"Transfer Asset - Step By Step Process"}
      />
      <div className="px-6 mt-20">
        <h1 className="mt-6 md:mt-14 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
          Transfer Asset - Step by step Process
        </h1>
        {/* step 1 */}

        <div className="mt-4 py-2 px-3 bg-[#FFFFFF] border border-[#E1E1E1] rounded-[12px]">
          <h1 className="text-[#784CFF] roboto font-bold text-lg sm:text-xl md:text-2xl">
            {" "}
            <span>Step 1: </span>Source User Request{" "}
          </h1>
          <div className="bg-[#F3EBFF] space-y-1 mt-2 px-3 py-2 rounded-[6px]">
            <p className="roboto text-base md:text-xl font- text-[#808080]">
              {" "}
              <span className="roboto font-semibold text-black">
                User :{" "}
              </span>{" "}
              John Doe request to transfer LP001 (Dell XPS 13){" "}
            </p>
            <p className="roboto text-base md:text-xl font- text-[#808080]">
              {" "}
              <span className="roboto font-semibold text-black">
                Reason :{" "}
              </span>{" "}
              "Switching to MacBook for development work"{" "}
            </p>
            <p className="roboto mt-2  font-medium text-sm">
              {" "}
              Priority :{" "}
              <span className="text-[#856404] bg-[#D4EDDA] py-1 px-2 rounded-full">
                Pending Admin review
              </span>{" "}
            </p>
          </div>
        </div>
        {/* divider */}
        <div className="border my-6 border-[#E1E1E1] " />

        {/* step-2 */}
        <div className="py-2 px-3 bg-[#FFFFFF] border border-[#E1E1E1] rounded-[12px]">
          <h1 className="text-[#784CFF] roboto font-bold text-lg sm:text-xl md:text-2xl">
            {" "}
            <span>Step 2: </span>Admin Review & Target Selection{" "}
          </h1>
          <div className="mt-4 flex sm:flex-row flex-col gap-8">
            <div className="relative w-full sm:w-64">
              <span className="absolute bg-[#FAFAFA] -top-3 text-[#6F7C8E] text-sm z-5 left-4">
                Select Target User
              </span>
              <CustomVDropdown
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                placeholder={"Select User"}
                options={users}
                style={getFieldStyles("user").input}
                onFocus={() => setActiveField("user")}
                onBlur={() => setActiveField(null)}
                className="bg-[#FAFAFA]"
              />
            </div>
            <div className="relative w-full sm:w-64">
              <span className="absolute bg-[#FAFAFA] -top-3 text-[#6F7C8E] text-sm z-5 left-4">
                Select Target User
              </span>
              <CustomVDropdown
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                placeholder={"All Department"}
                options={departments}
                style={getFieldStyles("department").input}
                onFocus={() => setActiveField("department")}
                onBlur={() => setActiveField(null)}
                className="bg-[#FAFAFA]"
              />
            </div>
          </div>
          <div className="relative mt-4 w-full md:w-[700px] ">
            <label className="block absolute -top-2.5 left-3 bg-[#FAFAFA] font-normal text-[#6F7C8E] roboto text-sm">
              Transfer Note
            </label>
            <textarea
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
              rows="4"
              className="w-full px-4 py-3 border bg-[#FAFAFA] border-[#E1E1E1] rounded-lg text-[#6F7C8E] resize-none focus:outline-[#2066FF]"
              placeholder="Please provide details......."
            />
          </div>
          <div className="flex gap-4 items-center mt-4">
            <Button
              className="px-2 sm:px-3 py-2  roboto font-medium text-[13.5px] sm:text-base md:text-lg  rounded-full bg-[#000C63] hover:bg-[#8A5CFF] text-white cursor-pointer 
   transition duration-300"
            >
              Process Transfer
            </Button>

            <Button
              className="px-2 sm:px-3 py-2 roboto font-medium text-[13.5px] sm:text-base md:text-lg   rounded-full text-red-400 hover:bg-red-200  bg-red-100 cursor-pointer 
    transition duration-300"
            >
              Reject Transfer
            </Button>
          </div>
        </div>
        {/* divider */}
        <div className="border my-6 border-[#E1E1E1] " />
        {/* step 3 */}
        <div className="py-2 px-3 bg-[#FFFFFF] border border-[#E1E1E1] rounded-[12px]">
          <h1 className="text-[#784CFF] roboto font-bold text-lg sm:text-xl md:text-2xl">
            {" "}
            <span>Step 3: </span>Transfer Completion{" "}
          </h1>
          <div className="mt-2 space-y-2">
            <h1 className="roboto font-semibold  text-base  sm:text-lg md:text-xl">
              Transfer completed Successfully!
            </h1>
            <p className="roboto text-base md:text-xl font- text-[#808080]">
              {" "}
              <span className="roboto font-semibold text-black">
                From :{" "}
              </span>{" "}
              John Doe (Engineering){" "}
            </p>
            <p className="roboto text-base md:text-xl font- text-[#808080]">
              {" "}
              <span className="roboto font-semibold text-black">
                To :{" "}
              </span>{" "}
              Jane Smith (HR){" "}
            </p>
            <p className="roboto text-base md:text-xl font- text-[#808080]">
              {" "}
              <span className="roboto font-semibold text-black">
                Asset :{" "}
              </span>{" "}
              LP001 - DELL XPS 13{" "}
            </p>
            <p className="roboto text-base md:text-xl font- text-[#808080]">
              {" "}
              <span className="roboto font-semibold text-black">
                Completed :{" "}
              </span>{" "}
              2024-08-06 11:15{" "}
            </p>
            <h2 className="text-base sm:text-lg md:text-xl roboto font-semibold">
              {" "}
              Both Users Have Been Notified via Email And In-App Notifications.
            </h2>
          </div>
        </div>
        <div className="border my-6 border-[#E1E1E1] " />

        {/* transfer history  */}
        <div>
          <h1 className=" roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
            Transfer History
          </h1>
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
      </div>
    </>
  );
};

export default AssetTransferWorkFlow;
