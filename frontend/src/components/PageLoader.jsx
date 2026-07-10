import { useThemeStore } from "../store/useThemeStore";

const PageLoader = () => {
  const { theme } = useThemeStore();
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      data-theme={theme}
      style={{ background: "#000" }}
    >
      {/* Animated logo mark */}
      <div className="relative">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, oklch(0.62 0.24 280), oklch(0.64 0.26 330))",
            boxShadow: "0 0 32px oklch(0.62 0.24 280 / 0.5)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        >
          <span className="text-white text-xl font-bold font-display">V</span>
        </div>
        <div
          className="absolute inset-0 rounded-2xl blur-xl opacity-40"
          style={{
            background: "linear-gradient(135deg, oklch(0.62 0.24 280), oklch(0.64 0.26 330))",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>

      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "oklch(0.62 0.24 280)",
              animation: `bounce 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};
export default PageLoader;