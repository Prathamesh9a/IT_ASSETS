import { useSelector, useDispatch } from "react-redux";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { closeBulkUpload } from "@/store/Slice/modalBulkImportEmployeeSlice";
import { useImportEmployeesMutation } from "@/store/api/employeeApi";
import { XIcon } from "./ui/XIcon";

const BulkUploadEmployee = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.modal.isBulkUploadOpen);

  const [excelFile, setExcelFile] = useState(null);
  const [dragActiveExcel, setDragActiveExcel] = useState(false);

  const [importEmployees, { isLoading }] = useImportEmployeesMutation();
  
  if (!isOpen) return null;

  // 🔹 handle drag events
  const handleBulkDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "excel") {
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActiveExcel(true);
      } else if (e.type === "dragleave") {
        setDragActiveExcel(false);
      }
    }
  };

  // 🔹 handle drop
  const handleBulkDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveExcel(false);
    if (type === "excel" && e.dataTransfer.files?.[0]) {
      setExcelFile(e.dataTransfer.files[0]);
    }
  };

  // 🔹 file select
  const handleBulkFileSelect = (e, type) => {
    if (type === "excel" && e.target.files?.[0]) {
      setExcelFile(e.target.files[0]);
    }
  };

  // 🔹 remove selected file
  const handleRemoveFile = () => {
    setExcelFile(null);
    document.getElementById("excel-input").value = "";
  };

  // 🔹 upload
  const handleUpload = async () => {
    if (!excelFile) {
      toast.error("Please select an Excel file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", excelFile);

      const res = await importEmployees(formData).unwrap();

      if (res?.errors?.length > 0) {
        toast.error("Some rows failed ❌");
        res.errors.forEach((err) => {
          toast.error(
            `Row ${err.row}: ${Object.entries(err.errors)
              .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
              .join(" | ")}`
          );
        });
      } else {
        toast.success("Assets imported successfully ✅");
      }
              setExcelFile(null);
    document.getElementById("excel-input").value = "";
      dispatch(closeBulkUpload());
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error?.data?.error || "Failed to upload assets ❌");
       setExcelFile(null);
    document.getElementById("excel-input").value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 p-2">
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-neutral-300 pb-2 mb-4">
          <h2 className="text-lg font-semibold">Bulk Upload</h2>
          <button
               disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={() => dispatch(closeBulkUpload())}
          >
            <XIcon/>
          </button>
        </div>

        {/* Body (Drag & Drop Excel Upload Box) */}
        <div
          className={`border-2 border-dashed rounded-xl flex flex-col p-8 w-full text-center transition-all duration-200 cursor-pointer ${
            dragActiveExcel
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
          }`}
          onDragEnter={(e) => handleBulkDrag(e, "excel")}
          onDragLeave={(e) => handleBulkDrag(e, "excel")}
          onDragOver={(e) => handleBulkDrag(e, "excel")}
          onDrop={(e) => handleBulkDrop(e, "excel")}
          onClick={() => document.getElementById("excel-input").click()}
        >
          <input
            id="excel-input"
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={(e) => handleBulkFileSelect(e, "excel")}
          />
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-bold text-gray-700 mb-1">
              Upload Excel
            </h3>
            <p className="text-sm text-gray-500">Only .xlsx or .xls files</p>
            <button
              type="button"
              className="mt-4 px-6 py-2 roboto font-semibold bg-[#794CFF] cursor-pointer hover:bg-[#6938E4] text-white text-sm rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById("excel-input").click();
              }}
            >
              Choose File
            </button>
          </div>
        </div>

        {/* File preview (if selected) */}
        {excelFile && (
          <div className="mt-4 flex items-center justify-between bg-gray-100 border rounded-lg p-3">
            <span className="text-sm text-gray-700 truncate max-w-[250px]">
              📄 {excelFile.name}
            </span>
            <button
            disabled={isLoading}
              onClick={handleRemoveFile}
              className="text-red-500 hover:text-red-700 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => dispatch(closeBulkUpload())}
            className="px-4 cursor-pointer py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadEmployee;












