import React from 'react';
import ellipse from '/images/Ellipse.png'; // remove curly braces for default import
import { Skeleton } from './ui/skeleton';

const Card = ({SvgIcon ,name, count, isLoading}) => {
   
    
return (
    <div className="bg-white relative overflow-hidden p-3 h-32 border border-[#E1E1E199] rounded-[10px]">
        {/* Background ellipse image */}
        <img
            src={ellipse}
            alt="ellipse"
            className="absolute top-0 right-0 w-[100px] h-auto pointer-events-none"
        />

          {/* SVG over ellipse */}
      {SvgIcon && (
        <div className="absolute top-[20px] right-[20px] z-10">
          <SvgIcon className="w-8 h-8 text-gray-700" />
        </div>
      )}

        <div className="relative flex flex-col justify-between h-full z-10">
           {isLoading ? (
          <Skeleton className="h-6 w-12 rounded-md" />
        ) : (
                    <h1 className="roboto font-semibold text-[38px]">{count || "NA"}</h1>

        )}
            <h2 className='roboto text-lg md:text-xl lg:text-2xl font-medium'>{name || "-"}</h2>
        </div>
    </div>
);
};

export default Card;
