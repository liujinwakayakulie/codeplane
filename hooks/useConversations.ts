"use client";

import { useCallback, useEffect, useState } from "react";
import type { Conversation } from "@/lib/client/conversationsDb";
import {
  addConversation,
  clearAllConversations,
  deleteConversation,
  listConversations,
} from "@/lib/client/conversationsDb";

/**
 * 历史对话订阅 hook
 *
 * mount 时加载 conversations 列表，提供 add/remove/clearAll 操作并自动刷新。
 * add 的入参跟 conversationsDb.addConversation 一致（去 id/createdAt）。
 */
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const list = await listConversations({ limit: 200 });
      setConversations(list);
    } catch (e) {
      console.error("[useConversations] list failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (input: Omit<Conversation, "id" | "createdAt">) => {
      const conv = await addConversation(input);
      setConversations((prev) => [conv, ...prev]);
      return conv;
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    await deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(async () => {
    await clearAllConversations();
    setConversations([]);
  }, []);

  return { conversations, loading, refresh, add, remove, clearAll };
}
