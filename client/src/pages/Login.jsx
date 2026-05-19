import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Map } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3efe8] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-semibold text-[#2c2824]">
            <Map className="text-[#5a7fa8]" size={28} />
            TravelAI
          </div>
          <p className="text-[#8a8278] mt-2 text-sm">Sign in to plan your next adventure</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-[#e8e2d9] p-8 space-y-5"
        >
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-[#5c564f] mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#e0d8cc] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5a7fa8]/25"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5c564f] mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#e0d8cc] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5a7fa8]/25"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3b6ea8] hover:bg-[#2f5a8a] text-white font-semibold py-3 rounded-xl disabled:opacity-60 transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-center text-sm text-[#8a8278]">
            No account?{" "}
            <Link to="/register" className="text-[#3b6ea8] font-medium hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
