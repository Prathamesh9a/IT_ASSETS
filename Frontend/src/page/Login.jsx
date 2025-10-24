import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import bgImage from "/images/welcome-illustration.svg";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/label";
import { useLazyGetProfileQuery, useLoginMutation, useSsoLoginMutation } from "@/store/api/authApi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "@/store/Slice/authSlice";
import { toast } from "sonner";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading, isError, error }] = useLoginMutation();
  const [getProfile] = useLazyGetProfileQuery();
  const [ssoLogin, { isLoading: isSsoLoading }] = useSsoLoginMutation();


  // ✅ Immediate state updates (no debounce)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [remember, setRemember] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Always get latest values from state
    const { data } = await login(formData);

    if (data?.access && data?.refresh) {
      // Save tokens
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);

      // Get profile
      const user = await getProfile().unwrap();

      dispatch(loginSuccess({ ...user, role: data.role }));

      toast.success(`Welcome, ${user.username || "User"}!`);

      // Redirect based on role
      if (user.role === "admin") navigate("/adminDashboard");
      else if (user.role === "super_admin") navigate("/superAdminDashboard");
      else navigate("/userDashboard");
    }
  };

   // ✅ Separate handler for SSO login
  // const handleSsoLogin = async () => {
  //   try {
  //     const { data } = await ssoLogin({
  //       provider: "microsoft",
  //       token: "sample-ms-token", // replace with actual MS token
  //     });

  //     if (data?.access && data?.refresh) {
  //       await handleAuthSuccess(data);
  //     }
  //   } catch (err) {
  //     toast.error(err?.data?.detail || "SSO Login failed. Try again.");
  //   }
  // };


  useEffect(() => {
    if (isError) {
      toast.error(error?.data?.detail || "Login failed. Try again.");
    }
  }, [isError]);

  return (
    <div
      className="min-h-screen bg-no-repeat relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "contain",
      }}
    >
      <div className="hidden max-[768px]:block absolute inset-0 backdrop-blur-sm bg-white/80"></div>
      <div
        className="
          flex flex-col justify-center items-center h-screen w-auto
          md:w-2/5 max-md:px-4 relative
          md:absolute md:left-1/2 md:top-1/2 md:-translate-y-1/2
        "
      >
        <h1 className="font-bold text-[36px] sm:text-[54px] md:text-[63px] lg:text-[73px] text-black">
          LOGO
        </h1>
        <h3 className="roboto font-bold text-[22px] sm:text-[28px] md:text-[32px] text-center leading-none">
          Login In To <br />
          <span className="text-[#2066FF] roboto font-bold">Your</span> Account
        </h3>

        <form onSubmit={handleSubmit} className="mt-12 sm:w-[413px] w-[310px]">
          {/* Email */}
          <div className="text-left relative mb-6">
            <input
              type="text"
              id="email"
              name="email"
              className="input-field peer poppins-medium"
              placeholder=" "
              value={formData.email}
              onChange={handleChange}
            />
            <label htmlFor="email" className="floating-label">
              Email
            </label>
          </div>

          {/* Password */}
          <div className="text-left relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="input-field peer poppins-medium"
              placeholder=" "
              value={formData.password}
              onChange={handleChange}
            />
            <label htmlFor="password" className="floating-label">
              Enter Your password
            </label>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-[#2066FF]"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-3 mt-6">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={setRemember}
              className="max-[904px]:border-[#2066FF]"
            />
            <Label htmlFor="remember" className="text-[#6F7C8E] poppins-regular">
              Remember me
            </Label>
          </div>

          {/* Submit Button */}
          <button
            disabled={isLoading}
            type="submit"
            className="mt-6 hover:scale-95 roboto text-base cursor-pointer w-full bg-gradient-to-t from-[#3503D7] to-[#AA00FF] text-white p-4 rounded-lg flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* OR section */}
        {/* <h2 className="mt-3 text-[#6F7C8E] poppins-medium text-base md:text-xl">
          Or
        </h2>
        {/* <button className="mt-2 cursor-pointer hover:scale-90">
          <img src="/images/microsoft.png" alt="Microsoft Login" />
        </button> */}
         {/* <button
        // onClick={handleSsoLogin}
        disabled={isSsoLoading}
        className="mt-2 cursor-pointer hover:scale-90 flex items-center gap-2"
      >  {isSsoLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <img src="/images/microsoft.png" alt="Microsoft Login" />
        )}
      </button> */}
      </div>
    </div>
  );
};

export default Login;
