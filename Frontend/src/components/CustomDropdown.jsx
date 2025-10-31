import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const CustomDropdown = ({ label, options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    onChange(option); // 🔥 parent updates state
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="flex flex-col w-full sm:w-64 relative">
      {/* Label */}
      <label className="text-[#808080] mb-1 absolute -top-4 roboto text-base font-regular z-5 left-3 bg-[#FAFAFA] px-1 ">
        {label}
      </label>

      {/* Dropdown Box */}
      <div
        onClick={toggleDropdown}
        className="relative flex  items-center justify-between poppins-medium text-sm px-3 py-3 rounded-md border border-[#E1E1E1] bg-[#FAFAFA] cursor-pointer"
      >
        <span
          className={`text-sm ${value ? "text-[#808080]" : "text-gray-400"}`}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-[#808080] transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />

        {/* Options */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-1 hide-scrollbar max-h-40 overflow-y-auto rounded-md border border-[#E1E1E1] bg-white shadow-md z-10">
            {options.map((option, index) => (
              <div
                key={index}
                onClick={() => handleSelect(option)}
                className="px-3 py-2 text-[#808080] hover:bg-[#FAFAFA] cursor-pointer poppins-medium text-sm"
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default CustomDropdown;
