import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLists } from "@/hooks/use-lists";
import { useTranslations } from "@/hooks/use-localization";
import { ListCard } from "@/components/list-card";
import { ClipboardCopy, Filter, Plus } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { List } from "@/types/list";

export default function ListsScreen() {
  const insets = useSafeAreaInsets();
  const t = useTranslations();
  const { data, isLoading, refetch } = useLists().all;
  const [search, setSearch] = useState<string>("");

  const lists = useMemo(() => {
    const src = data ?? [];
    if (!search.trim()) return src;
    const q = search.trim().toLowerCase();
    return src.filter((l) => l.title.toLowerCase().includes(q));
  }, [data, search]);

  const copyAll = useCallback(async () => {
    try {
      const text = (data ?? [])
        .map((l) => {
          const header = `• ${l.title} (${l.category})`;
          const items = l.items.map((it) => `  - [${it.completed ? "x" : " "}] ${it.title}${it.quantity ? ` x${it.quantity}` : ""}`).join("\n");
          return `${header}\n${items}`;
        })
        .join("\n\n");
      if (Platform.OS === "web") {
        await navigator.clipboard.writeText(text);
      } else {
        await Clipboard.setStringAsync(text);
      }
      console.log("Lists copied to clipboard");
    } catch (e) {
      console.error("Copy failed", e);
    }
  }, [data]);

  const renderItem = useCallback(({ item }: { item: List }) => {
    return <ListCard key={item.id} list={item} />;
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>{t("lists.title")}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={copyAll} testID="copy-all">
            <ClipboardCopy color="#334155" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSearch("");
              refetch();
            }}
            testID="refresh-lists"
          >
            <Plus color="#334155" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}} testID="filter">
            <Filter color="#334155" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder={t("lists.searchPlaceholder")}
          value={search}
          onChangeText={setSearch}
          testID="search-input"
        />
      </View>

      <FlatList
        data={lists}
        keyExtractor={(l) => l.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t("lists.empty")}</Text>
          </View>
        }
        testID="lists-flatlist"
      />
    </View>
  );
}

const fontWeightBold = "700" as const;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: fontWeightBold,
    color: "white",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  search: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  empty: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#CBD5E1",
  },
});