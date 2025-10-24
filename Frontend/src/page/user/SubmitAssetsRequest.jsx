import { CustomVDropdown } from "@/components/CustomVDropdown";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  useGetAssetByIdQuery,
  useReqTransferMutation,
  useRequestActionMutation,
} from "@/store/api/assetsApi";
import { useGetEmployeesQuery } from "@/store/api/employeeApi";
import { useGetDepartmentsQuery } from "@/store/api/settingsApi";
import { FileText, Upload } from "lucide-react";
import React, { useState, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SubmitAssetsRequest = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeField, setActiveField] = useState("");

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const {
    data: employeeData,
    isLoading: employeeIsLoading,
    isError: employeeIsError,
  } = useGetEmployeesQuery();
  console.log(employeeData);

  const {
    data: deparetmentData,
    isLoading: departmentIsLoading,
    isError: departmentIsError,
  } = useGetDepartmentsQuery();
  const [
    reqTransfer,
    {
      data: reqTransferData,
      isLoading: reqTransferIsLoading,
      isError: reqTransferIsError,
    },
  ] = useReqTransferMutation();
  const [
    requestAction,
    {
      data: requestActionData,
      isLoading: requestActionIsLoading,
      isError: requestActionIsError,
    },
  ] = useRequestActionMutation();

  const action = searchParams.get("action");
  const id = searchParams.get("id");
  const { data, isLoading, isError } = useGetAssetByIdQuery(id);

  const [formData, setFormData] = useState({
    status_requested: action,
    asset_id: id,
    reason: "",
    transfer_to_employee_id: "",
  });

  //  const employeeOptions = employeeData?.filter((emp) => emp?.user?.is_active) // only active users
  const employeeOptions =
    employeeData
      ?.filter((emp) => emp?.active)
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

  console.log(employeeOptions);

  // department data for customVdropdown
  const departmentOptions = (deparetmentData?.departments || []).map(
    (dept) => ({
      label: dept,
      value: dept.toLowerCase(),
    })
  );

  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // ---------------- Debounce Logic ----------------

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // ---------------- Handle Drop ----------------
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("video/")
      );
      setUploadedFiles((prev) => [...prev, ...files]);
    }
  };

  // ---------------- Handle File Select ----------------
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files).filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("video/")
      );
      setUploadedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------------- Form Actions ----------------
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    //  console.log(formData);
    let payload = {};
    if (formData.status_requested?.toLowerCase() === "transfer_requested") {
      payload = {
        asset_id: formData.asset_id,
        reason: formData.reason,
        transfer_to_employee_id: formData.transfer_to_employee_id || null,
      };
      // api call for transfer request here
      try {
        const response = await reqTransfer(payload).unwrap();
        toast.success(response?.detail);
        setFormData({
          status_requested: "",
          asset_id: "",
          reason: "",
          transfer_to_employee_id: "",
        });
        navigate(-1); // Go back to previous page
        // console.log("Transfer Request Successful:", response);
      } catch (error) {
        const errorMessage =
          error?.data?.detail ||
          error?.error ||
          error?.data?.reason ||
          "Something went wrong!";
        toast.error(`Transfer Request Failed: ${errorMessage}`);
        console.log("Transfer Request Failed:", error);
      }
    } else {
      payload = {
        asset_id: formData.asset_id,
        status_requested: formData.status_requested,
        reason: formData.reason,
      };

      // api call for other request here
      try {
        const response = await requestAction(payload).unwrap();
        toast.success(response?.detail);
        setFormData({
          status_requested: "",
          asset_id: "",
          reason: "",
          transfer_to_employee_id: "",
        });
        navigate(-1); // Go back to previous page
        // console.log("Transfer Request Successful:", response);
      } catch (error) {
        const errorMessage =
          error?.data?.detail ||
          error?.error ||
          error?.data?.reason ||
          "Something went wrong!";
        toast.error(
          `${formData.status_requested?.toLowerCase()} - ${errorMessage}`
        );

        console.log(
          formData.status_requested?.toLowerCase(),
          "Transfer Request Failed:",
          error
        );
      }
    }
  };

  const handleCancelForm = () => {
    navigate(-1); // Go back to previous page
  };
  const getFieldStyles = (field) => ({
    label: {
      color: activeField === field ? "#2066FF" : "#6F7C8E",
      fontWeight: "normal",
    },
    input: {
      borderColor: activeField === field ? "#2066FF" : "#E1E1E1",
    },
  });
  return (
    <>
      <Header great={"Add/Edit Assets"} showNotification={true} />
      <div className="px-6 mt-24">
        <h1 className="mt-6 md:mt-14 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
          Submit Assets Request
        </h1>
        <form onSubmit={handleSubmitForm} className="mt-10">
          <div className="max-w-4xl overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Column */}
              <div className="flex-1 space-y-6">
                {/* Request Type */}
                <div className="w-full relative">
                  <label className="relative top-3 left-3 bg-white roboto font-normal text-sm text-[#6F7C8E] mb-2">
                    Request Type
                  </label>
                  <input
                    type="text"
                    value={formData.status_requested}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-[#6F7C8E] text-sm roboto font-medium focus:outline-none"
                  />
                </div>

                {/* Upload Area */}
                <div>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                      dragActive
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("file-input").click()
                    }
                  >
                    <input
                      id="file-input"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="image/*,video/*"
                    />

                    <div className="flex gap-2 flex-row flex-wrap justify-between items-center">
                      <div className="relative mb-3">
                        <svg
                        width="42"
                        height="45"
                        viewBox="0 0 42 45"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M24.2313 9.21132H29.3714L21.5039 1.2251V6.56937C21.5039 8.01711 22.7208 9.21141 24.2312 9.21141L24.2313 9.21132Z"
                          fill="#000C63"
                        />
                        <path
                          d="M15.7033 29.3539H6.58752C6.12597 29.3539 5.74837 28.9899 5.74837 28.5443C5.74837 28.0989 6.12597 27.7345 6.58752 27.7345H16.2592C16.7939 26.4189 17.5072 25.3051 18.3886 24.1918H6.58752C6.12597 24.1918 5.74837 23.8276 5.74837 23.3819C5.74837 22.9366 6.12597 22.5723 6.58752 22.5723H19.9831C22.5005 20.4465 25.8362 19.0904 29.4761 19.0904C29.8222 19.0904 30.1057 19.1206 30.5253 19.1511V10.8305H24.2312C21.7977 10.8305 19.8257 8.90742 19.8257 6.56911V0H3.73439C1.65729 0 0 1.63967 0 3.65397V34.5467C0 36.561 1.65729 38.1602 3.73448 38.1602H16.3744C15.6507 36.5409 15.2521 34.7188 15.2521 32.8159C15.2415 31.6216 15.4095 30.4674 15.7033 29.3539ZM6.58752 17.5112H17.2138C17.6754 17.5112 18.053 17.8756 18.053 18.3212C18.053 18.7666 17.6754 19.1309 17.2138 19.1309H6.58752C6.12597 19.1309 5.74837 18.7666 5.74837 18.3213C5.74837 17.8756 6.12597 17.5113 6.58752 17.5113V17.5112Z"
                          fill="#000C63"
                        />
                        <path
                          d="M29.4643 20.7397C22.5518 20.7397 16.9292 26.1649 16.9292 32.8356C16.9292 39.5059 22.5518 44.9314 29.4643 44.9314C36.3773 44.9314 41.9999 39.5059 41.9999 32.8356C41.9999 26.1649 36.3773 20.7397 29.4643 20.7397ZM36.1677 33.0176C36.0104 33.1595 35.8004 33.2305 35.6011 33.2305C35.3809 33.2305 35.1606 33.1392 34.9925 32.9771L30.3142 28.1186V39.678C30.3142 40.1236 29.9366 40.488 29.4751 40.488C29.0136 40.488 28.636 40.1236 28.636 39.678V28.1087L23.9367 32.9672C23.6219 33.2911 23.0763 33.3114 22.7406 33.0076C22.4052 32.7039 22.3839 32.1877 22.6987 31.8637L28.8456 25.4968C29.003 25.335 29.2233 25.2438 29.4644 25.2438C29.706 25.2438 29.9156 25.3351 30.0837 25.4968L36.2307 31.8637C36.5244 32.198 36.5031 32.7142 36.1677 33.0177V33.0176Z"
                          fill="#000C63"
                        />
                      </svg>
                      </div>
                      <div className="">
                        <h3 className="text-lg font-bold text-gray-700 mb-1">
                          Click To Upload
                        </h3>
                        <p className="text-sm font-normal text-gray-500">
                          Asset image and video
                        </p>
                      </div>
                      <button
                        type="button"
                        className="mt-4 px-6 py-2 roboto font-semibold  hover:bg-[#6938E4] border border-[#000C63] hover:text-white  text-[#000C63] cursor-pointer text-sm rounded-full transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById("file-input").click();
                        }}
                      >
                        Choose File
                      </button>
                    </div>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700 truncate">
                              {file.name}
                            </span>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 cursor-pointer roboto hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="flex-1 ">
                {formData.status_requested?.toLowerCase() ===
                  "transfer_requested" && (
                  <>
                    <div className="relative w-full mt-4">
                      <label
                        htmlFor="id"
                        className="absolute bg-[#FAFAFA] z-10 text-[#6F7C8E] left-2 -top-2 text-xs roboto"
                      >
                        Departments
                      </label>
                      <CustomVDropdown
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        value={selectedDepartment}
                        options={departmentOptions ?? []} // safe fallback
                        placeholder={
                          departmentIsLoading
                            ? "Loading Department..."
                            : departmentIsError
                            ? "Failed to load Department"
                            : "Select Department"
                        }
                        style={getFieldStyles("department").input}
                        onFocus={() => setActiveField("department")}
                        onBlur={() => setActiveField(null)}
                        disableWhen={departmentIsLoading || departmentIsError}
                      />
                    </div>
                    <div className="relative w-full mt-4">
                      <label
                        htmlFor="id"
                        className="absolute bg-[#FAFAFA] z-10 text-[#6F7C8E] left-2 -top-2 text-xs roboto"
                      >
                        Transfer To
                      </label>
                      <CustomVDropdown
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            transfer_to_employee_id: e.target.value,
                          }))
                        }
                        value={formData.transfer_to_employee_id}
                        options={employeeOptions ?? []} // safe fallback
                        placeholder={
                          employeeIsLoading
                            ? "Loading emloyee..."
                            : employeeIsError
                            ? "Failed to load employee"
                            : "Select employee"
                        }
                        style={getFieldStyles("employee").input}
                        onFocus={() => setActiveField("employee")}
                        onBlur={() => setActiveField(null)}
                        disableWhen={
                          employeeIsLoading ||
                          employeeIsError ||
                          !selectedDepartment
                        }
                      />
                    </div>
                  </>
                )}

                <div className="w-full relative">
                  <label className="relative top-3 left-3 bg-white  font-normal text-[#6F7C8E] text-sm roboto mb-2">
                    Asset
                  </label>
                  <input
                    type="text"
                    value={data?.name || ""}
                    readOnly
                    placeholder="Select Asset"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-[#6F7C8E] text-sm roboto font-medium"
                  />
                </div>

                <div className="w-full relative ">
                  <label className="top-3 left-3 bg-white relative font-normal text-[#6F7C8E] roboto text-sm mb-2">
                    Reason/Comments
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-500 resize-none"
                    placeholder="Please provide details......."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex md:flex-row md:gap-5 mt-4 flex-col gap-2 mb-4">
            <Button
              onClick={handleSubmitForm}
              type="submit"
              className="rounded-full text-white  roboto font-semibold text-base md:text-xl cursor-pointer bg-[#000C63] hover:bg-[#8A5CFF]"
            >
              Submit Request
            </Button>
            <Button
              type="button"
              onClick={handleCancelForm}
              className="rounded-full  roboto font-semibold text-base md:text-xl cursor-pointer  border text-red-400 hover:bg-red-200  bg-red-100"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SubmitAssetsRequest;
