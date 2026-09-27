import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../Api/axios";

const ChangePassword = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !token || !password || !confirmPassword) {
      return toast.error("All fields are required.");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    setLoading(true);

    try {
      // 1. Verify the OTP code with Supabase via your backend (or directly)
      // 2. Update the password
      const { data } = await API.post("/api/auth/verify-and-reset", {
        email,
        token,
        newPassword: password,
      });

      toast.success(data.message || "Password reset successfully!");
      setTimeout(() => navigate("/auth/login"), 2000);

    } catch (error) {
      console.error("Password reset error:", error);
      toast.error(error.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-[380px]"
      >
        <h2 className="text-green-500 text-2xl mb-4 text-center font-bold">Reset Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <input
          type="text"
          placeholder="Enter the OTP code"
          inputMode="numeric"
          pattern="[0-9]*"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          maxLength={6}
          className="w-full p-3 mb-4 bg-[#f9f9f9] border border-gray-300 rounded-lg text-gray-900 tracking-[0.5em] text-center font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#00e238]"
        />

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;