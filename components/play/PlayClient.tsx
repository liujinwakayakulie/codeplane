"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveMatch } from "@/hooks/useLiveMatch";
import { useEnergy } from "@/hooks/useEnergy";
import { useIdleRecovery, formatCountdown } from "@/hooks/useIdleRecovery";
import { ConnectionOverlay } from "@/components/play/ConnectionOverlay";
import { useErrorToast } from "@/components/play/ErrorToast";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
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

  const energy = useEnergy();
  const [shutdown, setShutdown] = useState(false);
  const [activeEffect, setActiveEffect] = useState<SkillId | null>(null);
  const toast = useErrorToast();

  // 收到对端大招 → 直接渲染特效（human 视角；不消耗本地电量）
  const live = useLiveMatch({
    onUltimateReceived: (skill) => setActiveEffect(skill),
    onError: (msg) => toast.push(msg),
  });
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
    castUltimate,
    connected,
    connectionLost,
    queueInfo,
  } = live;

  // 每 2 分钟挂机兜底 +1 unit（10%），每天最多 10 次
  const idle = useIdleRecovery(() => energy.charge(1));

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

  // —— copilot 放大招：消耗备用手机 + POST 给对手（本地不渲染，human 端会显示）——
  const handleCastUltimate = (skill: SkillId) => {
    if (!energy.canUltimate) return;
    energy.useUltimate();
    void castUltimate(skill);
  };

  const handleEffectDone = useCallback(() => setActiveEffect(null), []);

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
              data-tour="role-switch"
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
            <div data-tour="battery">
              <BatteryBar value={energy.currentBatteryPercent} />
            </div>
            <DeviceBadges count={energy.devices} />
          </div>
          <span
            data-tour="idle"
            className="text-[10px] text-[#008f00] tabular-nums"
            title={`Idle recovery: +10% battery every 2 minutes you keep this tab open. Up to ${idle.maxPerDay} times per day.`}
          >
            {`⚡ idle ${idle.recoveredToday}/${idle.maxPerDay} · ${
              idle.remainingToday === 0 ? "done today" : formatCountdown(idle.nextInMs)
            }`}
          </span>
          {/* 测试按钮：手动 +10% 电量，仅 dev 构建（prod build 这段会被 tree-shake 掉） */}
          {process.env.NODE_ENV !== "production" && (
            <button
              type="button"
              onClick={() => energy.charge(1)}
              className="text-[10px] border border-[#ffcc00]/50 text-[#ffcc00]/80 hover:text-[#ffcc00] hover:border-[#ffcc00] px-1.5 py-0.5 transition-colors"
              title="test: instantly +10% battery"
            >
              +10%
            </button>
          )}
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

      {/* 队列状态条：仅在当前角色处于"等待中"才显示（避免切换 role 后旧数据残留） */}
      {queueInfo &&
        ((viewRole === "human" && promptInFlight) ||
          (viewRole === "copilot" && copilotState === "waiting")) && (
          <div className="shrink-0 px-3 py-1 text-[10px] text-[#008f00] tabular-nums border-b border-[#008f00]/60 bg-black">
            {viewRole === "human"
              ? queueInfo.totalCopilots > 0
                ? `// queued. ${queueInfo.humansAhead} human${queueInfo.humansAhead === 1 ? "" : "s"} ahead · ${queueInfo.totalCopilots} copilot${queueInfo.totalCopilots === 1 ? "" : "s"} online`
                : `// waiting for a copilot... nobody online right now`
              : queueInfo.totalHumans > 0
                ? `// ${queueInfo.totalHumans} prompt${queueInfo.totalHumans === 1 ? "" : "s"} queued in the pool`
                : `// pool is empty. you'll be first when a human sends`}
          </div>
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
                onUse={handleCastUltimate}
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

      {/* SSE 断开超过 3s 显示的全屏遮罩 */}
      <ConnectionOverlay visible={connectionLost} />

      {/* 错误 toast */}
      {toast.node}

      {/* 首次访问该角色的引导 */}
      <OnboardingTour role={viewRole} />

      {/* 隐藏的 Carbon 截图节点（仅 human 视角用） */}
      {viewRole === "human" && (
        <ScreenshotExport role="human" ref={exportRef} />
      )}
    </main>
  );
}
