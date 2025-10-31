// import React, { useCallback } from "react";
// import { useDispatch, useSelector, shallowEqual } from "react-redux";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/Avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuPortal,
//   DropdownMenuSeparator,
//   DropdownMenuShortcut,
//   DropdownMenuSub,
//   DropdownMenuSubContent,
//   DropdownMenuSubTrigger,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { useLogoutServerMutation } from "@/store/api/authApi";
// import { useNavigate } from "react-router-dom";
// import { logout } from "@/store/Slice/authSlice";
// import { toast } from "sonner";
// import { useGetMeEmployeeQuery } from "@/store/api/employeeApi";

// const Header = ({ great, showNotification, userName, dept }) => {
//   // optimized selector with shallowEqual to avoid unnecessary re-renders
//   const { isAuthenticated, user } = useSelector(
//     (state) => ({
//       isAuthenticated: state.auth.isAuthenticated,
//       user: state.auth.user,
//     }),
//     shallowEqual
//   );
//            const {data,isLoading,isError}= useGetMeEmployeeQuery()

//   const [logoutServer] = useLogoutServerMutation();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const notification = true;

//   // memoized logout handler
//   const logoutHandler = useCallback(async () => {
//     try {
//       await logoutServer().unwrap();
//       dispatch(logout());
//       toast.success("Logout Successfully");
//       navigate("/");
//     } catch (error) {
//       console.error("Server logout failed:", error);
//       dispatch(logout());
//     }
//   }, [logoutServer, dispatch, navigate]);

//   return (
//     <>
//       <div className="w-full fixed inset-0 z-[500] px-6 h-16 bg-white shadow-[0px_-5px_25px_0px_#00000040] flex items-center justify-between">
//         <h1 className="roboto font-bold text-[35px]">LOGO</h1>
//         <div className="flex items-center space-x-2">
//           <h1 className="hidden font-bold md:flex items-center gap-2 text-[18px] lg:text-[24px] text-black">
//             {great} {userName}
//              {isLoading ? (
//     // Skeleton while loading
//     <span className="w-5 h-5 bg-gray-300 animate-pulse rounded-md" />
//   ) : (
//     <span className="text-gray-800">{(data?.department +  " Dept") || ""}</span>
//   )}
//             <div className="w-[1.5px] h-[35px] bg-[#808080]"></div>
//           </h1>

//           {/* Logout Icon */}
//           <svg
//             onClick={logoutHandler}
//             className="cursor-pointer"
//             width="26"
//             height="26"
//             viewBox="0 0 26 26"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               d="M17.6154 19.4615V23.1538C17.6154 23.6435 17.4209 24.1131 17.0747 24.4593C16.7284 24.8055 16.2589 25 15.7692 25H2.84615C2.35652 25 1.88695 24.8055 1.54073 24.4593C1.1945 24.1131 1 23.6435 1 23.1538V2.84615C1 2.35652 1.1945 1.88695 1.54073 1.54073C1.88695 1.1945 2.35652 1 2.84615 1H15.7692C16.2589 1 16.7284 1.1945 17.0747 1.54073C17.4209 1.88695 17.6154 2.35652 17.6154 2.84615V6.53846M12.0769 13H25M25 13L21.3077 9.30769M25 13L21.3077 16.6923"
//               stroke="black"
//               strokeWidth="1.82"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>

//           {/* Notification Icon */}
//           {showNotification && (
//             <svg
//               className="cursor-pointer"
//               width="25"
//               height="32"
//               viewBox="0 0 25 32"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 d="M1.03632 21.4584C0.77848 23.1459 1.92969 24.3165 3.33874 24.8999C8.74132 27.1394 16.2587 27.1394 21.6613 24.8999C23.0703 24.3165 24.2215 23.1447 23.9637 21.4584C23.8063 20.421 23.0231 19.5579 22.4433 18.7142C21.6843 17.5956 21.6092 16.3766 21.608 15.0789C21.6092 10.0649 17.5322 6 12.5 6C7.46785 6 3.3908 10.0649 3.3908 15.0789C3.3908 16.3766 3.31574 17.5968 2.55553 18.7142C1.9769 19.5579 1.1949 20.421 1.03632 21.4584Z"
//                 stroke="black"
//                 strokeWidth="1.81579"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//               <path
//                 d="M7.65771 26.5791C8.21214 28.6673 10.1708 30.2107 12.4998 30.2107C14.8301 30.2107 16.7863 28.6673 17.3419 26.5791"
//                 stroke="black"
//                 strokeWidth="1.81579"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//               {notification && (
//                 <circle
//                   cx="18"
//                   cy="7"
//                   r="5.75"
//                   fill="#FF0000"
//                   stroke="white"
//                   strokeWidth="1.5"
//                 />
//               )}
//             </svg>
//           )}

//           {/* Avatar */}
//           <Avatar className="h-8 w-8 rounded-full hidden sm:block">
//             <AvatarImage
//               src={user?.user?.profile || "https://placehold.co/600x600"}
//             />
//             <AvatarFallback>CN</AvatarFallback>
//           </Avatar>

//           {/* Username + Dropdown */}
//           <div className="flex gap-2 items-center">
//             <h2 className="roboto font-normal text-xl lg:text-2xl truncate sm:block hidden">
//               {user?.username}
//             </h2>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <svg
//                   width="17"
//                   height="10"
//                   viewBox="0 0 17 10"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path
//                     d="M15.5831 -0.000104904L16.97 1.38811L9.41135 8.94938C9.29023 9.07126 9.14621 9.16799 8.98757 9.234C8.82892 9.3 8.65879 9.33398 8.48696 9.33398C8.31513 9.33398 8.145 9.3 7.98636 9.234C7.82772 9.16799 7.68369 9.07126 7.56258 8.94938L0 1.38811L1.38691 0.00120258L8.485 7.09799L15.5831 -0.000104904Z"
//                     fill="black"
//                   />
//                 </svg>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent className="w-56 z-[999]" align="end">
//                 <DropdownMenuLabel>My Account</DropdownMenuLabel>
//                 <DropdownMenuGroup>
//                   <DropdownMenuItem>
//                     Profile
//                     <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem>
//                     Billing
//                     <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem>
//                     Settings
//                     <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem>
//                     Keyboard shortcuts
//                     <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
//                   </DropdownMenuItem>
//                 </DropdownMenuGroup>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuGroup>
//                   <DropdownMenuItem>Team</DropdownMenuItem>
//                   <DropdownMenuSub>
//                     <DropdownMenuSubTrigger>
//                       Invite users
//                     </DropdownMenuSubTrigger>
//                     <DropdownMenuPortal>
//                       <DropdownMenuSubContent>
//                         <DropdownMenuItem>Email</DropdownMenuItem>
//                         <DropdownMenuItem>Message</DropdownMenuItem>
//                         <DropdownMenuSeparator />
//                         <DropdownMenuItem>More...</DropdownMenuItem>
//                       </DropdownMenuSubContent>
//                     </DropdownMenuPortal>
//                   </DropdownMenuSub>
//                   <DropdownMenuItem>
//                     New Team
//                     <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
//                   </DropdownMenuItem>
//                 </DropdownMenuGroup>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem>GitHub</DropdownMenuItem>
//                 <DropdownMenuItem>Support</DropdownMenuItem>
//                 <DropdownMenuItem disabled>API</DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem onClick={logoutHandler}>
//                   Log out
//                   <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// // ✅ Prevents re-renders unless props change
// export default React.memo(Header);
import React, { useCallback } from "react";
import logo from "../../public/images/logo.png";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogoutServerMutation } from "@/store/api/authApi";
import { useNavigate } from "react-router-dom";

import { logout } from "@/store/Slice/authSlice";
import { toast } from "sonner";
import { useGetMeEmployeeQuery } from "@/store/api/employeeApi";

// ✅ Import your NotificationDropdown
import { NotificationDropdown } from "./NotificationDropdown";

const Header = ({ great, showNotification, userName }) => {
  const { isAuthenticated, user } = useSelector(
    (state) => ({
      isAuthenticated: state.auth.isAuthenticated,
      user: state.auth.user,
    }),
    shallowEqual
  );
  const { data, isLoading } = useGetMeEmployeeQuery();

  const [logoutServer] = useLogoutServerMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = useCallback(async () => {
    try {
      await logoutServer().unwrap();
      dispatch(logout());
      toast.success("Logout Successfully");
      navigate("/");
    } catch (error) {
      console.error("Server logout failed:", error);
      dispatch(logout());
    }
  }, [logoutServer, dispatch, navigate]);

  return (
    <div className="w-full fixed inset-0 z-[500] px-6 h-16 bg-white shadow-[0px_-5px_25px_0px_#00000040] flex items-center justify-between">
      <div className="cursor-pointer">
        <img
          src={logo}
          className="object-contain h-10"
          alt=""
          onClick={() => {
            navigate("/adminDashboard");
          }}
        />
      </div>

      <div className="flex items-center space-x-2">
        {/* Greeting + Dept */}
        <h1 className="hidden font-bold md:flex items-center gap-2 text-lg sm:text-xl md:text-xl text-black">
          {great}, {userName}
          {isLoading ? (
            <span className="w-5 h-5 bg-gray-300 animate-pulse rounded-md" />
          ) : (
            <span className="text-gray-800">
              {data?.department ? `${data.department} Dept` : ""}
            </span>
          )}
          <div className="w-[1.5px] h-[35px] bg-[#808080]"></div>
        </h1>

        {/* Logout Icon */}
        <svg
          onClick={logoutHandler}
          className="cursor-pointer"
          width="20"
          height="20"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.6154 19.4615V23.1538C17.6154 23.6435 17.4209 24.1131 17.0747 24.4593C16.7284 24.8055 16.2589 25 15.7692 25H2.84615C2.35652 25 1.88695 24.8055 1.54073 24.4593C1.1945 24.1131 1 23.6435 1 23.1538V2.84615C1 2.35652 1.1945 1.88695 1.54073 1.54073C1.88695 1.1945 2.35652 1 2.84615 1H15.7692C16.2589 1 16.7284 1.1945 17.0747 1.54073C17.4209 1.88695 17.6154 2.35652 17.6154 2.84615V6.53846M12.0769 13H25M25 13L21.3077 9.30769M25 13L21.3077 16.6923"
            stroke="black"
            strokeWidth="1.82"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* ✅ Notification Dropdown (only if showNotification=true) */}
        {showNotification && <NotificationDropdown />}

        {/* Avatar */}
        <Avatar className="h-8 w-8 rounded-full hidden sm:block">
          <AvatarImage
            src={user?.user?.profile || "https://placehold.co/600x600"}
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        {/* Username + Dropdown */}
        <div className="flex gap-2 items-center">
          <h2 className="roboto font-normal text-lg sm:text-xl md:text-2xl truncate sm:block hidden">
            {user?.username}
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <svg
                width="15"
                height="8"
                viewBox="0 0 17 10"
                fill="none"
                className="cursor-pointer"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.5831 -0.000104904L16.97 1.38811L9.41135 8.94938C9.29023 9.07126 9.14621 9.16799 8.98757 9.234C8.82892 9.3 8.65879 9.33398 8.48696 9.33398C8.31513 9.33398 8.145 9.3 7.98636 9.234C7.82772 9.16799 7.68369 9.07126 7.56258 8.94938L0 1.38811L1.38691 0.00120258L8.485 7.09799L15.5831 -0.000104904Z"
                  fill="black"
                />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 z-[999]" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>Email</DropdownMenuItem>
                      <DropdownMenuItem>Message</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>More...</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem>New Team</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>GitHub</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuItem disabled>API</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logoutHandler}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Header);
