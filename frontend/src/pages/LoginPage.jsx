import { useState } from "react";
import { Link } from "react-router";
import useLogin from "../hooks/useLogin";
import BrandMark from "../components/BrandMark";
import { useThemeStore } from "../store/useThemeStore";
import { EyeIcon, EyeOffIcon, ZapIcon } from "lucide-react";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const { isPending, error, loginMutation } = useLogin();
  const { theme } = useThemeStore();

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      data-theme={theme}
      style={{ background: "#000" }}
    >
      {/* Background mesh glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "oklch(0.62 0.24 280)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-8 blur-3xl"
          style={{ background: "oklch(0.64 0.26 330)" }}
        />
      </div>

      <div className="relative w-full max-w-4xl mx-auto">
        <div
          className="flex flex-col lg:flex-row rounded-2xl overflow-hidden"
          style={{
            background: "rgba(10,10,20,0.85)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(40px)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* FORM SIDE */}
          <div className="w-full lg:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
            {/* Logo */}
            <div className="mb-8 flex items-center gap-3">
              <div className="relative">
                <BrandMark className="size-10 relative z-10" />
                <div className="absolute inset-0 blur-lg opacity-50 rounded-full" style={{ background: "oklch(0.62 0.24 280)" }} />
              </div>
              <span className="text-2xl font-bold tracking-tight gradient-text font-display">
                Voxora
              </span>
            </div>

            <div className="mb-7">
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                Welcome back
              </h1>
              <p className="text-white/45 text-sm">
                Sign in to continue your language journey
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-error mb-5 text-sm">
                <span>{error.response?.data?.message || error.message || "An unexpected error occurred"}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email address</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input input-bordered"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="input input-bordered pr-11"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full mt-2 h-11 text-sm"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-white/40 mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Create one
              </Link>
            </p>
          </div>

          {/* HERO SIDE */}
          <div
            className="hidden lg:flex w-full lg:w-1/2 flex-col items-center justify-center p-10 relative"
            style={{
              background: "linear-gradient(135deg, rgba(100,0,255,0.12) 0%, rgba(255,0,200,0.08) 100%)",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="relative w-full max-w-xs mx-auto">
              <img
                src="/i.png"
                alt="Language connection illustration"
                className="w-full h-auto relative z-10 drop-shadow-2xl"
              />
              <div
                className="absolute inset-0 blur-2xl opacity-25 -z-0"
                style={{ background: "linear-gradient(135deg, oklch(0.62 0.24 280), oklch(0.64 0.26 330))" }}
              />
            </div>

            <div className="text-center mt-8 space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Connect Worldwide
              </h2>
              <p className="text-sm text-white/45 max-w-xs leading-relaxed">
                Practice conversations, make friends, and level up your language skills together
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {["🎙️ Voice Calls", "💬 Real-time Chat", "🤖 AI Tutor", "🌍 50+ Languages"].map((feat) => (
                <span
                  key={feat}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-white/60"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;