import { useState } from "react";
import { Link } from "react-router";
import useLogin from "../hooks/useLogin";
import BrandMark from "../components/BrandMark";
import { useThemeStore } from "../store/useThemeStore";
import { EyeIcon, EyeOffIcon, ZapIcon } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

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
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-base-100"
      data-theme={theme}
    >
      {/* Background mesh glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "oklch(var(--p))" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-8 blur-3xl"
          style={{ background: "oklch(var(--s))" }}
        />
      </div>

      <div className="relative w-full max-w-4xl mx-auto">
        <div
          className="flex flex-col lg:flex-row rounded-2xl overflow-hidden bg-base-200/85 border border-primary/15 backdrop-blur-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.8),_inset_0_1px_0_rgba(255,255,255,0.05)]"
        >
          {/* FORM SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="w-full lg:w-1/2 p-8 sm:p-10 flex flex-col justify-center"
          >
            {/* Logo */}
            <div className="mb-8 flex items-center gap-3">
              <div className="relative">
                <BrandMark className="size-10 relative z-10" />
                <div className="absolute inset-0 blur-lg opacity-50 rounded-full bg-primary/50" />
              </div>
              <span className="text-2xl font-bold tracking-tight gradient-text font-display">
                Voxora
              </span>
            </div>

            <div className="mb-7">
              <h1 className="text-3xl font-bold text-base-content mb-2 tracking-tight">
                Welcome back
              </h1>
              <p className="text-base-content/45 text-sm">
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
                    className="input input-bordered pr-10"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-full mt-2"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <ZapIcon className="size-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <p className="text-sm text-base-content/40 text-center mt-6">
              Don't have an account?&nbsp;
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </motion.div>

          {/* HERO SIDE */}
          <div
            className="hidden lg:flex w-full lg:w-1/2 flex-col items-center justify-center p-10 relative border-l border-primary/15"
            style={{
              background: "linear-gradient(135deg, oklch(var(--p) / 0.12) 0%, oklch(var(--s) / 0.08) 100%)",
            }}
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full max-w-xs mx-auto"
            >
              <img
                src="/i.png"
                alt="Language connection illustration"
                className="w-full h-auto relative z-10 drop-shadow-2xl"
              />
              <div
                className="absolute inset-0 blur-2xl opacity-25 -z-0"
                style={{ background: "linear-gradient(135deg, oklch(var(--p)), oklch(var(--s)))" }}
              />
            </motion.div>

            <div className="text-center mt-8 space-y-2">
              <h2 className="text-xl font-bold text-base-content tracking-tight">
                Connect Worldwide
              </h2>
              <p className="text-sm text-base-content/45 max-w-xs leading-relaxed">
                Practice conversations, make friends, and level up your language skills together
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {["🎙️ Voice Calls", "💬 Real-time Chat", "🤖 AI Tutor", "🌍 50+ Languages"].map((feat, index) => (
                <motion.span
                  key={feat}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.08 }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-base-content/60 bg-base-100/50 border border-primary/15"
                >
                  {feat}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;