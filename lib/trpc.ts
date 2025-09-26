import AsyncStorage from "@react-native-async-storage/async-storage";
import { List, ListItem, NewListPayload, UpdateListPayload } from "@/types/list";

const STORAGE_KEY = "lc/lists";

export async function getAllLists(): Promise<List[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as List[];
    return parsed;
  } catch (e) {
    console.log("getAllLists error", e);
    return [];
  }
}

export async function createList(payload: NewListPayload): Promise<List> {
  const all = await getAllLists();
  const now = Date.now();
  const list: List = {
    id: `list_${now}_${Math.random().toString(36).slice(2, 8)}`,
    title: payload.title,
    category: payload.category,
    createdAt: now,
    items:
      payload.items?.map((it, idx) => ({
        id: `item_${now}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
        title: it.title,
        quantity: it.quantity,
        note: it.note,
        completed: false,
      })) ?? [],
  };
  const next = [list, ...all];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return list;
}

export async function updateList(payload: UpdateListPayload): Promise<List> {
  const all = await getAllLists();
  const idx = all.findIndex((l) => l.id === payload.id);
  if (idx === -1) throw new Error("List not found");
  const updated: List = {
    ...all[idx],
    title: payload.title ?? all[idx].title,
    items: payload.items ?? all[idx].items,
  };
  const next = [...all];
  next[idx] = updated;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return updated;
}

export async function deleteList(id: string): Promise<void> {
  const all = await getAllLists();
  const next = all.filter((l) => l.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function toggleListItem(listId: string, itemId: string): Promise<void> {
  const all = await getAllLists();
  const idx = all.findIndex((l) => l.id === listId);
  if (idx === -1) return;
  const list = all[idx];
  const items = list.items.map((it) =>
    it.id === itemId ? { ...it, completed: !it.completed } : it
  );
  const updated = { ...list, items };
  const next = [...all];
  next[idx] = updated;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}