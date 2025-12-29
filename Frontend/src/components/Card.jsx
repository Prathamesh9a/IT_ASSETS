import React from "react";
import { Skeleton } from "./ui/skeleton";

const Card = ({ SvgIcon, name, count, isLoading }) => {
  return (
    <div className="group bg-white hover:bg-purple-100 relative overflow-hidden p-2 h-[110px] border border-[#c1c1c1c2] rounded-[10px] shadow-xl transition-all duration-300 ease-in-out">
      {/* CSS Ellipse shape instead of image */}
      <div className="absolute -top-2 -right-2 w-[65px] h-[65px] pointer-events-none transition-all duration-300 ease-in-out">
        {/* Original gray ellipse */}
        <div className="absolute inset-0 bg-purple-100 rounded-full opacity-100 group-hover:opacity-0 transition-opacity duration-300 ease-in-out"></div>
        {/* White ellipse on hover */}
        <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"></div>
      </div>

      {/* SVG over ellipse */}
      {SvgIcon && (
        <div className="absolute top-[8px] right-[8px] z-10">
          <SvgIcon 
            className="w-8 h-8 text-gray-700 group-hover:text-white transition-all duration-300 ease-in-out"
          />
        </div>
      )}

      <div className="relative flex flex-col justify-between h-full z-10">
        {isLoading ? (
          <Skeleton className="h-4 w-8 rounded-md" />
        ) : (
          <h1 className="roboto font-semibold text-lg sm:text-xl md:text-2xl group-hover:text-black transition-colors duration-300 ease-in-out">
            {count || 0}
          </h1>
        )}
        <h2 className="roboto text-base md:text-lg lg:text-xl font-medium group-hover:text-black transition-colors duration-300 ease-in-out">
          {name || "-"}
        </h2>
      </div>
    </div>
  );
};

export default Card;