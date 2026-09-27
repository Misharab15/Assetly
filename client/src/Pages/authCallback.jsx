import { useEffect, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppContext } from "../Context/appContext";
import API from "../Api/axios";
import { toast } from "react-toastify";

const AuthCallback = () => {
  const { setUserData, setIsLoggedIn } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const handleCallback = async () => {
      const login = searchParams.get("login");
      const error = searchParams.get("error");
      const code = searchParams.get("code");

      // If Supabase returns code directly to frontend, forward it to backend callback
      if (code && !login) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
        const callbackUrl = `${backendUrl}/api/auth/callback?code=${encodeURIComponent(code)}`;
        window.location.replace(callbackUrl);
        return;
      }

      // Google/Supabase authentication failed
      if (error) {
        toast.error("Google authentication failed.");
        navigate("/auth/login", { replace: true });
        return;
      }

      // Backend successfully completed OAuth
      if (login === "success") {
        try {
          /*
           * The backend has already:
           *
           * 1. Exchanged the Google OAuth code
           * 2. Created the Supabase session
           * 3. Stored the refresh token in an HTTP-only cookie
           *
           * We now ask the backend for the authenticated user.
           *
           * If the access token is not currently in memory,
           * Axios will automatically refresh it using the
           * HTTP-only refresh-token cookie.
           */

          const { data } = await API.get("/api/auth/user");

          if (!data?.success || !data?.user) {
            throw new Error("Unable to retrieve authenticated user");
          }

          setUserData(data.user);
          setIsLoggedIn(true);

          toast.success("Google login successful!");

          navigate("/home", { replace: true });

        } catch (error) {
          console.error("Google callback processing error:", error);

          toast.error("Failed to complete Google login.");

          navigate("/auth/login", { replace: true });
        }

        return;
      }

      // No success or error parameter
      console.error("Invalid authentication callback.");
      navigate("/auth/login", { replace: true });
    };

    handleCallback();
  }, [navigate, searchParams, setUserData, setIsLoggedIn]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d] text-white">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[#00e238]/30 border-t-[#00e238] rounded-full animate-spin mx-auto mb-4"></div>

        <p className="text-gray-300">
          Completing secure sign in...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;

// import { useEffect, useContext, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { AppContext } from "../Context/appContext";
// import API from "../Api/axios";
// import { toast } from "react-toastify";

// const AuthCallback = () => {
//   const { setUserData, setIsLoggedIn } = useContext(AppContext);
//   const navigate = useNavigate();
//   const processed = useRef(false);

//   useEffect(() => {
//     if (processed.current) return;
//     processed.current = true;

//     const handleCallback = async () => {
//       const hash = window.location.hash;
//       const params = new URLSearchParams(hash.replace("#", ""));
//       const accessToken = params.get("access_token");
//       const refreshToken = params.get("refresh_token");

//       if (accessToken && refreshToken) {
//         try {
//           // Clear the massive hash from the URL bar immediately
//           window.history.replaceState(null, "", window.location.pathname);

//           // Send the refresh token to the backend to set the HTTP-Only cookie
//           await API.post("/api/auth/set-cookie", { refresh_token: refreshToken });

//           // Fetch the user profile using the newly established session
//           const { data } = await API.get("/api/auth/user");
          
//           if (data.success) {
//             setUserData(data.user);
//             setIsLoggedIn(true);
//             toast.success("Google login successful!");
//             navigate("/home");
//           }
//         } catch (error) {
//           console.error("Callback processing error:", error);
//           toast.error("Failed to complete Google login.");
//           navigate("/auth/login");
//         }
//       } else {
//         const queryParams = new URLSearchParams(window.location.search);
//         if (queryParams.get("error")) {
//           toast.error("Google authentication failed.");
//           navigate("/auth/login");
//         }
//       }
//     };

//     handleCallback();
//   }, [navigate, setUserData, setIsLoggedIn]);

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d] text-white">
//       <div className="text-center">
//         <div className="w-8 h-8 border-4 border-[#00e238]/30 border-t-[#00e238] rounded-full animate-spin mx-auto mb-4"></div>
//         <p className="text-gray-300">Completing secure sign in...</p>
//       </div>
//     </div>
//   );
// };

// export default AuthCallback;
