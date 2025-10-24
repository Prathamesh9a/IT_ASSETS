// 📂 src/components/Notification.jsx
import React, { useMemo } from "react"

const Notification = ({ title, message, time, details, type }) => {
  const colors = [
    "border-l-[#28A745]",
    "border-l-[#FFC107]",
    "border-l-[#17A2B8]",
  ]

  const randomColor = useMemo(
    () => colors[Math.floor(Math.random() * colors.length)],
    []
  )

  return (
    <div
      className={`flex flex-col border p-4 rounded-md shadow-sm w-full mt-5 bg-[#FAFAFA] border-[#E1E1E1] border-l-8 ${randomColor}`}
    >
      {/* Actor Name */}
      <h4 className="font-semibold roboto text-lg md:text-2xl text-[#000000]">
       Asset {type}
      </h4>

      {/* Message */}
      <p className="roboto font-normal text-base md:text-xl">{message}</p>

      {/* Time */}
      <span className="text-base text-[#808080] mt-1">{time}</span>

      {/* ✅ Extra Details */}
      {details && (
        <div className="mt-3 text-sm text-gray-600 space-y-1">
          {/* <p><span className="font-medium">Notification ID:</span> {details.id}</p> */}
          <p><span className="font-medium">Type:</span> {details.type}</p>
          {/* <p><span className="font-medium">Asset:</span> {details.asset}</p>
          <p><span className="font-medium">Assignment:</span> {details.assignment}</p> */}
        </div>
      )}
    </div>
  )
}

export default Notification
