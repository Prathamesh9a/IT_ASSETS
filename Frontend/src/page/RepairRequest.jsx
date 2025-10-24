import Comment from "@/components/Comment";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import React, { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import RequestTimeline from "@/components/RequestTimeline";

const RepairRequest = () => {
  const [formData, setFormData] = useState({
    decision: "", // "approve" or "reject"
    remark: "",
  });
  // Load draft from localStorage when component mounts
  useEffect(() => {
    const savedDraft = localStorage.getItem("decisionDraft");
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, []);

  // Handle checkbox change (only one selection allowed)
  const handleDecision = (value) => {
    setFormData((prev) => ({
      ...prev,
      decision: prev.decision === value ? "" : value, // toggle
    }));
  };

  // Handle textarea input
  const handleRemarkChange = (e) => {
    setFormData((prev) => ({ ...prev, remark: e.target.value }));
  };

  // Save as Draft
  const handleSaveDraft = () => {
    localStorage.setItem("decisionDraft", JSON.stringify(formData));
    // alert("Draft saved ✅");
  };

  // Submit Decision
  const handleSubmit = () => {
    console.log("Form Submitted:", formData);
    localStorage.removeItem("decisionDraft"); // clear draft
    // alert("Decision submitted ✅");
  };
  return (
    <>
      <Header
        great={`Request #REQ001-Repair Request Details`}
        showNotification={true}
      />
      {/* Main wrapper */}
      <div className="px-6 pb-4 mt-20">
        <div className="bg-white border border-[#E1E1E1] px-3 py-2 rounded-lg">
          <div className="flex md:flex-row flex-col gap-8 max-w-4xl justify-between">
            {/* Request information */}
            <div>
              <h1 className="roboto font-bold text-xl sm:text-2xl md:text-3xl">
                Request Information
              </h1>
              <div className="flex flex-col space-y-2 mt-4">
                <p className="roboto text-lg md:text-xl font-semibold text-black">
                  Request Information :{" "}
                  <span className="text-[#808080] font-normal">REQ001</span>{" "}
                </p>
                <p className="roboto text-lg md:text-xl font-semibold text-black">
                  Type :{" "}
                  <span className="text-[#808080] font-normal">Repair</span>{" "}
                </p>
                <p className="roboto text-lg md:text-xl font-semibold text-black">
                  Asset :{" "}
                  <span className="text-[#808080] font-normal">
                    LP001 - Dell XPS 13
                  </span>{" "}
                </p>
                <p className="roboto text-lg md:text-xl font-semibold text-black">
                  Requested By : 
                  <span className="text-[#808080] font-normal">
                    John Doe (Engineering)
                  </span>{" "}
                </p>
                <p className="roboto text-lg md:text-xl font-semibold text-black">
                  Date Submitted : 
                  <span className="text-[#808080] font-normal">
                    2024-08-06 09:45
                  </span>{" "}
                </p>
                <p className="roboto text-lg md:text-xl font-semibold text-black flex ">
                  Priority :  <StatusBadge status="medium" />{" "}
                </p>
              </div>
            </div>

            {/* assets details */}
            <div>
              <h1 className="roboto font-bold text-xl sm:text-2xl md:text-3xl">
                Asset Details
              </h1>
              <div className="flex flex-col space-y-2 mt-4">
                <p className="roboto text-lg md:text-xl font-semibold text-black">
                  Serial Number :{" "}
                  <span className="text-[#808080] font-normal">DL12345XPS</span>{" "}
                </p>
                <p className="roboto text-lg md:text-xl font-semibold text-black">
                  Purchase Date :{" "}
                  <span className="text-[#808080] font-normal">2024-01-15</span>{" "}
                </p>
                <p className="roboto text-lg md:text-xl font-semibold text-black">
                  Warranty :{" "}
                  <span className="text-[#808080] font-normal">
                    Active until 2027-01-15
                  </span>{" "}
                </p>
                <p className="roboto text-lg md:text-xl font-semibold text-black flex ">
                  Current Status :  <StatusBadge status="assigned" />{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* divider */}
        <div className="mt-6 w-full border-b-[2px] border-b-[#E1E1E1]" />
        {/* comment */}
        <h1 className=" mt-4 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
          User Comments{" "}
        </h1>
        <Comment
          message={`"The laptop screen is flickering intermittently, especially when running graphics-intensive applications. The issue started yesterday and is getting worse. Unable to work effectively."`}
        />
        {/* divider */}
        <div className="mt-6 w-full border-b-[2px] border-b-[#E1E1E1]" />
        {/* admin response */}
        <h1 className=" mt-4 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
          Admin Response (Admin Only)
        </h1>
        {/* form */}
        <div>
          <h1 className=" mt-2 roboto font-bold text-lg sm:text-[20px] md:text-[24px]">
            Decision
          </h1>
          <div className="flex flex-col mt-3 gap-6 ">
            <div className="flex items-center gap-6">
              <div className="flex gap-2  items-center">
                <Checkbox
                  id="approve"
                  checked={formData.decision === "approve"}
                  onCheckedChange={() => handleDecision("approve")}
                />
                <Label
                  htmlFor="approve"
                  className="poppins-regular text-base md:text-lg"
                >
                  Approve
                </Label>
              </div>
              <div className="flex gap-2  items-center">
                <Checkbox
                  id="reject"
                  checked={formData.decision === "reject"}
                  onCheckedChange={() => handleDecision("reject")}
                />
                <Label
                  htmlFor="reject"
                  className="poppins-regular text-base md:text-lg"
                >
                  Reject
                </Label>
              </div>
            </div>
            <div className=" sm:w-92 relative">
              <label className="block font-normal absolute bg-white -top-3 left-3 text-[#6F7C8E] poppins-regular text-sm mb-2">
                Admin Remark
              </label>
              <textarea
                value={formData.remark}
                onChange={handleRemarkChange}
                rows="4"
                className="w-full px-4 py-3 border-2 border-[#E1E1E1] focus:outline-[#794CFF] poppins-medium  rounded-lg text-[#6F7C8E] resize-none"
                placeholder="Add Your comment / instructions......."
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleSubmit}
                className=" cursor-pointer  bg-[#000C63] hover:bg-[#8A5CFF]  poppins-medium md:text-xl text-base rounded-full py-3 px-4"
              >
                Submit Decision
              </Button>
              <Button
                onClick={handleSaveDraft}
                className=" cursor-pointer bg-white  text-[#000C63] border border-[#000C63] hover:bg-[#8A5CFF] poppins-medium md:text-xl text-base rounded-full py-3 px-4"
              >
                Save Draft
              </Button>
              <Button className="bg-gray-300 cursor-pointer hover:bg-gray-400 text-[#000C63]  poppins-medium md:text-xl text-base rounded-full py-3 px-4">
                Back to List
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-4 w-full border-b-[2px] border-b-[#E1E1E1]" />
        <h1 className=" mt-4 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
          Request Timeline{" "}
        </h1>
        <RequestTimeline
          by={"By John Doe on 2024-08-18 09:45"}
          message={`"Screen Flickering issue reported"`}
          title={"Request Submitted"}
        />
        <RequestTimeline
          by={"By John Doe on 2024-08-18 09:45"}
          message={`"Approved for repair. Asset sent to IT support."`}
          title={"Request Approved"}
        />
      </div>
    </>
  );
};

export default RepairRequest;
