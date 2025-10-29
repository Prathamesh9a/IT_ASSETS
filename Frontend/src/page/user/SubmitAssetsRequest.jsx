import { CustomVDropdown } from "@/components/CustomVDropdown";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  useGetmyAssetsQuery,
  useRequestActionMutation,
} from "@/store/api/assetsApi";
import { useGetEmployeesQuery } from "@/store/api/employeeApi";
import { useGetDepartmentsQuery } from "@/store/api/settingsApi";
import { Upload, X, ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SubmitAssetsRequest = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const { data: employeeData, isLoading: empLoading, isError: empError } = useGetEmployeesQuery();
  const { data: deptData, isLoading: deptLoading, isError: deptError } = useGetDepartmentsQuery();

  const [requestAction] = useRequestActionMutation();

  const action = searchParams.get("action");
  const id = searchParams.get("id");
  const { data: myAssets, isLoading: assetsLoading, isError: assetsError } = useGetmyAssetsQuery();

  const [formData, setFormData] = useState({
    status_requested: action || "",
    asset_id: id || "",
    reason: "",
    transfer_to_employee_id: "",
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // --------------------------------------------------------------------- //
  //  Options
  // --------------------------------------------------------------------- //
  const requestTypeOptions =
    action === "assetsRequest"
      ? [
          { label: "Surrender", value: "surrender_requested" },
          { label: "Maintenance", value: "maintenance_requested" },
        ]
      : action === "reportIssue"
      ? [
          { label: "Damaged", value: "damaged_requested" },
          { label: "Expired", value: "expired_requested" },
        ]
      : [];

  const assetOptions =
    myAssets?.map((a) => ({ label: a.product_name, value: a.id })) ?? [];

  const departmentOptions = (deptData?.departments ?? []).map((d) => ({
    label: d,
    value: d.toLowerCase(),
  }));

  const employeeOptions =
    employeeData
      ?.filter((e) => e?.active)
      ?.filter((e) => {
        if (!selectedDepartment) return true;
        return e?.department?.toLowerCase() === selectedDepartment?.toLowerCase();
      })
      .map((e) => ({
        value: e.id,
        label: `${e.user.first_name} ${e.user.last_name}`,
      })) ?? [];

  // --------------------------------------------------------------------- //
  //  Drag & Drop
  // --------------------------------------------------------------------- //
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
      );
      setUploadedFiles((p) => [...p, ...files]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) {
      const files = Array.from(e.target.files).filter(
        (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
      );
      setUploadedFiles((p) => [...p, ...files]);
    }
  };

  const removeFile = (i) => setUploadedFiles((p) => p.filter((_, idx) => idx !== i));

  // --------------------------------------------------------------------- //
  //  Submit / Cancel
  // --------------------------------------------------------------------- //
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.asset_id || !formData.status_requested) {
      toast.error("Please select an asset and request type.");
      return;
    }
    try {
      const payload = {
        asset_id: formData.asset_id,
        status_requested: formData.status_requested,
        reason: formData.reason,
        ...(formData.transfer_to_employee_id && {
          transfer_to_employee_id: formData.transfer_to_employee_id,
        }),
      };
      const res = await requestAction(payload).unwrap();
      toast.success(res?.detail ?? "Request submitted");
      setFormData({ status_requested: "", asset_id: "", reason: "", transfer_to_employee_id: "" });
      navigate("/userdashboard");
    } catch (err) {
      const msg =
        err?.data?.detail ||
        err?.error ||
        err?.data?.reason ||
        "Something went wrong!";
      toast.error(msg);
    }
  };

  const handleCancel = () => navigate("/userdashboard");

  return (
    <>
      <Header great="Add/Edit Assets" showNotification={true} />
      <div className="px-6 mt-24">
        {/* ---------- HEADING + BACK BUTTON ---------- */}
        <div className="flex items-center gap-3 mt-6 md:mt-14">
          <button
            onClick={() => navigate("/userdashboard")}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-[#1F2937]" />
          </button>
          <h1 className="font-bold text-2xl text-[#1F2937]">
            {action === "assetsRequest" ? "Submit Asset Request" : "Report Issue"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* ---------- Top Row (Request Type + Asset) ---------- */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Request Type */}
              <div>
                <label className="block text-sm font-medium text-[#6F7C8E] mb-1">
                  Request Type
                </label>
                <CustomVDropdown
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      status_requested: e.target.value,
                    }))
                  }
                  value={formData.status_requested}
                  options={requestTypeOptions}
                  placeholder="Select Request Type"
                  className="w-full h-12 rounded-lg border border-[#E5E7EB] focus:border-[#2066FF] focus:outline-none"
                />
              </div>

              {/* Asset */}
              <div>
                <label className="block text-sm font-medium text-[#6F7C8E] mb-1">
                  Asset
                </label>
                <CustomVDropdown
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, asset_id: e.target.value }))
                  }
                  value={formData.asset_id}
                  options={assetOptions}
                  placeholder={
                    assetsLoading
                      ? "Loading Assets..."
                      : assetsError
                      ? "Failed to load Assets"
                      : "Select Asset"
                  }
                  className="w-full h-12 rounded-lg border border-[#E5E7EB] focus:border-[#2066FF] focus:outline-none"
                  disableWhen={assetsLoading || assetsError}
                />
              </div>
            </div>

            {/* ---------- Upload + Reason ---------- */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Upload */}
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-[#2066FF] bg-[#F0F5FF]"
                    : "border-[#E5E7EB] bg-white hover:border-[#2066FF] hover:bg-[#F0F5FF]"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <div className="flex items-center justify-center gap-4">
                  <Upload className="w-8 h-8 text-[#2066FF]" />
                  <div className="text-left">
                    <p className="font-semibold text-[#1F2937]">Click To Upload</p>
                    <p className="text-sm text-[#6B7280]">Asset image and video</p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-1.5 bg-[#2066FF] text-white rounded-full text-sm font-medium hover:bg-[#1D4ED8]"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById("file-input")?.click();
                    }}
                  >
                    Choose File
                  </button>
                </div>

                {/* Uploaded files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-[#F9FAFB] rounded-lg"
                      >
                        <span className="text-sm text-[#6B7280] truncate max-w-[180px]">
                          {f.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-[#EF4444] hover:text-[#DC2626]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reason / Comments */}
              <div>
                <label className="block text-sm font-medium text-[#6F7C8E] mb-1">
                  Reason/Comments
                </label>
                <textarea
                  rows={4}
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, reason: e.target.value }))
                  }
                  placeholder="Please provide details...."
                  className="w-full rounded-lg border border-[#E5E7EB] p-3 resize-none focus:border-[#2066FF] focus:outline-none"
                />
              </div>
            </div>

            {/* ---------- Transfer fields (only when needed) ---------- */}
            {formData.status_requested?.toLowerCase() === "transfer_requested" && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-[#6F7C8E] mb-1">
                    Department
                  </label>
                  <CustomVDropdown
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    value={selectedDepartment}
                    options={departmentOptions}
                    placeholder={
                      deptLoading
                        ? "Loading Department..."
                        : deptError
                        ? "Failed to load Department"
                        : "Select Department"
                    }
                    className="w-full h-12 rounded-lg border border-[#E5E7EB] focus:border-[#2066FF] focus:outline-none"
                    disableWhen={deptLoading || deptError}
                  />
                </div>

                {/* Transfer To */}
                <div>
                  <label className="block text-sm font-medium text-[#6F7C8E] mb-1">
                    Transfer To
                  </label>
                  <CustomVDropdown
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        transfer_to_employee_id: e.target.value,
                      }))
                    }
                    value={formData.transfer_to_employee_id ?? ""}
                    options={employeeOptions}
                    placeholder={
                      empLoading
                        ? "Loading employee..."
                        : empError
                        ? "Failed to load employee"
                        : !selectedDepartment
                        ? "Select department first"
                        : "Select employee"
                    }
                    className="w-full h-12 rounded-lg border border-[#E5E7EB] focus:border-[#2066FF] focus:outline-none"
                    disableWhen={empLoading || empError || !selectedDepartment}
                  />
                </div>
              </div>
            )}

            {/* ---------- Buttons ---------- */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                type="submit"
                className="order-2 sm:order-1 w-full sm:w-auto px-8 py-3 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white rounded-full font-semibold text-base"
              >
                Submit Request
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                className="order-1 sm:order-2 w-full sm:w-auto px-8 py-3 bg-[#FEE2E2] hover:bg-[#FECACA] text-[#EF4444] rounded-full font-semibold text-base"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default SubmitAssetsRequest;