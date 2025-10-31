import React from "react";
import ellipse from "/images/Ellipse.png"; // remove curly braces for default import
import { Skeleton } from "./ui/skeleton";

const Card = ({ SvgIcon, name, count, isLoading }) => {
  return (
    <div className="bg-white relative overflow-hidden p-2 h-[110px] border border-[#c1c1c1c2] rounded-[10px] shadow-xl">
      {/* Background ellipse image */}
      <img
        src={ellipse}
        alt="ellipse"
        className="absolute top-0 right-0 w-[60px] object-contain h-auto pointer-events-none"
      />

      {/* SVG over ellipse */}
      {SvgIcon && (
        <div className="absolute top-[8px] right-[8px] z-10">
          <SvgIcon className="w-8 h-8 text-gray-700" />
        </div>
      )}

      <div className="relative flex flex-col justify-between h-full z-10">
        {isLoading ? (
          <Skeleton className="h-4 w-8 rounded-md" />
        ) : (
          <h1 className="roboto font-semibold text-lg sm:text-xl md:text-2xl">
            {count || 0}
          </h1>
        )}
        <h2 className="roboto text-base md:text-lg lg:text-xl font-medium">
          {name || "-"}
        </h2>
      </div>
    </div>
  );
};

export default Card;
