
import React, { useState, useRef, useEffect } from 'react';

// Custom Dropdown Component - ONLY ADDITION TO YOUR CODE
export const CustomVDropdown = ({ 
  value, 
  onChange, 
  onFocus, 
  onBlur, 
  options, 
  placeholder, 
  style,
  className ,
   disableWhen = false, 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);


// console.log(style);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onBlur]);

  const handleToggle = () => {
     if (disableWhen) return;  
    setIsOpen(!isOpen);
    if (!isOpen && onFocus) {
      onFocus();
    }
  };

  const handleOptionClick = (optionValue) => {
     if (disableWhen) return;  
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
    if (onBlur) onBlur();
  };

  const selectedOption = options?.find(option => option?.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={ `${className} w-full px-4 py-3 border-2 rounded-lg text-[#6F7C8E] font-medium focus:outline-none appearance-none cursor-pointer pr-12 `}
        style={style}
        onClick={handleToggle}
      >
        <span className={ value ? 'text-[#6F7C8E] roboto text-sm font-medium' : 'text-[#6F7C8E] roboto text-sm font-medium' }>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </div>
      
      {/* Dropdown Arrow */}
      <div className="absolute inset-y-0 right-0  flex items-center pr-4 pointer-events-none">
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1  bg-white border-2 border-[#E1E1E1] rounded-lg shadow-lg max-h-40 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className="px-4 py-3 text-[#6F7C8E] roboto font-medium cursor-pointer text-[15px] hover:bg-blue-50 hover:text-[#2066FF] transition-colors"
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
