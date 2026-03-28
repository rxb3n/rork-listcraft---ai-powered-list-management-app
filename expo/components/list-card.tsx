import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { CheckCircle2, ChevronDown, ChevronUp, Edit3, Trash2, Copy } from "lucide-react-native";
import { List, ListItem } from "@/types/list";
import { useLists } from "@/hooks/use-lists";
import Colors from "@/constants/colors";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function ListCard({ list }: { list: List }) {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(list.title);
  const { update, remove, toggleItem } = useLists();

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((e) => !e);
  }, []);

  const onSaveTitle = useCallback(async () => {
    try {
      await update.mutateAsync({ id: list.id, title });
      setIsEditingTitle(false);
    } catch (e) {
      console.error("Update title failed", e);
      Alert.alert("Error", "Failed to update title");
    }
  }, [list.id, title, update]);

  const onDelete = useCallback(() => {
    Alert.alert("Delete", "Are you sure you want to delete this list?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => remove.mutate({ id: list.id }),
      },
    ]);
  }, [list.id, remove]);

  const remainingCount = useMemo(
    () => list.items.filter((i) => !i.completed).length,
    [list.items]
  );

  return (
    <View style={styles.card} testID={`list-card-${list.id}`}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={toggleExpand} testID="expand-toggle">
            {expanded ? <ChevronUp color="#334155" /> : <ChevronDown color="#334155" />}
          </TouchableOpacity>
          {isEditingTitle ? (
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              onSubmitEditing={onSaveTitle}
              onBlur={onSaveTitle}
              autoFocus
              testID="title-input"
            />
          ) : (
            <Text style={styles.title} numberOfLines={1}>
              {list.title}
            </Text>
          )}
          <TouchableOpacity
            onPress={async () => {
              try {
                const text = list.items.map((i) => `• ${i.title}${i.quantity ? ` x${i.quantity}` : ""}${i.note ? ` — ${i.note}` : ""}`).join("\n");
                console.log("Copying list to clipboard", { id: list.id, items: list.items.length });
                if (Platform.OS === "web") {
                  await navigator.clipboard.writeText(text);
                } else {
                  const Clipboard = await import("expo-clipboard");
                  await Clipboard.setStringAsync(text);
                }
              } catch (e) {
                console.error("Copy failed", e);
                Alert.alert("Copy failed", "Couldn't copy the list. Please try again.");
              }
            }}
            accessibilityRole="button"
            testID="copy-list"
            style={styles.copyButton}
          >
            <Copy color="#334155" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setIsEditingTitle((v) => !v)} testID="edit-title">
            <Edit3 color={Colors.light.tint} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} testID="delete-list">
            <Trash2 color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {expanded && (
        <View style={styles.items}>
          {list.items.length === 0 ? (
            <Text style={styles.empty}>No items yet</Text>
          ) : (
            list.items.map((it) => (
              <ItemRow
                key={it.id}
                item={it}
                onToggle={() => toggleItem.mutate({ listId: list.id, itemId: it.id })}
              />
            ))
          )}
        </View>
      )}
    </View>
  );
}

function ItemRow({ item, onToggle }: { item: ListItem; onToggle: () => void }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={styles.itemRow}
      testID={`item-${item.id}`}
      accessibilityRole="button"
    >
      <CheckCircle2 color={item.completed ? "#10B981" : "#CBD5E1"} />
      <View style={styles.itemBody}>
        <Text style={[styles.itemTitle, item.completed ? styles.itemCompleted : undefined]}>
          {item.title}
          {item.quantity ? ` x${item.quantity}` : ""}
        </Text>
        {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const fontWeightBold = "700" as const;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    gap: 8,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  title: { fontSize: 18, fontWeight: fontWeightBold, color: "#0F172A", flex: 1 },
  titleInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  copyButton: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  items: { gap: 8 },
  empty: { color: "#64748b" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  itemBody: { flex: 1 },
  itemTitle: { color: "#0F172A" },
  itemNote: { color: "#64748b", fontSize: 12 },
  itemCompleted: { textDecorationLine: "line-through", color: "#64748b" },
});