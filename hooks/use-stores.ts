import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { Language, detectDeviceLanguage } from "@/constants/translations";

type LocalizationState = {
  language: Language;
  setLanguage: (l: Language) => void;
  hydrate: () => Promise<void>;
};

export const useLocalizationStore = create<LocalizationState>((set) => ({
  language: detectDeviceLanguage(),
  setLanguage: (language: Language) => {
    void AsyncStorage.setItem("lc/lang", language);
    set({ language });
  },
  hydrate: async () => {
    try {
      const v = (await AsyncStorage.getItem("lc/lang")) as Language | null;
      if (v) set({ language: v });
    } catch (e) {
      console.log("Failed to hydrate language", e);
    }
  },
}));

type CreditsState = {
  credits: number;
  spend: (amount: number) => void;
  earn: (amount: number) => void;
  hydrate: () => Promise<void>;
};

export const useCreditsStore = create<CreditsState>((set, get) => ({
  credits: 5,
  spend: (amount: number) => {
    const next = Math.max(0, get().credits - amount);
    void AsyncStorage.setItem("lc/credits", String(next));
    set({ credits: next });
  },
  earn: (amount: number) => {
    const next = get().credits + amount;
    void AsyncStorage.setItem("lc/credits", String(next));
    set({ credits: next });
  },
  hydrate: async () => {
    try {
      const v = await AsyncStorage.getItem("lc/credits");
      if (v != null) set({ credits: Number.parseInt(v, 10) });
    } catch (e) {
      console.log("Failed to hydrate credits", e);
    }
  },
}));