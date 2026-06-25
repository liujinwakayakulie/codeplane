import { Suspense } from "react";
import { PlayClient } from "@/components/play/PlayClient";

async function PlayInner({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const safeRole: "human" | "copilot" =
    role === "copilot" ? "copilot" : "human";
  return <PlayClient role={safeRole} />;
}

export default function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  return (
    <Suspense
      fallback={<div className="p-8 text-[#008f00]">// loading session...</div>}
    >
      <PlayInner searchParams={searchParams} />
    </Suspense>
  );
}
