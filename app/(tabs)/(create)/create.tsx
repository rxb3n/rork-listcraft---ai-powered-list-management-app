import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Keyboard, KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslations } from "@/hooks/use-localization";
import { useCreditsStore } from "@/providers/stores";
import { useLists } from "@/hooks/use-lists";
import { categories, Category, GenerationParams, NewListPayload } from "@/types/list";
import { Sparkles, Loader2, ShoppingBasket, Utensils, Hammer, Dumbbell, Sparkles as SparklesIcon, Info, Play, Wallet } from "lucide-react-native";
import { generateListWithAI } from "@/lib/ai";
import Colors from "@/constants/colors";
import { showInterstitial, showRewarded } from "@/lib/ads";
import { router } from "expo-router";

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const t = useTranslations();
  const { credits, spend: spendCredits, earn: earnCredits, canWatchDailyAd, markDailyAd, pro, canSpend } = useCreditsStore();
  const addListMutation = useLists().create;
  const [category, setCategory] = useState<Category>("groceries");
  const [description, setDescription] = useState<string>("");
  const [workoutBodyPart, setWorkoutBodyPart] = useState<"full body" | "arms" | "legs" | "back" | "chest" | "shoulders" | "abs" | "glutes">("full body");
  const [workoutMode, setWorkoutMode] = useState<"cardio" | "lifting" | "calisthenics">("lifting");
  const [intensity, setIntensity] = useState<"low" | "medium" | "high">("medium");
  const [people, setPeople] = useState<string>("2");
  const [budget, setBudget] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>("USD");
  const currencySymbol = useMemo<string>(() => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "JPY":
        return "¥";
      case "INR":
        return "₹";
      default:
        return "$";
    }
  }, [currency]);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  const categoryColors: Record<Category, string> = useMemo(() => ({
    groceries: "#10B981",
    recipe: "#F59E0B",
    building: "#3B82F6",
    workout: "#EF4444",
    custom: "#8B5CF6",
  }), []);

  const CategoryIcon = useCallback((c: Category) => {
    switch (c) {
      case "groceries":
        return <ShoppingBasket color="white" />;
      case "recipe":
        return <Utensils color="white" />;
      case "building":
        return <Hammer color="white" />;
      case "workout":
        return <Dumbbell color="white" />;
      case "custom":
        return <SparklesIcon color="white" />;
    }
  }, []);

  const canShowBudget = useMemo(() => category === "groceries", [category]);
  const canShowPeople = useMemo(
    () => category === "groceries" || category === "recipe",
    [category]
  );

  const dynamicPlaceholder = useMemo(() => {
    const key = `create.placeholders.${category}` as const;
    const p = t(key as unknown as any);
    const fallback = t("create.describePlaceholder");
    return p ?? fallback;
  }, [category, t]);

  const onGenerate = useCallback(async () => {
    if (loading) return;
    const needsDescription = category !== "groceries" && category !== "workout";
    if (needsDescription && !description.trim()) {
      console.log("Missing description");
      return;
    }
    if (!canSpend(1)) {
      try {
        router.push("/paywall");
      } catch (e) {
        console.log("Navigate to paywall failed", e);
      }
      return;
    }

    let success = false;
    try {
      setLoading(true);
      const params: GenerationParams = {
        category,
        description: (needsDescription ? description.trim() : ""),
        people: canShowPeople ? Number.parseInt(people || "2", 10) : undefined,
        budget: canShowBudget && budget ? budget : undefined,
        currency: category === "groceries" ? currency : undefined,
        workoutBodyPart: category === "workout" ? (workoutMode === "cardio" ? undefined : workoutBodyPart) : undefined,
        workoutMode: category === "workout" ? workoutMode : undefined,
        intensity: category === "workout" ? intensity : undefined,
      };
      const generated = await generateListWithAI(params);
      const payload: NewListPayload = {
        title: generated.title,
        category,
        items: generated.items,
      };
      await addListMutation.mutateAsync(payload);
      await spendCredits(1);
      setDescription("");
      success = true;
      console.log("List generated successfully");
      if (!pro) {
        try {
          await showInterstitial();
        } catch (e) {
          console.log("Interstitial failed", e);
        }
      }
      if (success) {
        try {
          router.navigate('/lists');
        } catch (e) {
          console.log('Navigation to lists failed', e);
        }
      }
    } catch (e) {
      console.error("AI generation failed", e);
    } finally {
      setLoading(false);
    }
  }, [
    addListMutation,
    budget,
    canShowBudget,
    canShowPeople,
    category,
    credits,
    description,
    earnCredits,
    loading,
    people,
    spendCredits,
    currency,
    workoutBodyPart,
    workoutMode,
    intensity,
    pro,
    canSpend,
  ]);



  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => {
      const h = (e as any)?.endCoordinates?.height ?? 0;
      setKeyboardHeight(h);
    });
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      showSub?.remove?.();
      hideSub?.remove?.();
    };
  }, []);

  const keyboardOffset = useMemo(() => (insets.top + 56), [insets.top]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardOffset}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: 64 + keyboardHeight }]}
          keyboardShouldPersistTaps="handled"
          scrollIndicatorInsets={{ bottom: keyboardHeight }}
        >
          <Text style={styles.heading} testID="create-title">
            {t("create.title")}
          </Text>

          <View style={styles.card} testID="create-card">
            <Text style={styles.label}>{t("create.category")}</Text>
            <View style={styles.cardsGrid}>
              {categories.map((c, idx) => {
                const active = c === category;
                const bg = categoryColors[c];
                const isLast = idx === categories.length - 1;
                return (
                  <TouchableOpacity
                    key={c}
                    testID={`category-${c}`}
                    style={[
                      styles.categoryCard,
                      isLast ? styles.categoryCardFull : styles.categoryCardHalf,
                      { backgroundColor: bg, borderWidth: active ? 2 : 0, borderColor: active ? "#FFFFFF" : "transparent" },
                    ]}
                    onPress={() => {
                      if (c && typeof c === "string" && c.trim().length > 0) {
                        setCategory(c);
                      }
                    }}
                    accessibilityRole="button"
                  >
                    <View style={styles.categoryIcon}>{CategoryIcon(c)}</View>
                    <Text style={styles.categoryTitle}>{t(`categories.${c}`)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {category !== "groceries" && category !== "workout" && (
              <>
                <Text style={styles.label}>{t("create.describe")}</Text>
                <TextInput
                  testID="description-input"
                  style={styles.input}
                  placeholder={dynamicPlaceholder}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
              </>
            )}

            {category === "workout" && (
              <View style={styles.workoutOptions}>
                <Text style={styles.label}>Workout Options</Text>
                {workoutMode !== "cardio" && (
                  <View style={styles.inline}>
                    <View style={styles.inlineItem}>
                      <Text style={styles.label}>Focus</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
                        {(["full body", "arms", "legs", "back", "chest", "shoulders", "abs", "glutes"] as const).map((bp) => {
                          const active = workoutBodyPart === bp;
                          return (
                            <TouchableOpacity
                              key={bp}
                              style={[styles.pill, active ? styles.pillActive : undefined]}
                              onPress={() => setWorkoutBodyPart(bp)}
                              testID={`workout-bp-${bp}`}
                            >
                              <Text style={[styles.pillText, active ? styles.pillTextActive : undefined]}>{bp}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  </View>
                )}

                <View style={styles.inline}>
                  <View style={styles.inlineItem}>
                    <Text style={styles.label}>Type</Text>
                    <View style={styles.pillsRow}>
                      {(["cardio", "lifting", "calisthenics"] as const).map((m) => {
                        const active = workoutMode === m;
                        return (
                          <TouchableOpacity key={m} style={[styles.pill, active ? styles.pillActive : undefined]} onPress={() => setWorkoutMode(m)} testID={`workout-mode-${m}`}>
                            <Text style={[styles.pillText, active ? styles.pillTextActive : undefined]}>{m}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.inlineItem}>
                    <Text style={styles.label}>Intensity</Text>
                    <View style={styles.pillsRow}>
                      {(["low", "medium", "high"] as const).map((lvl) => {
                        const active = intensity === lvl;
                        return (
                          <TouchableOpacity key={lvl} style={[styles.pill, active ? styles.pillActive : undefined]} onPress={() => setIntensity(lvl)} testID={`intensity-${lvl}`}>
                            <Text style={[styles.pillText, active ? styles.pillTextActive : undefined]}>{lvl}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {canShowPeople && (
              <View style={styles.inline}>
                <View style={styles.inlineItem}>
                  <Text style={styles.label}>{t("create.people")}</Text>
                  <TextInput
                    testID="people-input"
                    style={styles.input}
                    keyboardType="number-pad"
                    value={people}
                    onChangeText={setPeople}
                  />
                </View>
                {canShowBudget && (
                  <View style={styles.inlineItem}>
                    <Text style={styles.label}>{t("create.budget")}</Text>
                    <TextInput
                      testID="budget-input"
                      style={styles.input}
                      placeholder={`${currencySymbol}50`}
                      value={budget}
                      onChangeText={setBudget}
                    />
                  </View>
                )}
              </View>
            )}

            {category === "groceries" && (
              <View style={styles.inline}>
                <View style={styles.inlineItem}>
                  <Text style={styles.label}>Currency</Text>
                  <View style={styles.currencyRow}>
                    {(["USD", "EUR", "GBP", "JPY", "INR"] as const).map((c) => {
                      const active = currency === c;
                      return (
                        <TouchableOpacity
                          key={c}
                          testID={`currency-${c}`}
                          style={[styles.currencyPill, active ? styles.currencyPillActive : undefined]}
                          onPress={() => setCurrency(c)}
                          accessibilityRole="button"
                        >
                          <Text style={[styles.currencyText, active ? styles.currencyTextActive : undefined]}>{c}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            <View style={styles.buttonsRow}>
              <TouchableOpacity
                testID="generate-ai-button"
                style={[styles.button, styles.primaryButton, loading ? styles.buttonDisabled : undefined]}
                onPress={onGenerate}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 color="white" />
                ) : (
                  <Sparkles color="white" />
                )}
                <Text style={styles.buttonText}>Generate</Text>
              </TouchableOpacity>

              
            </View>

            {credits <= 0 ? (
              <View style={styles.helperWarn}>
                <Info color="#0F172A" />
                <Text style={styles.helperWarnText}>{t("credits.outBody")}</Text>
                {canWatchDailyAd() ? (
                  <TouchableOpacity
                    style={[styles.helperCTA, { backgroundColor: "#10B981" }]}
                    onPress={async () => {
                      try {
                        const ok = await showRewarded();
                        if (ok) {
                          await earnCredits(1);
                          await markDailyAd();
                        }
                      } catch (e) {
                        console.log("Rewarded ad failed", e);
                      }
                    }}
                    testID="watch-ad-cta"
                  >
                    <Play color="white" />
                    <Text style={styles.helperCTAText}>{t("credits.watchAd")}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.helperCTA}
                    onPress={() => router.push("/paywall")}
                    testID="get-credits-cta"
                  >
                    <Wallet color="white" />
                    <Text style={styles.helperCTAText}>{t("credits.getMore")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const fontWeightBold = "700" as const;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: fontWeightBold,
    color: "white",
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: "#475569",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  categoryCard: {
    aspectRatio: 2,
    borderRadius: 14,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryCardHalf: {
    width: "48%",
  },
  categoryCardFull: {
    width: "100%",
    aspectRatio: 4.2,
  },
  categoryIcon: { width: 28, height: 28, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  categoryTitle: { color: "white", fontWeight: fontWeightBold, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    backgroundColor: "white",
  },
  inline: {
    flexDirection: "row",
    gap: 12,
  },
  inlineItem: {
    flex: 1,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  secondaryButton: {
    backgroundColor: "#F1F5F9",
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontWeight: fontWeightBold,
  },
  secondaryButtonText: {
    color: Colors.light.tint,
  },
  helperWarn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FDE68A",
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  helperWarnText: {
    color: "#0F172A",
    flex: 1,
  },
  helperCTA: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  helperCTAText: { color: "white", fontWeight: fontWeightBold },
  currencyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  currencyPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "white",
  },
  currencyPillActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  currencyText: {
    color: "#0F172A",
    fontWeight: fontWeightBold,
  },
  currencyTextActive: {
    color: "white",
  },
  workoutOptions: {
    gap: 12,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "white",
  },
  pillActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  pillText: {
    color: "#0F172A",
    fontWeight: fontWeightBold,
    textTransform: "capitalize",
  },
  pillTextActive: {
    color: "white",
  },
});