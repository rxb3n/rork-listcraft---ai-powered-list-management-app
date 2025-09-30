import AsyncStorage from "@react-native-async-storage/async-storage";

export async function initializeStorage(): Promise<void> {
  try {
    const hasLists = await AsyncStorage.getItem("lc/lists");
    if (hasLists == null) {
      await AsyncStorage.setItem("lc/lists", JSON.stringify([]));
    }
    const hasCredits = await AsyncStorage.getItem("lc/credits");
    if (hasCredits == null) {
      await AsyncStorage.setItem("lc/credits", String(5));
    }
  } catch (e) {
    console.log("initializeStorage error", e);
  }
}