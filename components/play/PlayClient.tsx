"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveMatch } from "@/hooks/useLiveMatch";
import { useEnergy } from "@/hooks/useEnergy";
import { TerminalChat } from "@/components/terminal/TerminalChat";
import { CopilotStation } from "@/components/copilot/CopilotStation";
import { BatteryBar } from "@/components/energy/BatteryBar";
import { DeviceBadges } from "@/components/energy/DeviceBadges";
import { UltimateSkillMenu } from "@/components/energy/UltimateSkillMenu";
import { ScreenShutdown } from "@/components/effects/ScreenShutdown";
import { BlueScreen } from "@/components/effects/BlueScreen";
import { CodeRainCollapse } from "@/components/effects/CodeRainCollapse";
import { CPUMelt } from "@/components/effects/CPUMelt";
import {
  ScreenshotExport,
  type ScreenshotExportHandle,
} from "@/components/share/ScreenshotExport";
import { SelectActionBar } from "@/components/share/SelectActionBar";
import { ModelSelector } from "@/components/ide/ModelSelector";
import { DEFAULT_MODEL_ID } from "@/lib/models";
import { SITE_USER } from "@/lib/site";
import type { SkillId } from "@/lib/skills";

/**
 * /play 的客户端容器
 *
 * - viewRole 决定渲染 TerminalChat（human）还是 CopilotStation（copilot）
 * - useLiveMatch 维护 SSE 连接 + 两个视角的状态
 * - 电量：human 发问 -1，copilot 答完 +1；human 电量 0 强行发问 → 关机
 * - 多选分享仅 human 视角可用（copilot 视角没有消息列表）
 * - 大招/特效两个视角共用
 */
export function PlayClient({ role: initialRole }: { role: "human" | "copilot" }) {
  const router = useRouter();
  const [viewRole, setViewRole] = useState<"human" | "copilot">(initialRole);
  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_ID);

  const live = useLiveMatch();
  const {
    messages,
    sendPrompt,
    markTypingDone,
    copilotState,
    currentPrompt,
    countdown,
    answeredCount,
    startWaiting,
    cancelWaiting,
    accept,
    skip,
    reply,
    connected,
  } = live;

  const energy = useEnergy();
  const [shutdown, setShutdown] = useState(false);
  const [activeEffect, setActiveEffect] = useState<SkillId | null>(null);

  // 多选分享（仅 human 视角用）
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<ScreenshotExportHandle>(null);

  const handleShutdownDone = () => {
    energy.reset();
    router.replace("/");
  };

  // —— human 发问：电量结算 ——
  const handleHumanSend = (text: string) => {
    if (energy.willShutdown) {
      setShutdown(true);
      return;
    }
    energy.discharge();
    void sendPrompt(text);
  };

  // —— copilot 答完：电量结算 ——
  const handleCopilotReply = async (text: string) => {
    energy.charge();
    await reply(text);
  };

  const triggerEffect = (skill: SkillId) => {
    if (!energy.canUltimate) return;
    energy.useUltimate();
    setActiveEffect(skill);
  };

  const handleEffectDone = () => setActiveEffect(null);

  const lowBat =
    viewRole === "human" &&
    energy.currentBatteryPercent > 0 &&
    energy.currentBatteryPercent <= 20;

  const switchRole = () => {
    setViewRole((v) => (v === "human" ? "copilot" : "human"));
  };

  // —— 多选分享：进入/退出/切换/导出 ——
  const selectableMessages = useMemo(
    () => messages.filter((m) => !m.thinking),
    [messages]
  );

  const enterSelectMode = () => {
    setSelectedIds(new Set(selectableMessages.map((m) => m.id)));
    setSelectMode(true);
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () =>
    setSelectedIds(new Set(selectableMessages.map((m) => m.id)));
  const selectNone = () => setSelectedIds(new Set());

  const handleExport = async () => {
    if (exporting) return;
    const picked = messages.filter((m) => selectedIds.has(m.id));
    setExporting(true);
    try {
      await exportRef.current?.exportMessages(picked);
      exitSelectMode();
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="flex flex-col flex-1 min-h-0 px-4 py-3 max-w-4xl mx-auto w-full">
      <header className="border-b border-[#008f00] pb-2 mb-2 shrink-0">
        <div className="flex justify-between items-center text-xs sm:text-sm mb-2 gap-2">
          <span>
            {SITE_USER} ~ $ {"  "}
            <span
              className={
                connected ? "text-[#00ff41]" : "text-[#ff0033] animate-pulse"
              }
            >
              [{connected ? "online" : "linking..."}]
            </span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[#008f00]">
              ROLE:{" "}
              <span
                className={
                  viewRole === "copilot" ? "text-[#00ccff]" : "text-[#00ff41]"
                }
              >
                {viewRole.toUpperCase()}
              </span>
            </span>
            <button
              type="button"
              onClick={switchRole}
              className="text-[10px] px-1.5 py-0.5 border border-[#008f00] text-[#008f00] hover:bg-[#00ff41]/10 hover:text-[#00ff41] transition-colors"
              title={`switch to ${viewRole === "human" ? "COPILOT" : "HUMAN"}`}
            >
              {`↻ switch to ${viewRole === "human" ? "COPILOT" : "HUMAN"}`}
            </button>
            {viewRole === "human" && (
              <>
                <span className="text-[#008f00]/40">|</span>
                <button
                  type="button"
                  onClick={enterSelectMode}
                  disabled={selectMode || selectableMessages.length === 0}
                  className="text-[10px] text-[#00ccff]/80 hover:text-[#00ccff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="select messages and export as PNG"
                >
                  📸 share
                </button>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <BatteryBar value={energy.currentBatteryPercent} />
            <DeviceBadges count={energy.devices} />
          </div>
        </div>
      </header>

      {viewRole === "human" && selectMode && (
        <SelectActionBar
          selectedCount={selectedIds.size}
          totalCount={selectableMessages.length}
          busy={exporting}
          onSelectAll={selectAll}
          onSelectNone={selectNone}
          onCancel={exitSelectMode}
          onExport={handleExport}
        />
      )}

      <div
        className={`flex-1 border ${
          lowBat ? "border-[#ff0033]" : "border-[#008f00]"
        } flex flex-col bg-black min-h-0`}
      >
        {viewRole === "human" ? (
          <TerminalChat
            role="human"
            messages={messages}
            onSend={handleHumanSend}
            onTypingDone={markTypingDone}
            selectMode={selectMode}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onExitSelectMode={exitSelectMode}
            modelSelector={<ModelSelector currentId={modelId} onSelect={setModelId} />}
          />
        ) : (
          <CopilotStation
            state={copilotState}
            currentPrompt={currentPrompt}
            countdown={countdown}
            answeredCount={answeredCount}
            ultimateMenu={
              <UltimateSkillMenu
                available={energy.availableUltimates}
                onUse={triggerEffect}
              />
            }
            onStartWaiting={startWaiting}
            onCancelWaiting={cancelWaiting}
            onAccept={accept}
            onSkip={skip}
            onReply={handleCopilotReply}
          />
        )}
      </div>

      {/* 大招特效 overlay */}
      {activeEffect === "blue-screen" && (
        <BlueScreen onDone={handleEffectDone} />
      )}
      {activeEffect === "code-rain" && (
        <CodeRainCollapse onDone={handleEffectDone} />
      )}
      {activeEffect === "cpu-melt" && <CPUMelt onDone={handleEffectDone} />}

      {shutdown && <ScreenShutdown onDone={handleShutdownDone} />}

      {/* 隐藏的 Carbon 截图节点（仅 human 视角用） */}
      {viewRole === "human" && (
        <ScreenshotExport role="human" ref={exportRef} />
      )}
    </main>
  );
}
