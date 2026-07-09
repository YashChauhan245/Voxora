import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("voxora-theme") || "cosmic-abyss",
  setTheme: (theme) => {
    localStorage.setItem("voxora-theme", theme);
    set({ theme });
  },
}));