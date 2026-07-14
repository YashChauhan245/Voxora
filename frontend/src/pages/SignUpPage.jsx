import { useState } from "react";
import { Link } from "react-router";
import BrandMark from "../components/BrandMark";
import { useThemeStore } from "../store/useThemeStore";
import useSignUp from "../hooks/useSignUp";
import { EyeIcon, EyeOffIcon } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

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
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-base-100"
      data-theme={theme}
    >
      {/* Background glow blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: "oklch(var(--p))" }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl"
          style={{ background: "oklch(var(--s))" }}
        />
      </div>

      <div className="relative w-full max-w-4xl mx-auto">
        <div
          className="flex flex-col lg:flex-row rounded-2xl overflow-hidden bg-base-200/85 border border-primary/15 backdrop-blur-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.8),_inset_0_1px_0_rgba(255,255,255,0.05)]"
        >
          {/* HERO SIDE (left on desktop) */}
          <div
            className="hidden lg:flex w-full lg:w-1/2 flex-col items-center justify-center p-10 relative border-r border-primary/15"
            style={{
              background: "linear-gradient(135deg, oklch(var(--p) / 0.1) 0%, oklch(var(--s) / 0.07) 100%)",
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
                Start Your Journey
              </h2>
              <p className="text-sm text-base-content/45 max-w-xs leading-relaxed">
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
                  <div className="text-xs text-base-content/40 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FORM SIDE */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
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
                Create account
              </h1>
              <p className="text-base-content/45 text-sm">
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
                    className="input input-bordered pr-10"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    autoComplete="new-password"
                    minLength={6}
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

              {/* Terms */}
              <label className="flex items-start gap-2.5 cursor-pointer group mt-1">
                <input type="checkbox" className="checkbox mt-0.5" required />
                <span className="text-xs text-base-content/45 leading-relaxed">
                  I agree to the{" "}
                  <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>{" "}
                  and{" "}
                  <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
                </span>
              </label>

              <button
                className="btn btn-primary w-full mt-1"
                type="submit"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    Creating account…
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="text-sm text-base-content/40 text-center mt-6">
              Already have an account?&nbsp;
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;