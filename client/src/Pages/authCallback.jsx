import { useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Context/appContext";
import API from "../Api/axios";
import { toast } from "react-toastify";

const AuthCallback = () => {
  const { setUserData, setIsLoggedIn } = useContext(AppContext);
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const handleCallback = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace("#", ""));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        try {
          // Clear the massive hash from the URL bar immediately
          window.history.replaceState(null, "", window.location.pathname);

          // Send the refresh token to the backend to set the HTTP-Only cookie
          await API.post("/api/auth/set-cookie", { refresh_token: refreshToken });

          // Fetch the user profile using the newly established session
          const { data } = await API.get("/api/auth/user");
          
          if (data.success) {
            setUserData(data.user);
            setIsLoggedIn(true);
            toast.success("Google login successful!");
            navigate("/home");
          }
        } catch (error) {
          console.error("Callback processing error:", error);
          toast.error("Failed to complete Google login.");
          navigate("/auth/login");
        }
      } else {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get("error")) {
          toast.error("Google authentication failed.");
          navigate("/auth/login");
        }
      }
    };

    handleCallback();
  }, [navigate, setUserData, setIsLoggedIn]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d] text-white">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[#00e238]/30 border-t-[#00e238] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-300">Completing secure sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;