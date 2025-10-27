import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import StatusButton from "@/components/StatusButoon";
import {
  useCreateAssetByFormMutation,
  useCreateAssetMutation,
  useDeleteAssetMutation,
  useGetAssetsQuery,
  useGetAssetTypeQuery,
  useImportAssetsMutation,
  useUpdateAssetMutation,
  useUploadAssetImageMutation,
} from "@/store/api/assetsApi";

import { toast } from "sonner";
import { CustomVDropdown } from "@/components/CustomVDropdown";
import { Skeleton } from "@/components/ui/skeleton";
import debounce from "lodash.debounce";
import { parse, format } from "date-fns";
import { useGetCategoriesQuery } from "@/store/api/settingsApi";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const statusOptions = [
  { value: "assigned", label: "Assigned" },
  { value: "available", label: "Available" },
  { value: "maintenance", label: "Maintenance" },
  { value: "expired", label: "Expired" },
  { value: "renew", label: "Renew" },
  { value: "damaged", label: "Damaged" },
];

const AddNewAsset = () => {
  const fileInputRefs = useRef({});
  const [bulkAssetStatus, SetbulkAssetStatus] = useState(false);
  const [createAsset, { data, isError, isLoading, error, isSuccess }] =
    useCreateAssetMutation();
  const { data: assetType, isLoading: isLoadingAssetType } =
    useGetAssetTypeQuery();
  // console.log("dtata", assetType);
  const {
    data: assetData,
    isLoading: assetIsLoading,
    error: assetError,
    isSuccess: assetIsSuccess,
  } = useGetAssetsQuery();
  const [
    deleteAsset,
    { data: deleteData, isError: deleteIsError, error: deleteiserro },
  ] = useDeleteAssetMutation();
  const [
    updateAsset,
    {
      data: updatedData,
      isError: updateisError,
      isLoading: updateIsLoading,
      error: updateIsError,
    },
  ] = useUpdateAssetMutation();
  const { data: categorieData } = useGetCategoriesQuery();
  const [
    uploadAssetImage,
    {
      data: uploadAssetImageData,
      isLoading: uploadAssetImageIsLoading,
      isError: uploadAssetImageIsError,
    },
  ] = useUploadAssetImageMutation();
  const [] = useState({});
  //  for bulk import  overlay
  const [searchParams] = useSearchParams();

  const [
    createAssetByForm,
    {
      isLoading: isLoadingByForm,
      isSuccess: isSuccessByForm,
      isError: isErrorByForm,
    },
  ] = useCreateAssetByFormMutation();

  useEffect(() => {
    if (searchParams.get("bulkAssetStatus") === "true") {
      SetbulkAssetStatus(true);
    }
  }, [searchParams]);
  const [
    importAssets,
    { isLoading: importAssetsIsLoading, isError: importAssetsIsEror },
  ] = useImportAssetsMutation();
  const [excelFile, setExcelFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [dragActiveExcel, setDragActiveExcel] = useState(false);
  const [dragActiveZip, setDragActiveZip] = useState(false);

  //  console.log(assetTypeFilter);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Debounced value
  const [type, setType] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState(null);

  // Debounced handler for search
  const debouncedHandler = useMemo(
    () =>
      debounce((value) => {
        setDebouncedSearch(value);
      }, 500),
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedHandler.cancel();
    };
  }, [debouncedHandler]);

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // ✅ runs only once on mount

  // Handle input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value); // updates instantly
    debouncedHandler(e.target.value); // updates debounced
  };
  // Filtering
  const normalize = (str) =>
    str
      ?.toString()
      .toLowerCase()
      .replace(/[\s\-_:/]/g, ""); // remove spaces, dashes, underscores, colons, slashes

  const formatDateVariants = (dateStr) => {
    if (!dateStr) return [];
    try {
      const parsed = parse(dateStr, "yyyy-MM-dd", new Date());
      return [
        format(parsed, "yyyy-MM-dd"),
        format(parsed, "dd/MM/yyyy"),
        format(parsed, "MM/dd/yyyy"),
      ].map(normalize);
    } catch {
      return [normalize(dateStr)];
    }
  };

  const filteredAssets = assetData
    ?.filter((asset) => {
      const searchNorm = normalize(debouncedSearch);

      const fieldsToCheck = [
        normalize(asset.name),
        normalize(asset.model_number),
        normalize(asset.serial_no),
        normalize(asset.type),
        ...formatDateVariants(asset.purchase_date),
      ];

      const matchesSearch =
        searchNorm === "" ||
        fieldsToCheck.some((field) => field && field.includes(searchNorm));

      const matchesType =
        !type || asset.type.toLowerCase() === type.toLowerCase();

      return matchesSearch && matchesType;
    })
    // 🔥 yaha sort add kar diya (latest created_at first)
    ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // form data
  const [formData, setFormData] = useState({
    asset_type: "",
    product_name: "",
    model_no: "",
    serial_no: "",
    purchase_date: "",
    purchase_cost: "",
    warranty_expiry: "",
    configuration: "",
    images: [],
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeField, setActiveField] = useState("");
  // Format input while typing (DD/MM/YYYY)
  const formatDateInput = (value) => {
    const numbers = value.replace(/\D/g, ""); // Only digits

    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(
        4,
        8
      )}`;
    }
  };

  // Validate DD/MM/YYYY input
  const isValidDate = (dateString) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(regex);

    if (!match) return false;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2100) return false;

    // Days in each month
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Leap year check for February
    if (
      month === 2 &&
      ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)
    ) {
      daysInMonth[1] = 29;
    }

    return day <= daysInMonth[month - 1];
  };

  // Convert DD/MM/YYYY -> YYYY-MM-DD (for API)
  // const convertToApiDate = (dateString) => {
  //   const [day, month, year] = dateString.split("/");
  //   return `${year}-${month}-${day}`;
  // };

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("video/")
      );
      setUploadedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      // Log files to debug
      // console.log("Selected files:", files);
      // files.forEach(file => {
      //   console.log(`File: ${file.name}, Type: ${file.type}, Size: ${file.size}`);
      // });

      // More flexible validation
      const validFiles = files.filter((file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit

        if (!isImage && !isVideo) {
          console.warn(`Invalid file type: ${file.type}`);
          toast.error(`Invalid file type: ${file.type}`);
        }
        if (!isValidSize) {
          console.warn(`File too large: ${file.size} bytes`);
          toast.error(`File too large: ${file.size} bytes`);
        }

        return (isImage || isVideo) && isValidSize;
      });

      setUploadedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // submit handler
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    // Map local formData keys to Swagger keys
    const payload = {
      asset_type: formData.asset_type,
      product_name: formData.product_name,
      model_no: formData.model_no,
      serial_no: formData.serial_no,
      purchase_date: formData.purchase_date,
      purchase_cost: formData.purchase_cost,
      warranty_expiry: formData.warranty_expiry || null,
      configuration: formData.configuration,
      images: formData.images,
    };

    // Append images if they exist
    const formDataToSend = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        formDataToSend.append(key, value);
      }
    });

    // Append images
    if (uploadedFiles && uploadedFiles.length > 0) {
      uploadedFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });
    }

    try {
      let response;
      if (isEditing && editingAssetId) {
        response = await updateAsset({
          id: editingAssetId,
          data: formDataToSend,
        }).unwrap();
        toast.success("Asset updated successfully!");
      } else {
        // Use createAssetByForm for POST
        response = await createAssetByForm(payload).unwrap();
        toast.success("Asset added successfully!");
      }
      handleCancelForm();
      setIsEditing(false);
      setEditingAssetId(null);
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Failed to submit asset");
    }

    console.log("formdayta", formData);
    // navigate("/adminDashboard");
    // navigate(0);
  };

  // handel cancle form value
  const handleCancelForm = () => {
    setFormData({
      type: "",
      // asset: "",
      name: "",
      model_number: "",
      // assetDescription: "",
      // assetCategory: "",
      serial_no: "",
      purchase_date: "",
      license_key: "",
      license_expiry: "",
      warranty_expiry: "",
      assigned_to: "",
      // cost: "",
      status: "",
      version: "",
      // reason: "",
    });
    setUploadedFiles([]);
    if (isEditing) {
      setIsEditing(false);
      setEditingAssetId(null);
    }
  };

  // Helper styling function
  const getFieldStyles = (field) => ({
    label: {
      color: activeField === field ? "#2066FF" : "#6F7C8E",
      fontWeight: "normal",
    },
    input: {
      borderColor: activeField === field ? "#2066FF" : "#E1E1E1",
    },
  });

  // Render field based on type
  const renderField = ({ key, label, type, placeholder, options }) => {
    switch (type) {
      case "dropdown":
        return (
          <CustomVDropdown
            value={formData[key]}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, [key]: e.target.value }))
            }
            onFocus={() => setActiveField(key)}
            onBlur={() => setActiveField("")}
            options={options}
            placeholder={placeholder}
            style={getFieldStyles(key).input}
          />
        );
      case "status":
        return (
          <CustomVDropdown
            value={formData[key]}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, [key]: e.target.value }))
            }
            onFocus={() => setActiveField(key)}
            onBlur={() => setActiveField("")}
            options={options}
            placeholder={placeholder}
            style={getFieldStyles(key).input}
          />
        );
      case "date-text":
        return (
          <div className="relative">
            <input
              type="text"
              value={formData[key]}
              onChange={(e) => {
                const formattedValue = formatDateInput(e.target.value);
                setFormData((prev) => ({ ...prev, [key]: formattedValue }));
              }}
              onFocus={() => setActiveField(key)}
              onBlur={() => setActiveField("")}
              placeholder={placeholder}
              maxLength="10"
              className="w-full px-4 py-3 border-2 rounded-lg bg-white roboto  text-[#6F7C8E] font-medium focus:outline-none pr-12"
              style={getFieldStyles(key).input}
            />
            {/* Calendar Icon */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        );

      case "date":
        return (
          <div className="relative">
            <input
              type="date"
              value={formData[key]}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, [key]: e.target.value }))
              }
              onFocus={() => setActiveField(key)}
              onBlur={() => setActiveField("")}
              className="w-full px-4 py-3 border-2 rounded-lg bg-white text-[#6F7C8E] font-medium focus:outline-none appearance-none cursor-pointer pr-12"
              style={getFieldStyles(key).input}
            />
            {/* Calendar Icon */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        );

      case "model_number":
        return (
          <div className="relative">
            <input
              type="text"
              value={formData[key]}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, [key]: e.target.value }))
              }
              onFocus={() => setActiveField(key)}
              onBlur={() => setActiveField("")}
              placeholder={placeholder}
              className="w-full px-4 py-3 border-2 rounded-lg bg-white text-[#6F7C8E] font-medium focus:outline-none pr-12"
              style={getFieldStyles(key).input}
            />
          </div>
        );

      case "auto":
        return (
          <input
            type="text"
            value={formData[key]}
            readOnly
            placeholder={placeholder}
            className="w-full px-4 py-3 border-2 rounded-lg bg-gray-100 text-[#6F7C8E] font-medium roboto placeholder-[#6F7C8E] cursor-not-allowed"
            style={{ borderColor: "#E1E1E1" }}
          />
        );

      case "textarea":
        return (
          <textarea
            value={formData[key]}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, [key]: e.target.value }))
            }
            onFocus={() => setActiveField(key)}
            onBlur={() => setActiveField("")}
            rows={key === "reason" ? "4" : "2"}
            className="w-full px-4 py-3 border-2 rounded-lg text-gray-500 resize-none focus:outline-none"
            placeholder={placeholder}
            style={getFieldStyles(key).input}
          />
        );

      default:
      case "input":
        return (
          <input
            type="text"
            value={formData[key]}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, [key]: e.target.value }))
            }
            onFocus={() => setActiveField(key)}
            onBlur={() => setActiveField("")}
            placeholder={placeholder}
            className="w-full px-4 py-3 border-2 rounded-lg bg-white text-[#6F7C8E] font-medium placeholder-[#6F7C8E] focus:outline-none roboto placeholder:text-[15px]"
            style={getFieldStyles(key).input}
          />
        );
    }
  };
  // delete asset handler
  const deleteAssetHandler = async (assetId) => {
    try {
      const response = await deleteAsset(assetId);

      if ("error" in response) {
        // API returned an error object
        // console.error("Delete failed:", response.error);
        toast.error("Failed to retire asset. Please try again.");
      } else {
        // Success
        toast.success("Asset retired successfully!");
        // console.log("Deleted asset:", response.data);
      }
    } catch (err) {
      // Only triggers for network or unexpected errors
      // console.error("Unexpected error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // handel update asset
  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-"); // assuming backend sends "YYYY/MM/DD"
    return `${day}/${month}/${year}`;
  };

  const handelEditClick = (asset) => {
    window.scrollTo(0, 0);
    setIsEditing(true);
    setEditingAssetId(asset.id);

    setFormData({
      type: asset.type || "",
      name: asset.name || "",
      model_number: asset.model_number || "",
      serial_no: asset.serial_no || "",
      purchase_date: formatDateToDDMMYYYY(asset.purchase_date),
      license_key: asset.license_key || "",
      license_expiry: formatDateToDDMMYYYY(asset.license_expiry),
      warranty_expiry: formatDateToDDMMYYYY(asset.warranty_expiry),
      assigned_to: asset.assigned_to || null,
      status: asset.status || "",
      version: asset.version || "",
    });
  };

  // for put request (upload/append image after asset creation  if user want to add image after asset creation)
  const handleUpload = async (assetId, file) => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("images", file);
      await uploadAssetImage({ id: assetId, data: formData }).unwrap();
      toast.success("Image uploaded successfully!");
      if (fileInputRefs.current[assetId]) {
        fileInputRefs.current[assetId].value = "";
      }
    } catch (error) {
      toast.error("Failed to upload image. Please try again.");
    }
  };
  //  bulk create asset handler
  // 🔹 Generic file handler
  const handleBulkFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === "excel") setExcelFile(file);
    if (type === "zip") setZipFile(file);
  };

  // 🔹 Drag handler
  const handleBulkDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      type === "excel" ? setDragActiveExcel(true) : setDragActiveZip(true);
    } else if (e.type === "dragleave") {
      type === "excel" ? setDragActiveExcel(false) : setDragActiveZip(false);
    }
  };

  // 🔹 Drop handler
  const handleBulkDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "excel") setDragActiveExcel(false);
    else setDragActiveZip(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      if (type === "excel") setExcelFile(file);
      if (type === "zip") setZipFile(file);
    }
  };

  const removeBulkFile = (type) => {
    if (type === "excel") {
      setExcelFile(null);
      const input = document.getElementById("excel-input");
      if (input) input.value = ""; // reset input value
    }
    if (type === "zip") {
      setZipFile(null);
      const input = document.getElementById("zip-input");
      if (input) input.value = ""; // reset input value
    }
  };

  // 🔹 Upload handler

  const handleBulkUpload = async () => {
    if (!excelFile || !zipFile) {
      toast.error("Please select both Excel and Zip file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", excelFile);
      formData.append("images_zip", zipFile);

      const res = await importAssets(formData).unwrap();

      // 🔹 Case: backend returns row-level errors
      if (res?.errors && res.errors.length > 0) {
        toast.error("Some rows failed to upload ❌");
        res.errors.forEach((err) => {
          const row = err.row;
          const fields = Object.entries(err.errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("; ");
          toast.error(`Row ${row} - ${fields}`);
        });
      }

      // 🔹 Case: at least some created successfully
      if (res?.created && res.created.length > 0) {
        toast.success(`${res.created.length} assets uploaded successfully ✅`);
      }

      // 🔹 If no errors and no created → assume fail
      if (
        (!res?.created || res.created.length === 0) &&
        (!res?.errors || res.errors.length === 0)
      ) {
        toast.error("Upload failed ❌");
      }

      // ✅ Close modal + redirect if at least something created
      if (res?.created && res.created.length > 0) {
        SetbulkAssetStatus(false);
        navigate("/addAssets", { replace: true });
      }
    } catch (error) {
      console.error("Upload exception:", error);
      toast.error(error?.data?.message || "Failed to upload assets ❌");
    }
  };

  return (
    <>
      <Header great={"Add/Edit Assets"} showNotification={true} />
      {/* bulk import assets */}
      {bulkAssetStatus && (
        <div className="fixed z-[3000] flex justify-center items-center inset-0 bg-black/70 h-screen w-full px-2 ">
          <div className="relative pt-16 md:pt-4 space-y-6 bg-white p-2 w-3xl rounded-xl flex justify-center flex-col items-center">
            <div
              className="absolute top-2 border border-gray-600 p-1 rounded-full right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={() => {
                SetbulkAssetStatus(false);
                navigate("/addAssets", { replace: true });
              }}
            >
              <X />
            </div>
            <div className="flex gap-4 md:flex-row flex-col  justify-center items-center">
              <div className="flex flex-col gap-2 items-center">
                {/* 🔹 Excel Upload */}
                <div
                  className={`border-2 border-dashed rounded-xl flex flex-col p-8 w-2xs text-center transition-all duration-200 cursor-pointer ${
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
                    <p className="text-sm text-gray-500">
                      Only .xlsx or .xls files
                    </p>
                    <button
                      type="button"
                      className="mt-4 px-6 py-2 roboto font-semibold cursor-pointer hover:bg-[#6938E4] border border-[#000C63] hover:text-white  text-[#000C63] text-sm rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById("excel-input").click();
                      }}
                    >
                      Choose File
                    </button>
                  </div>
                </div>
                {excelFile && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700 truncate">
                      {excelFile.name}
                    </span>
                    <button
                      onClick={() => removeBulkFile("excel")}
                      className="text-red-500 cursor-pointer hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              {/* 🔹 Zip Upload */}

              <div className="flex flex-col gap-2 items-center">
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center w-2xs transition-all duration-200 cursor-pointer ${
                    dragActiveZip
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                  onDragEnter={(e) => handleBulkDrag(e, "zip")}
                  onDragLeave={(e) => handleBulkDrag(e, "zip")}
                  onDragOver={(e) => handleBulkDrag(e, "zip")}
                  onDrop={(e) => handleBulkDrop(e, "zip")}
                  onClick={() => document.getElementById("zip-input").click()}
                >
                  <input
                    id="zip-input"
                    type="file"
                    className="hidden"
                    accept=".zip"
                    onChange={(e) => handleBulkFileSelect(e, "zip")}
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
                      Upload Images Zip
                    </h3>
                    <p className="text-sm text-gray-500">Only .zip files</p>
                    <button
                      type="button"
                      className="mt-4 px-6 py-2 roboto font-semibold hover:bg-[#6938E4] border border-[#000C63] hover:text-white text-[#000C63] text-sm rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById("zip-input").click();
                      }}
                    >
                      Choose File
                    </button>
                  </div>
                </div>
                {zipFile && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700 truncate">
                      {zipFile.name}
                    </span>
                    <button
                      onClick={() => removeBulkFile("zip")}
                      className="text-red-500 cursor-pointer hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 🔹 Upload Button */}
            <button
              onClick={handleBulkUpload}
              className="w-[160px] cursor-pointer flex-1  px-6 py-3 bg-[#794CFF] hover:bg-[#6938E4] text-white font-semibold rounded-full transition"
            >
              Upload
            </button>
          </div>
        </div>
      )}

      <div className="px-6 mt-20">
        <h1 className="mt-6 md:mt-6 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
          {isEditing ? "Update" : "Add New"} Asset
        </h1>
        <form onSubmit={handleSubmitForm} className="mt-6">
          <div className="max-w-6xl mx-auto p-4">
            <div className="flex md:flex-row flex-col w-full gap-6 justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2  gap-6 w-full">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Asset Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asset Type
                    </label>

                    <select
                      value={formData.asset_type}
                      onChange={(e) =>
                        setFormData({ ...formData, asset_type: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Asset Types</option>
                      {!isLoadingAssetType &&
                        assetType?.map((assetTypes) => (
                          <option key={assetTypes.id} value={assetTypes.name}>
                            {assetTypes.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Purchase Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchase_date: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost
                    </label>

                    <input
                      type="number"
                      value={formData.purchase_cost}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchase_cost: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Middle Column */}
                <div className="space-y-6">
                  {/* Serial Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Serial Number"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Asset Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asset Name
                    </label>
                    <input
                      type="text"
                      value={formData.product_name}
                      placeholder="Auto-generated"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_name: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Description/Notes (Spanning Two Columns) */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description/Notes
                  </label>

                  <textarea
                    value={formData.configuration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        configuration: e.target.value,
                      })
                    }
                    placeholder="Additional details..."
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex w-full md:w-[55%] flex-col space-y-6">
                {/* Right Column */}
                <div className="space-y-6 w-full sm:gap-6 md:gap-0 flex md:flex-col sm:flex-row flex-col">
                  {/* Model Number*/}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model Number
                    </label>

                    <input
                      type="text"
                      value={formData.model_no}
                      onChange={(e) =>
                        setFormData({ ...formData, model_no: e.target.value })
                      }
                      placeholder="Enter Model Number"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Warranty Until */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warranty Until
                    </label>
                    <input
                      required
                      type="date"
                      value={formData.warranty_expiry}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          warranty_expiry: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {/* Upload Area (Spanning One Column) */}
                <div className="md:col-span-1 ">
                  <div className="border-2 border-dashed border-gray-400 bg-gray-50 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                    <input
                      id="file-input"
                      type="file"
                      multiple
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        const pickedFiles = Array.from(e.target.files);
                        setFormData({
                          ...formData,
                          images: pickedFiles,
                        });
                        toast.success("Image uploaded successfully!");
                      }}
                    />
                    <div className="flex flex-col items-center">
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

                      <h3 className="text-lg font-bold text-gray-700 mb-1">
                        Click To Upload
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Asset image and video
                      </p>
                      <button
                        type="button"
                        className="px-6 py-2 text-sm font-semibold hover:bg-[#6938E4] border border-[#000C63] hover:text-white  text-[#000C63] rounded-full  transition-colors"
                        onClick={() =>
                          document.getElementById("file-input").click()
                        }
                      >
                        Choose File
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Buttons */}
            <div className="flex flex-row justify-center md:gap-5 mt-4 gap-2 items-start pb-4 border-b-[2px] border-b-[#E1E1E1]">
              <Button
                type="submit"
                disabled={isLoading || updateIsLoading}
                className="rounded-full !w-auto !shrink-0 text-white bg-[#000C63] roboto font-semibold text-base md:text-xl cursor-pointer  hover:bg-[#4626B8]"
              >
                {(isEditing ? updateIsLoading : isLoading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating Asset..." : "Adding Asset..."}
                  </>
                ) : isEditing ? (
                  "Update Asset"
                ) : (
                  "Add Asset"
                )}
              </Button>
              <Button
                type="button"
                onClick={handleCancelForm}
                className="rounded-full !w-auto !shrink-0 roboto font-semibold text-base md:text-xl cursor-pointer text-red-400 hover:bg-red-200  bg-red-100"
              >
                Clear Form
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddNewAsset;
