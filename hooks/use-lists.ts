import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createList, deleteList, getAllLists, toggleListItem, updateList } from "@/lib/trpc";
import { List, NewListPayload, UpdateListPayload } from "@/types/list";

export function useLists() {
  const qc = useQueryClient();

  const all = useQuery<List[]>({
    queryKey: ["lists", "all"],
    queryFn: getAllLists,
  });

  const create = useMutation({
    mutationKey: ["lists", "create"],
    mutationFn: async (payload: NewListPayload) => {
      const created = await createList(payload);
      return created;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lists", "all"] });
    },
  });

  const update = useMutation({
    mutationKey: ["lists", "update"],
    mutationFn: async (payload: UpdateListPayload) => {
      const updated = await updateList(payload);
      return updated;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lists", "all"] });
    },
  });

  const remove = useMutation({
    mutationKey: ["lists", "remove"],
    mutationFn: async ({ id }: { id: string }) => {
      await deleteList(id);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lists", "all"] });
    },
  });

  const toggleItem = useMutation({
    mutationKey: ["lists", "toggleItem"],
    mutationFn: async ({ listId, itemId }: { listId: string; itemId: string }) => {
      return toggleListItem(listId, itemId);
    },
    onMutate: async ({ listId, itemId }) => {
      await qc.cancelQueries({ queryKey: ["lists", "all"] });
      const prev = qc.getQueryData<List[]>(["lists", "all"]);
      if (prev) {
        const optimistic = prev.map((l) =>
          l.id === listId
            ? { ...l, items: l.items.map((it) => (it.id === itemId ? { ...it, completed: !it.completed } : it)) }
            : l
        );
        qc.setQueryData(["lists", "all"], optimistic);
      }
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(["lists", "all"], ctx.prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["lists", "all"] });
    },
  });

  return { all, create, update, remove, toggleItem };
}