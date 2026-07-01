"use client";

import { useState } from "react";
import Link from "next/link";
import { useConversations } from "@/hooks/useConversations";
import { MessageBubble } from "@/components/terminal/MessageBubble";
import type { Conversation } from "@/lib/client/conversationsDb";

/**
 * 本地历史页（终端风）
 *
 * 数据完全在 IndexedDB，不走服务端。每条记录 = 一场 prompt + reply 对线。
 * 支持：展开/折叠完整对话、单条删除、清空全部。
 */
export default function HistoryPage() {
  const { conversations, loading, remove, clearAll } = useConversations();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <main className="flex-1 overflow-y-auto px-6 py-10 max-w-3xl mx-auto w-full">
      <div className="text-[10px] text-[#008f00] mb-3 select-none">
        <span className="text-[#00ff41]">cat</span> ~/conversations.log
      </div>

      <h1 className="text-xl sm:text-2xl text-[#00ff41] font-bold tracking-wide mb-2">
        {"# troll history"}
      </h1>
      <p className="text-xs text-[#008f00] mb-8">
        {"// stored locally in your browser (IndexedDB). never sent to the server."}
      </p>

      {loading ? (
        <div className="text-xs text-[#008f00] animate-pulse">
          {"// loading..."}
        </div>
      ) : conversations.length === 0 ? (
        <div className="border border-[#008f00] p-6 text-center">
          <p className="text-sm text-[#00ff41] mb-2">
            {"// no conversations yet."}
          </p>
          <p className="text-xs text-[#008f00] mb-4">
            {"// go play a round first."}
          </p>
          <Link
            href="/play?role=human"
            className="text-xs text-[#00ccff] hover:text-[#00ff41] transition-colors"
          >
            {"$ cd /play ↵"}
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-[#008f00]">
              {`// ${conversations.length} conversation${conversations.length === 1 ? "" : "s"}`}
            </span>
            {confirmClear ? (
              <span className="flex items-center gap-2 text-[10px]">
                <span className="text-[#ff0033]">{"// sure?"}</span>
                <button
                  type="button"
                  onClick={async () => {
                    await clearAll();
                    setConfirmClear(false);
                  }}
                  className="text-[#ff0033] hover:underline"
                >
                  yes, wipe
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="text-[#008f00] hover:text-[#00ff41]"
                >
                  cancel
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="text-[10px] text-[#008f00] hover:text-[#ff0033] transition-colors"
              >
                ✕ clear all
              </button>
            )}
          </div>

          <ul className="space-y-3">
            {conversations.map((c) => (
              <ConversationRow
                key={c.id}
                conv={c}
                expanded={expandedId === c.id}
                onToggle={() =>
                  setExpandedId((cur) => (cur === c.id ? null : c.id))
                }
                onDelete={async () => {
                  await remove(c.id);
                  if (expandedId === c.id) setExpandedId(null);
                }}
              />
            ))}
          </ul>
        </>
      )}

      <div className="mt-10">
        <Link
          href="/"
          className="text-xs text-[#00ccff] hover:text-[#00ff41] transition-colors"
        >
          {"$ cd ~/  ← back home"}
        </Link>
      </div>
    </main>
  );
}

function ConversationRow({
  conv,
  expanded,
  onToggle,
  onDelete,
}: {
  conv: Conversation;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const date = new Date(conv.createdAt);
  const timeStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const roleColor = conv.role === "human" ? "#00ff41" : "#00ccff";
  const promptExcerpt = truncate(conv.prompt, 80);
  const replyExcerpt = truncate(conv.reply, 80);

  return (
    <li className="border border-[#008f00] bg-black">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#008f00]/60 text-[10px]">
        <span className="text-[#008f00] tabular-nums">
          {`[${timeStr}] `}
          <span style={{ color: roleColor }}>{`role: ${conv.role}`}</span>
        </span>
        <span className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggle}
            className="text-[#008f00] hover:text-[#00ff41] transition-colors"
          >
            {expanded ? "[-] collapse" : "[+] expand"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-[#008f00] hover:text-[#ff0033] transition-colors"
          >
            ✕ del
          </button>
        </span>
      </div>

      {!expanded ? (
        <div className="px-3 py-2 text-xs space-y-1">
          <div className="text-[#00ff41] truncate">
            <span className="text-[#008f00]">{"Q: "}</span>
            {promptExcerpt}
          </div>
          <div className="text-[#00ccff] truncate">
            <span className="text-[#008f00]">{"A: "}</span>
            {replyExcerpt}
          </div>
        </div>
      ) : (
        <div className="px-3 py-2">
          <MessageBubble
            msg={{ id: `${conv.id}-q`, role: "human", text: conv.prompt }}
          />
          <MessageBubble
            msg={{ id: `${conv.id}-a`, role: "copilot", text: conv.reply }}
          />
        </div>
      )}
    </li>
  );
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function truncate(s: string, n: number): string {
  const flat = s.replace(/\s+/g, " ").trim();
  return flat.length > n ? `${flat.slice(0, n)}...` : flat;
}
