import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import debounce from "lodash.debounce";
import {
  useAddEmployeeMutation,
  useAssignRoleEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetEmployeesQuery,
  useUpdateEmployeeActiveStatusMutation,
  useUpdateEmployeeMutation,
} from "@/store/api/employeeApi";
import { useGetRolesQuery } from "@/store/api/userApi";
import { CustomVDropdown } from "@/components/CustomVDropdown";
import { useDispatch } from "react-redux";
import { openBulkUpload } from "@/store/Slice/modalBulkImportEmployeeSlice";
import BulkUploadEmployee from "@/components/BulkUploadEmployee";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddEmployee = () => {
  const dispatch = useDispatch();
  const [addEmployee, { data, isError, isLoading, error, isSuccess }] =
    useAddEmployeeMutation();
  const {
    data: employeeData,
    isLoading: employeeIsLoading,
    error: employeeerror,
    isSuccess: employeeIsSuccess,
  } = useGetEmployeesQuery();
  const [
    deleteEmployee,
    { data: deleteData, isError: deleteIsError, error: deleteiserro },
  ] = useDeleteEmployeeMutation();
  const [updateEmployeeActiveStatus] = useUpdateEmployeeActiveStatusMutation();
  const {
    data: roleData,
    isLoading: roleIsLoading,
    isError: roleIsError,
  } = useGetRolesQuery();
  const [
    assignRoleEmployee,
    {
      data: assignRoleEmployeeData,
      isLoading: assignRoleEmployeeIsLoading,
      isError: assignRoleEmployeeIsError,
    },
  ] = useAssignRoleEmployeeMutation();
  const [
    updateEmployee,
    { data: updateEmployeeData, isLoading: updateIsLoading },
  ] = useUpdateEmployeeMutation();

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Debounced value
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [isRoleOverlay, setIsRoleOverlay] = useState(false);
  const [isEditOverlay, setIsEditOverlay] = useState(false);
  const [roleAssignData, setRoleAssignData] = useState({
    user_id: "",
    role: "",
  });

  const [editData, setEditData] = useState({
    department: "",
    position: "",
  });

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

  const filteredEmployees = useMemo(() => {
    const searchNorm = normalize(debouncedSearch);
    return employeeData
      ?.filter((emp) => {
        const fieldsToCheck = [
          normalize(emp?.user?.username),
          normalize(emp?.employee_id),
          normalize(emp?.department),
          normalize(emp?.position),
        ];
        return (
          searchNorm === "" ||
          fieldsToCheck.some((field) => field && field.includes(searchNorm))
        );
      })
      .sort(
        (a, b) => new Date(b.date_of_joining) - new Date(a.date_of_joining)
      ); // Sort by date_joined descending
  }, [employeeData, debouncedSearch]);

  // form data
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    employee_id: "",
    department: "",
    position: "",
  });

  // submit handler
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    // Required fields check
    const requiredFields = [
      "email",
      "last_name",
      "first_name",
      "username",
      "position",
      "department",
      "employee_id",
      "password",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      toast(
        `Please fill in the following required fields: ${missingFields.join(
          ", "
        )}`
      );
      return;
    }

    // Convert dates to API format
    const payload = {
      ...formData,
    };

    // Convert payload to FormData
    const formDataToSend = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        formDataToSend.append(key, value);
      }
    });

    // Append multiple images if present
    // Add images with better logging
    //   if (uploadedFiles && uploadedFiles.length > 0) {
    //     uploadedFiles.forEach((file, index) => {

    //       formDataToSend.append("images", file);
    //     });
    //   } else {
    //   }

    try {
      let response;
      // Call create mutation
      response = await addEmployee(formDataToSend).unwrap();
      toast.success("Asset added successfully!", { position: "top-right" });
      handleCancelForm(); // reset form
    } catch (error) {
      console.error("❌ API Error:", error);

      if (error && error.data) {
        const errors = error.data;
        Object.entries(errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) =>
              toast.error(`${field}: ${msg}`, { position: "top-right" })
            );
          } else {
            toast.error(`${field}: ${messages}`, { position: "top-right" });
          }
        });
      } else {
        toast.error("Failed to submit asset", { position: "top-right" });
      }
    } finally {
    }
  };

  // handel cancle form value
  const handleCancelForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      employee_id: "",
      department: "",
      position: "",
    });
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
  const fieldList = [
    {
      key: "first_name",
      label: "First Name",
      type: "input",
      placeholder: "Enter First Name",
    },
    {
      key: "last_name",
      label: "Last Name",
      type: "input",
      placeholder: "Enter Last Name",
    },
    {
      key: "username",
      label: "Username",
      type: "input",
      placeholder: "Enter UserName",
    },
    {
      key: "password",
      label: "password",
      type: "password",
      placeholder: "Enter Password",
    },
    {
      key: "department",
      label: "Department",
      type: "input",
      placeholder: "Enter Department",
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter Email",
    },
    {
      key: "employee_id",
      label: "Employee Id",
      type: "text",
      placeholder: "Enter Employee Id",
    },
    {
      key: "position",
      label: "Position",
      type: "text",
      placeholder: "Enter Position",
    },
  ];
  const handleChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Render field based on type
  const renderField = ({ key, label, type, placeholder, options }) => {
    switch (type) {
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
      case "password":
        return (
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              value={formData[key] || ""}
              onChange={(e) => handleChange(key, e.target.value)}
              onFocus={() => setActiveField(key)}
              onBlur={() => setActiveField("")}
              placeholder={placeholder}
              className="w-full px-4 py-3 border-2 rounded-lg bg-white text-[#6F7C8E] font-medium placeholder-[#6F7C8E] focus:outline-none roboto placeholder:text-[15px]"
              style={getFieldStyles(key).input}
            />
            {/* 👇 Toggle eye button */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        );

      default:
      case "input":
        return (
          <input
            type={`${type}`}
            value={formData[key]}
            onChange={(e) => handleChange(key, e.target.value)}
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
  const deleteEmployeeHandler = async (employeeId) => {
    try {
      const response = await deleteEmployee(employeeId);
      if ("error" in response) {
        toast.error("Failed to Deactivate Employee. Please try again.");
      } else {
        toast.success("Employee Deactivated successfully!");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const activateEmployeeHandler = async (employeeId) => {
    try {
      const response = await updateEmployeeActiveStatus({
        employeeId,
        data: { is_active: true },
      }).unwrap(); // <-- yaha aapko Activate API call karni hogi
      if ("error" in response) {
        toast.error("Failed to Activate Employee. Please try again.");
      } else {
        toast.success("Employee Activated successfully!");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };
  const assignrolehandler = (id) => {
    setRoleAssignData((prev) => ({
      ...prev, // keep old values
      user_id: id, // update user_id
    }));
    setIsRoleOverlay(!isRoleOverlay);
  };
  // handel update asset
  const assignRole = async () => {
    try {
      const response = await assignRoleEmployee(roleAssignData).unwrap();
      toast.success("Role assigned successfully!", { position: "top-right" });
      console.log("✅ API response:", response);

      // optional: reset or close overlay
      setIsRoleOverlay(false);
    } catch (error) {
      console.error("❌ API error:", error);
      toast.error("Failed to assign role. Please try again.", {
        position: "top-right",
      });
    }
  };

  const handelEditClick = (assetId) => {
    setIsEditOverlay(true);
    setEditingAssetId(assetId);
  };
  const updateUser = async () => {
    if (!editingAssetId) {
      toast.error("❌ No employee ID found to update");
      return;
    }

    try {
      const res = await updateEmployee({
        id: editingAssetId,
        data: editData, // send updated values
      }).unwrap();

      toast.success("Employee updated successfully!");
      // console.log("Employee updated successfully:", res);

      // Optionally reset form/close modal
      setEditData({ department: "", position: "" });
      setIsEditOverlay(false);
      setEditingAssetId(null);
    } catch (err) {
      toast.error("Failed to update employee");
      // console.error("Failed to update employee:", err);
    }
  };
  return (
    <>
      <Header great={"Add/Edit Employee"} showNotification={true} />
      <BulkUploadEmployee />
      {isRoleOverlay && (
        <div className="fixed z-[3000] flex justify-center items-center inset-0 bg-black/70 h-screen w-full px-2">
          <div className="bg-white relative rounded-[20px] p-12 flex flex-col justify-center w-full sm:w-96">
            <div
              className="absolute top-2 border border-gray-600 p-1 rounded-full right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={() => {
                setIsRoleOverlay(false);
              }}
            >
              <X />
            </div>
            {/* <div className="relative w-full">
                                    <label htmlFor="id" className="absolute bg-[#FAFAFA] text-[#6F7C8E] left-2 -top-2 text-xs roboto">UserId</label>
                                                <input
                                                type="text"
                                                value={roleAssignData.user_id}
                                                readOnly
                                                
                                                className="w-full px-4 py-3 border-2 rounded-lg bg-[#FAFAFA] text-[#6F7C8E] font-medium roboto placeholder-[#6F7C8E] cursor-not-allowed  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 "
                                                style={{ borderColor: "#E1E1E1" }}
                                                 />
                                  </div> */}
            <div className="relative w-full mt-4">
              <label
                htmlFor="id"
                className="absolute bg-[#FAFAFA] z-10 text-[#6F7C8E] left-2 -top-2 text-xs roboto"
              >
                Roles
              </label>
              <CustomVDropdown
                onChange={(e) =>
                  setRoleAssignData((prev) => ({
                    ...prev,
                    role: e.target.value, // update role
                  }))
                }
                value={roleAssignData.role}
                options={roleData ?? []} // safe fallback
                placeholder={
                  roleIsLoading
                    ? "Loading roles..."
                    : roleIsError
                    ? "Failed to load roles"
                    : "Select Role"
                }
                style={getFieldStyles("role").input}
                onFocus={() => setActiveField("role")}
                onBlur={() => setActiveField(null)}
                disabled={roleIsLoading || roleIsError}
              />
            </div>
            <div className="flex gap-2 items-center justify-center mx-auto max-w-3xs mt-4">
              <button className="px-6 py-2 bg-[#000C63] hover:bg-[#8A5CFF] text-white rounded-full text-base cursor-pointer roboto font-semibold transition">
                {" "}
                Submit{" "}
              </button>
            </div>
          </div>
        </div>
      )}
      {isEditOverlay && (
        <div className="fixed z-[3000] flex justify-center items-center inset-0 bg-black/70 h-screen w-full px-2">
          <div className="bg-white relative rounded-[20px] p-12 flex flex-col justify-center w-full sm:w-96">
            <div
              className="absolute top-2 border border-gray-600 p-1 rounded-full right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={() => {
                setIsEditOverlay(false);
              }}
            >
              <X />
            </div>
            <div className="relative w-full">
              <label
                htmlFor="id"
                className="absolute bg-[#FAFAFA] text-[#6F7C8E] left-2 -top-2 text-xs roboto"
              >
                Department
              </label>
              <input
                type="text"
                value={editData.department}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                // placeholder={}
                className="w-full px-4 py-3 border-2 rounded-lg bg-[#FAFAFA] text-[#6F7C8E] font-medium roboto placeholder-[#6F7C8E]  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 "
                style={{ borderColor: "#E1E1E1" }}
              />
            </div>

            <div className="relative w-full mt-4">
              <label
                htmlFor="id"
                className="absolute bg-[#FAFAFA] text-[#6F7C8E] left-2 -top-2 text-xs roboto"
              >
                Position
              </label>
              <input
                type="text"
                value={editData.position}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    position: e.target.value,
                  }))
                }
                // placeholder={}
                className="w-full px-4 py-3 border-2 rounded-lg bg-[#FAFAFA] text-[#6F7C8E] font-medium roboto placeholder-[#6F7C8E] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 "
                style={{ borderColor: "#E1E1E1" }}
              />
            </div>

            <div className="flex gap-2 items-center justify-center mx-auto max-w-3xs mt-4">
              <button
                onClick={updateUser}
                className="px-6 py-2 bg-[#000C63] hover:bg-[#8A5CFF] text-white rounded-full text-base cursor-pointer roboto font-semibold transition"
              >
                {" "}
                {updateIsLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  "Update "
                )}{" "}
              </button>
              <button
                onClick={() => setIsEditOverlay(!isEditOverlay)}
                className="px-6 py-2 text-red-400 hover:bg-red-200  bg-red-100 rounded-full text-base cursor-pointer roboto font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="px-6 mt-20">
        <h1 className="mt-6 md:mt-6 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
          {isEditing ? "Update" : "Add New Employee"} Asset
        </h1>
        <form onSubmit={handleSubmitForm} className="mt-6">
          <div className="max-w-4xl overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Column */}
              <div className="flex-1 space-y-6">
                {/* Asset fields (first four) */}
                {fieldList.slice(0, 4).map((field) => (
                  <div key={field.key}>
                    <label
                      className="block roboto text-sm mb-2"
                      style={getFieldStyles(field.key).label}
                    >
                      {field.label}
                      {field.type === "auto" && (
                        <span className="text-xs text-gray-400 ml-2">
                          (Auto Generated)
                        </span>
                      )}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="flex-1 space-y-6">
                {/* Asset ID, Purchase Date, Warranty Until, Cost, and Reason/Comments */}
                {fieldList.slice(4).map((field) => (
                  <div key={field.key}>
                    <label
                      className="block roboto text-sm mb-2"
                      style={getFieldStyles(field.key).label}
                    >
                      {field.label}
                      {field.type === "auto" && (
                        <span className="text-xs text-gray-400 ml-2">
                          (Auto Generated)
                        </span>
                      )}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Buttons */}
          <div className="flex flex-wrap md:gap-5 mt-4 gap-2 items-start pb-4 border-b-[2px] border-b-[#E1E1E1]">
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full !w-auto !shrink-0 text-white  roboto font-semibold text-base md:text-xl cursor-pointer border bg-[#000C63] hover:bg-[#8A5CFF]"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Employee...
                </span>
              ) : (
                "Add Employee"
              )}
            </Button>

            <Button
              type="button"
              onClick={handleCancelForm}
              className="rounded-full !w-auto !shrink-0  roboto font-semibold text-base md:text-xl cursor-pointer text-white border bg-[#000C63] hover:bg-[#8A5CFF]"
            >
              Clear Form
            </Button>
            <Button
              onClick={() => dispatch(openBulkUpload())}
              type="button"
              className="rounded-full !w-auto !shrink-0  roboto font-semibold text-base md:text-xl cursor-pointer text-white border bg-[#000C63] hover:bg-[#8A5CFF]"
            >
              Bulk Import
            </Button>
          </div>
        </form>
      </div>
      {/* existing employee **************************************************************************** */}
      <div className="px-6">
        <h1 className="mt-6 md:mt-6 roboto font-bold text-xl sm:text-[24px] md:text-[30px]">
          Existing Employee
        </h1>

        <div className="flex gap-4 items-center mt-4">
          {/* Enhanced Search Input with Icon */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search Employee....."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg text-gray-600 placeholder-gray-400 
                       focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                       transition-colors duration-200 bg-white"
            />
          </div>

          {/* Enhanced Dropdown with Icon */}

          {/* <CustomVDropdown
              value={type}
              onChange={(e) => setType(e.target.value)}
            options={assetTypeFilter}
            placeholder={"All Type"}
            /> */}
          {/* Custom Dropdown Arrow */}
        </div>
        {/* tabel */}
        <div className="overflow-x-auto my-6 md:mt-7">
          <div className="max-h-[400px] md:max-h-[440px] overflow-y-auto scrollbar-hide hide-scrollbar border border-gray-200 rounded-lg">
            <table className="table-auto w-full min-w-max ">
              <thead className="bg-[#000C63] text-white  font-medium">
                <tr>
                  <th className="sticky top-0 z-20 rounded-tl-[12px] bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Employee Id
                  </th>
                  <th className="sticky top-0 z-20  bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Employee Name
                  </th>

                  <th className="sticky top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Department
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Role
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Is Active
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Email
                  </th>
                  <th className="sticky top-0 z-20 bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Position
                  </th>
                  <th className="sticky top-0 z-20 rounded-tr-[12px] bg-[#000C63] text-white text-center p-3 roboto text-base md:text-lg font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {employeeIsLoading ? (
                  // 🔹 Show skeleton loaders while fetching
                  [...Array(5)].map((_, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="p-3 text-center">
                        <Skeleton className="h-5 w-16 mx-auto " />
                      </td>
                      <td className="p-3 text-center">
                        <Skeleton className="h-6 w-16 mx-auto" />
                      </td>
                      <td className="p-3 text-center">
                        <Skeleton className="h-6 w-24 mx-auto" />
                      </td>
                      <td className="p-3 text-center">
                        <Skeleton className="h-6 w-20 mx-auto" />
                      </td>
                      <td className="p-3 text-center">
                        <Skeleton className="h-6 w-20 mx-auto" />
                      </td>
                      <td className="p-3 text-center">
                        <Skeleton className="h-6 w-28 mx-auto" />
                      </td>
                      <td className="p-3 text-center">
                        <Skeleton className="h-6 w-24 mx-auto" />
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Skeleton className="h-10 w-20 rounded-full" />
                          <Skeleton className="h-10 w-20 rounded-full" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredEmployees && filteredEmployees?.length > 0 ? (
                  // 🔹 Render actual data
                  filteredEmployees.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                        {item?.id}
                      </td>
                      <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                        {item?.user?.first_name + " " + item?.user?.last_name ||
                          "NA"}
                      </td>
                      <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                        {item?.department || "NA"}
                      </td>
                      <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                        {item?.user?.role || "NA"}
                      </td>
                      <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                        {item?.user?.is_active ? "Active" : "Inactive"}
                      </td>
                      <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                        {item?.user?.email || "NA"}
                      </td>
                      <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                        {!item?.position || item?.position === "string"
                          ? "-"
                          : item?.position}
                      </td>
                      <td className="whitespace-nowrap text-center p-3 text-base roboto font-normal">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handelEditClick(item?.id)}
                            className="px-6 py-2 bg-[#000C63] hover:bg-[#8A5CFF] text-white rounded-full text-base cursor-pointer roboto font-semibold transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={
                              () =>
                                item?.user?.is_active
                                  ? deleteEmployeeHandler(item?.user?.id) // deactivate
                                  : activateEmployeeHandler(item?.user?.id) // activate
                            }
                            className={`px-6 py-2 w-[121px] rounded-full text-base cursor-pointer roboto font-semibold transition 
    ${
      item?.user?.is_active
        ? "bg-[#F45E60] hover:bg-[#fa2b2f] text-white" // deactivate style
        : "bg-[#9ACD68] hover:bg-[#7CB556] text-white" // activate style
    }`}
                          >
                            {item?.user?.is_active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => assignrolehandler(item?.user?.id)}
                            className="px-6 py-2 bg-[#000C63] hover:bg-[#8A5CFF] text-white rounded-full text-base cursor-pointer roboto font-semibold transition"
                          >
                            Assign role
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // 🔹 No data state
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center p-6 text-gray-500 roboto"
                    >
                      No Employee found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddEmployee;
