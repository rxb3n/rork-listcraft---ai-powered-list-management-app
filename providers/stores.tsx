import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Language, detectDeviceLanguage } from "@/constants/translations";
import { useStorage } from "@/providers/storage";

export const [LocalizationProvider, useLocalizationStore] = createContextHook(() => {
  const { getItem, setItem } = useStorage();
  const [language, setLanguageState] = useState<Language>(detectDeviceLanguage());

  const setLanguage = useCallback(async (lang: Language) => {
    if (lang && typeof lang === "string" && lang.trim().length > 0) {
      await setItem("lc/lang", lang);
      setLanguageState(lang);
    }
  }, [setItem]);

  const hydrate = useCallback(async () => {
    try {
      const stored = await getItem("lc/lang");
      if (stored && typeof stored === "string") {
        setLanguageState(stored as Language);
      }
    } catch (e) {
      console.log("Failed to hydrate language", e);
    }
  }, [getItem]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return useMemo(() => ({ language, setLanguage }), [language, setLanguage]);
});

function monthKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const mm = m < 10 ? `0${m}` : String(m);
  return `${y}-${mm}`;
}

function dayKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const mm = m < 10 ? `0${m}` : String(m);
  const day = d.getUTCDate();
  const dd = day < 10 ? `0${day}` : String(day);
  return `${y}-${mm}-${dd}`;
}

export type CreditsState = {
  credits: number;
  pro: boolean;
  periodKey: string;
  usedThisPeriod: number;
  dailyAdLast: string | null;
  monthlyFreeLimit: number;
  canSpend: (amount: number) => boolean;
  spend: (amount: number) => Promise<void>;
  earn: (amount: number) => Promise<void>;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  resetPeriodIfNeeded: () => Promise<void>;
  canWatchDailyAd: () => boolean;
  markDailyAd: () => Promise<void>;
};

export const [CreditsProvider, useCreditsStore] = createContextHook<CreditsState>(() => {
  const { getItem, setItem } = useStorage();
  const now = new Date();
  const [credits, setCreditsState] = useState<number>(0);
  const [pro, setPro] = useState<boolean>(false);
  const [periodKey, setPeriodKey] = useState<string>(monthKey(now));
  const [usedThisPeriod, setUsed] = useState<number>(0);
  const [dailyAdLast, setDailyAdLast] = useState<string | null>(null);
  const monthlyFreeLimit = 10;

  const resetPeriodIfNeeded = useCallback(async () => {
    const currentKey = monthKey(new Date());
    if (currentKey !== periodKey) {
      await setItem("lc/periodKey", currentKey);
      await setItem("lc/used", "0");
      setPeriodKey(currentKey);
      setUsed(0);
    }
  }, [periodKey, setItem]);

  const canSpend = useCallback((amount: number) => {
    if (amount <= 0) return true;
    if (pro) return true;
    if (credits >= amount) return true;
    const withinMonthly = usedThisPeriod + amount <= monthlyFreeLimit;
    return withinMonthly;
  }, [credits, monthlyFreeLimit, pro, usedThisPeriod]);

  const spend = useCallback(async (amount: number) => {
    await resetPeriodIfNeeded();
    if (!canSpend(amount)) return;
    if (pro) return;
    if (credits >= amount) {
      const nextCredits = Math.max(0, credits - amount);
      await setItem("lc/credits", String(nextCredits));
      setCreditsState(nextCredits);
      return;
    }
    const nextUsed = usedThisPeriod + amount;
    await setItem("lc/used", String(nextUsed));
    setUsed(nextUsed);
  }, [canSpend, credits, pro, resetPeriodIfNeeded, setItem, usedThisPeriod]);

  const earn = useCallback(async (amount: number) => {
    if (amount <= 0) return;
    const next = credits + amount;
    await setItem("lc/credits", String(next));
    setCreditsState(next);
  }, [credits, setItem]);

  const subscribe = useCallback(async () => {
    await setItem("lc/pro", "1");
    setPro(true);
  }, [setItem]);

  const unsubscribe = useCallback(async () => {
    await setItem("lc/pro", "0");
    setPro(false);
  }, [setItem]);

  const canWatchDailyAd = useCallback(() => {
    const today = dayKey(new Date());
    return dailyAdLast !== today;
  }, [dailyAdLast]);

  const markDailyAd = useCallback(async () => {
    const today = dayKey(new Date());
    await setItem("lc/dailyAdLast", today);
    setDailyAdLast(today);
  }, [setItem]);

  const hydrate = useCallback(async () => {
    try {
      const [storedCredits, storedPro, storedPeriod, storedUsed, storedDaily] = await Promise.all([
        getItem("lc/credits"),
        getItem("lc/pro"),
        getItem("lc/periodKey"),
        getItem("lc/used"),
        getItem("lc/dailyAdLast"),
      ]);
      if (storedCredits != null) setCreditsState(Number.parseInt(storedCredits, 10));
      setPro(storedPro === "1");
      const currentKey = monthKey(new Date());
      if (storedPeriod && storedPeriod === currentKey) {
        setPeriodKey(storedPeriod);
        if (storedUsed != null) setUsed(Number.parseInt(storedUsed, 10));
      } else {
        await setItem("lc/periodKey", currentKey);
        await setItem("lc/used", "0");
        setPeriodKey(currentKey);
        setUsed(0);
      }
      setDailyAdLast(storedDaily ?? null);
    } catch (e) {
      console.log("Failed to hydrate credits", e);
    }
  }, [getItem, setItem]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return useMemo(() => ({
    credits,
    pro,
    periodKey,
    usedThisPeriod,
    dailyAdLast,
    monthlyFreeLimit,
    canSpend,
    spend,
    earn,
    subscribe,
    unsubscribe,
    resetPeriodIfNeeded,
    canWatchDailyAd,
    markDailyAd,
  }), [credits, pro, periodKey, usedThisPeriod, dailyAdLast, monthlyFreeLimit, canSpend, spend, earn, subscribe, unsubscribe, resetPeriodIfNeeded, canWatchDailyAd, markDailyAd]);
});