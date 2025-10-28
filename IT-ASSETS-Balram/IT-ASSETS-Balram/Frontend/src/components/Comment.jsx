import React, { useMemo } from "react";

const Comment = ({message}) => {
  // Predefined colors
  const colors = [
    "border-l-[#28A745]",
    "border-l-[#FFC107]",
    "border-l-[#17A2B8]",
    
  ];

  // Pick a random left border color
  const randomColor = useMemo(
    () => colors[Math.floor(Math.random() * colors.length)],[]);

  return (
    <div
      className={`flex flex-col border p-4 rounded-md shadow-sm w-full mt-5 bg-[#FAFAFA] border-[#E1E1E1] border-l-8 ${randomColor}`}
    >
      {/* <h4 className="font-semibold roboto text-lg md:text-2xl text-[#000000]">{title}</h4> */}
      <div className="max-w-4xl">
      <p className="roboto font-normal text-base md:text-xl">{message}</p>
         
      </div>
      {/* <span className="text-base  text-[#808080] mt-1">{time}</span> */}

    </div>
  );
};

export default Comment;
