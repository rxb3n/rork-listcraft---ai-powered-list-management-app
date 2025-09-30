import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCreditsStore } from "@/providers/stores";
import { Check, Crown, X, Gift, Package } from "lucide-react-native";
import purchases from "@/lib/purchases";


type CreditPack = {
  id: string;
  credits: number;
  price: string;
  subtitle: string;
  highlight?: boolean;
};

const DEFAULT_PACKS: CreditPack[] = [
  { id: "10_credits", credits: 10, price: "€2.99", subtitle: "Starter • ~€0.30/credit" },
  { id: "25_credits", credits: 25, price: "€5.99", subtitle: "Great value • ~€0.24/credit", highlight: true },
  { id: "50_credits", credits: 50, price: "€9.99", subtitle: "Power • ~€0.20/credit" },
];

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const { subscribe, pro, earn } = useCreditsStore();

  const [monthlyPrice, setMonthlyPrice] = useState<string>("$4.99/mo");
  const [packs, setPacks] = useState<CreditPack[]>(DEFAULT_PACKS);
  const isStoreAvailable = purchases.isAvailable;

  useEffect(() => {
    const key = process.env.EXPO_PUBLIC_REVENUECAT_KEY ?? "";
    if (key) {
      void purchases.configure(key);
    }
    let mounted = true;
    const load = async () => {
      try {
        const offerings = await purchases.getOfferings();
        const current = offerings.current;
        if (!current) return;
        const monthly = current.availablePackages.find(p => p.identifier === "monthly");
        if (monthly && mounted) {
          setMonthlyPrice(`${monthly.product.priceString}/mo`);
        }
        const mapPack = (id: string, credits: number, highlight?: boolean): CreditPack | null => {
          const pkg = current.availablePackages.find(p => p.identifier === id);
          return pkg ? { id, credits, price: pkg.product.priceString, subtitle: DEFAULT_PACKS.find(d => d.id === id)?.subtitle ?? "", highlight } : null;
        };
        const maybePacks: (CreditPack | null)[] = [
          mapPack("10_credits", 10),
          mapPack("25_credits", 25, true),
          mapPack("50_credits", 50),
        ];
        const resolved = maybePacks.filter((p): p is CreditPack => !!p);
        if (resolved.length && mounted) setPacks(resolved);
      } catch (e) {
        console.log("Failed to load offerings", e);
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const onSubscribe = useCallback(async () => {
    try {
      if (isStoreAvailable) {
        const res = await purchases.purchasePackage("monthly");
        if (res.success) {
          await subscribe();
        }
      } else {
        await subscribe();
      }
      router.back();
    } catch (e) {
      console.log("Subscribe failed", e);
    }
  }, [isStoreAvailable, subscribe]);

  const onBuyPack = useCallback(async (pack: CreditPack) => {
    try {
      if (isStoreAvailable) {
        const res = await purchases.purchasePackage(pack.id);
        if (res.success) {
          await earn(pack.credits);
        }
      } else {
        await earn(pack.credits);
      }
      router.back();
    } catch (e) {
      console.log("Purchase failed", e);
    }
  }, [earn, isStoreAvailable]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} testID="paywall-screen">
      <View style={styles.card}>
        <View style={styles.header}>
          <Crown color="#fff" />
          <Text style={styles.title}>ListCraft Pro</Text>
          <Text style={styles.subtitle}>{monthlyPrice}</Text>
        </View>

        {!isStoreAvailable ? (
          <Text style={styles.note} testID="store-note">In-app purchases unavailable in Expo Go. Using mock prices.</Text>
        ) : null}

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

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Or buy credits</Text>
        <View style={styles.packsRow}>
          {packs.map((p) => (
            <View
              key={p.id}
              style={[styles.packCard, p.highlight ? styles.packHighlight : undefined]}
              testID={`pack-${p.id}`}
            >
              <View style={styles.packIcon}>{p.highlight ? <Gift color="#8B5CF6" /> : <Package color="#64748b" />}</View>
              <Text style={styles.packTitle}>{p.credits} credits</Text>
              <Text style={styles.packSubtitle}>{p.subtitle}</Text>
              <TouchableOpacity
                style={[styles.button, styles.packButton]}
                onPress={() => {
                  const id = String(p?.id ?? "");
                  if (!id.trim()) return;
                  onBuyPack(p);
                }}
                testID={`buy-${p.id}`}
              >
                <Text style={styles.packButtonText}>{p.price}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

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
  note: { color: "#475569", textAlign: "center" },
  features: { gap: 12 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { color: "#0F172A" },
  button: { height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primary: { backgroundColor: "#10B981" },
  secondary: { backgroundColor: "#E2E8F0" },
  buttonText: { color: "white", fontWeight: fontWeightBold },
  secondaryText: { color: "#0F172A" },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 4 },
  sectionTitle: { color: "#334155", fontWeight: fontWeightBold },
  packsRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  packCard: { flexBasis: "48%", backgroundColor: "#F8FAFC", borderRadius: 12, padding: 12, gap: 6 },
  packHighlight: { borderWidth: 2, borderColor: "#8B5CF6", backgroundColor: "#F5F3FF" },
  packIcon: { width: 24, height: 24 },
  packTitle: { color: "#0F172A", fontWeight: fontWeightBold },
  packSubtitle: { color: "#64748b", fontSize: 12 },
  packButton: { backgroundColor: "#0F172A" },
  packButtonText: { color: "white", fontWeight: fontWeightBold },
});
