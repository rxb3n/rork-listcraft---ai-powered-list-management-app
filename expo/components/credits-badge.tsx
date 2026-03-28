import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Coins } from "lucide-react-native";
import { useCreditsStore } from "@/hooks/use-stores";

export function CreditsBadge() {
  const credits = useCreditsStore((s) => s.credits);
  const color = useMemo(() => (credits > 0 ? "#10B981" : "#EF4444"), [credits]);

  return (
    <View style={styles.wrap} testID="credits-badge">
      <Coins color={color} />
      <Text style={[styles.text, { color }]}>{credits}</Text>
    </View>
  );
}

const fontWeightBold = "700" as const;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
  },
  text: {
    fontWeight: fontWeightBold,
    fontSize: 16,
  },
});