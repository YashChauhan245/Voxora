import { useState } from "react";
import { Link } from "react-router";
import BrandMark from "../components/BrandMark";
import { useThemeStore } from "../store/useThemeStore";
import useSignUp from "../hooks/useSignUp";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { isPending, error, signupMutation } = useSignUp();
  const { theme } = useThemeStore();

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      data-theme={theme}
      style={{ background: "#000" }}
    >
      {/* Background glow blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: "oklch(0.62 0.24 280)" }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl"
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
          {/* HERO SIDE (left on desktop) */}
          <div
            className="hidden lg:flex w-full lg:w-1/2 flex-col items-center justify-center p-10 relative"
            style={{
              background: "linear-gradient(135deg, rgba(100,0,255,0.1) 0%, rgba(255,0,200,0.07) 100%)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
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
                Start Your Journey
              </h2>
              <p className="text-sm text-white/45 max-w-xs leading-relaxed">
                Join thousands of language learners worldwide and accelerate your fluency
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-8">
              {[
                { num: "50K+", label: "Learners" },
                { num: "50+", label: "Languages" },
                { num: "4.9★", label: "Rating" },
              ].map(({ num, label }) => (
                <div key={label} className="text-center">
                  <div className="text-xl font-bold gradient-text">{num}</div>
                  <div className="text-xs text-white/40 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

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
                Create account
              </h1>
              <p className="text-white/45 text-sm">
                Join Voxora and start your language learning adventure
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-error mb-5 text-sm">
                <span>{error.response?.data?.message || error.message || "An unexpected error occurred"}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Full Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Full name</span>
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input input-bordered"
                  value={signupData.fullName}
                  onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                  required
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email address</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input input-bordered"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
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
                    placeholder="Min. 6 characters"
                    className="input input-bordered pr-11"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    autoComplete="new-password"
                    minLength={6}
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

              {/* Terms */}
              <label className="flex items-start gap-2.5 cursor-pointer group mt-1">
                <input type="checkbox" className="checkbox mt-0.5" required />
                <span className="text-xs text-white/45 leading-relaxed">
                  I agree to the{" "}
                  <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>{" "}
                  and{" "}
                  <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
                </span>
              </label>

              <button
                className="btn btn-primary w-full h-11 text-sm mt-1"
                type="submit"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-white/40 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;