import React, { useMemo } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Languages } from "lucide-react-native";
import { useLocalizationStore } from "@/hooks/use-stores";
import { supportedLanguages } from "@/constants/translations";

export function LanguageSelector() {
  const lang = useLocalizationStore((s) => s.language);
  const setLang = useLocalizationStore((s) => s.setLanguage);

  const next = useMemo(() => {
    const order = supportedLanguages;
    const idx = order.indexOf(lang);
    return order[(idx + 1) % order.length];
  }, [lang]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setLang(next)}
      testID="language-selector"
      accessibilityRole="button"
      accessibilityLabel="Change Language"
    >
      <Languages color={Platform.OS === "ios" ? "black" : "#0F172A"} />
      <View style={styles.labelWrap}>
        <Text style={styles.label}>{lang.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const fontWeightBold = "700" as const;

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
  labelWrap: {
    marginLeft: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  label: { fontWeight: fontWeightBold, color: "#0F172A", fontSize: 12 },
});