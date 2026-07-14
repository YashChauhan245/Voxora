import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("voxora-theme") || "voxora-dark",
  setTheme: (theme) => {
    localStorage.setItem("voxora-theme", theme);
    set({ theme });
  },
}));