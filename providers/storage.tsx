import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const validateKey = (key: string): boolean => {
  return Boolean(key && typeof key === "string" && key.trim().length > 0);
};

const validateValue = (value: string): boolean => {
  return Boolean(value && typeof value === "string");
};

export const [StorageProvider, useStorage] = createContextHook(() => {
  const getItem = useCallback(async (key: string): Promise<string | null> => {
    if (!validateKey(key)) return null;
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error("Storage getItem error", e);
      return null;
    }
  }, []);

  const setItem = useCallback(async (key: string, value: string): Promise<void> => {
    if (!validateKey(key) || !validateValue(value)) return;
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error("Storage setItem error", e);
    }
  }, []);

  const removeItem = useCallback(async (key: string): Promise<void> => {
    if (!validateKey(key)) return;
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error("Storage removeItem error", e);
    }
  }, []);

  return useMemo(() => ({ getItem, setItem, removeItem }), [getItem, setItem, removeItem]);
});