import { useEffect } from "react";
import { useLocalizationStore, useCreditsStore } from "./use-stores";
import { initializeStorage } from "@/lib/storage";

export function useAppBootstrap() {
  const hydrateLang = useLocalizationStore((s) => s.hydrate);
  const hydrateCredits = useCreditsStore((s) => s.hydrate);

  useEffect(() => {
    initializeStorage().then(() => {
      hydrateLang();
      hydrateCredits();
    });
  }, [hydrateCredits, hydrateLang]);
}