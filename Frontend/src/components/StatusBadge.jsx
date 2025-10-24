import React from "react";

const StatusBadge = ({ status }) => {
  // Define color schemes
  const statusStyles = {
    assigned: {
      bg: "bg-[#D4EDDA]",
      text: "text-[#155724]",
      dot: "bg-[#155724]",
      label: "Assigned",
    },
    medium: {
      bg: "bg-[#D4EDDA]",
      text: "text-[#856404]",
      dot: "bg-[#856404]",
      label: "Medium",
    },
    high: {
      bg: "bg-[#D4EDDA]",
      text: "text-[#721C24]",
      dot: "bg-[#721C24]",
      label: "High",
    },
    low: {
      bg: "bg-[#D4EDDA]",
      text: "text-[#0C5460]",
      dot: "bg-[#0C5460]",
      label: "Low",
    },
  };

  const { bg, text, dot, label } = statusStyles[status] || statusStyles.low;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full roboto text-sm font-medium ${bg} ${text}`}
    >
      <span className={`w-2 h-2 rounded-full mr-2 ${dot}`}></span>
      {label}
    </span>
  );
};

export default StatusBadge;
