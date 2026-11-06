import { create } from 'zustand';

interface ToastState {
  message: string | null;
  subtext?: string;
  icon?: string;
  visible: boolean;
  showToast: (message: string, subtext?: string, icon?: string) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  subtext: undefined,
  icon: undefined,
  visible: false,
  showToast: (message, subtext, icon = '👑') => {
    set({ message, subtext, icon, visible: true });
    setTimeout(() => {
      set({ visible: false });
    }, 3200);
  },
  hideToast: () => set({ visible: false })
}));
