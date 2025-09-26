import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCreditsStore } from "@/providers/stores";
import { Check, Crown, X } from "lucide-react-native";

export default function PaywallScreen() {
  const { subscribe, pro } = useCreditsStore();

  const price = useMemo(() => "$4.99/mo", []);

  const onSubscribe = useCallback(async () => {
    await subscribe();
    router.back();
  }, [subscribe]);

  return (
    <View style={styles.container} testID="paywall-screen">
      <View style={styles.card}>
        <View style={styles.header}>
          <Crown color="#fff" />
          <Text style={styles.title}>ListCraft Pro</Text>
          <Text style={styles.subtitle}>{price}</Text>
        </View>

        <View style={styles.features}>
          {[
            "Unlimited AI generations",
            "No monthly credit cap",
            "Priority AI quality",
            "Remove ads",
          ].map((f) => (
            <View key={f} style={styles.featureRow}>
              <Check color="#10B981" />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primary]}
          onPress={onSubscribe}
          disabled={pro}
          testID="subscribe-button"
        >
          <Text style={styles.buttonText}>{pro ? "Active" : "Start Pro"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.secondary]} onPress={() => router.back()} testID="close-paywall">
          <X color="#0F172A" />
          <Text style={[styles.buttonText, styles.secondaryText]}>Not now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const fontWeightBold = "700" as const;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A", alignItems: "center", justifyContent: "center", padding: 16 },
  card: { backgroundColor: "white", borderRadius: 20, width: "100%", maxWidth: 520, padding: 20, gap: 16 },
  header: { backgroundColor: "#8B5CF6", borderRadius: 16, padding: 16, alignItems: "center", gap: 8 },
  title: { color: "white", fontSize: 20, fontWeight: fontWeightBold },
  subtitle: { color: "white", opacity: 0.9 },
  features: { gap: 12 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { color: "#0F172A" },
  button: { height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primary: { backgroundColor: "#10B981" },
  secondary: { backgroundColor: "#E2E8F0" },
  buttonText: { color: "white", fontWeight: fontWeightBold },
  secondaryText: { color: "#0F172A" },
});
