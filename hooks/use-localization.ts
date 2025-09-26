import { useLocalizationStore } from "./use-stores";
import { getTranslator } from "@/constants/translations";

export function useTranslations() {
  const language = useLocalizationStore((s) => s.language);
  return getTranslator(language);
}