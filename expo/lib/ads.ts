import { Platform } from "react-native";

export async function showInterstitial(): Promise<void> {
  if (Platform.OS === "web") {
    console.log("[Ads] Interstitial simulated on web");
    await new Promise((r) => setTimeout(r, 1200));
    return;
  }
  console.log("[Ads] Interstitial placeholder (integrate AdMob in production build)");
  await new Promise((r) => setTimeout(r, 1200));
}

export async function showRewarded(): Promise<boolean> {
  if (Platform.OS === "web") {
    console.log("[Ads] Rewarded simulated on web: success");
    await new Promise((r) => setTimeout(r, 1500));
    return true;
  }
  console.log("[Ads] Rewarded placeholder (integrate AdMob in production build)");
  await new Promise((r) => setTimeout(r, 1500));
  return true;
}
