import {
  LegalPage,
  LegalSection,
  LegalItem,
  LegalP,
} from "@/components/legal/LegalPage";
import Link from "next/link";

export const metadata = {
  title: "How to play — codingplane.me",
};

export default function HowToPlayPage() {
  return (
    <LegalPage
      path="/how-to-play"
      title="How to play"
      blurb="2 minutes. you'll get it."
    >
      <LegalP>
        codingplane is a 1v1 real-time troll arena. One player asks a
        question as the <strong>human</strong>. A stranger on the internet
        picks it up as the <strong>copilot</strong> and answers like an AI.
        You don&apos;t know who they are, they don&apos;t know who you are.
        Every round is a fresh stranger.
      </LegalP>

      <LegalSection title="Pick a side">
        <LegalItem>
          <strong>HUMAN</strong> — you ask a question. Real ones get queued
          for a copilot to grab. You see one continuous chat log even though
          different strangers answer each round.
        </LegalItem>
        <LegalItem>
          <strong>COPILOT</strong> — you click <code>start waiting</code>,
          the server hands you a stranger&apos;s question, you have 30s to
          accept or skip. Once you accept, write the worst AI impression you
          can and hit send.
        </LegalItem>
        <LegalItem>
          You can switch sides mid-session with the role toggle in the header
          (battery carries over).
        </LegalItem>
      </LegalSection>

      <LegalSection title="Battery (the economy)">
        <LegalP>
          Every action costs or gains battery, shown as a percentage at the
          top of /play.
        </LegalP>
        <LegalItem>
          Ask as human: <strong>-10%</strong>
        </LegalItem>
        <LegalItem>
          Answer as copilot: <strong>+10%</strong>
        </LegalItem>
        <LegalItem>
          Idle recovery: if your tab is open and you&apos;re stuck at 0%,
          battery trickles +10% every 2 minutes, up to +100% per day. Just
          wait it out.
        </LegalItem>
        <LegalItem>
          Every 10 units past your first phone becomes a backup phone — you
          can spend one to cast an <strong>ultimate</strong>.
        </LegalItem>
      </LegalSection>

      <LegalSection title="Ultimates (copilot-only)">
        <LegalP>
          When you&apos;re a copilot mid-answer and have a backup phone,
          the ultimates bar lights up. Each one ends the round and slams a
          full-screen effect on the human:
        </LegalP>
        <LegalItem>
          <code>[BLUESCREEN]</code> — fake Windows BSOD, 4 seconds.
        </LegalItem>
        <LegalItem>
          <code>[CODERAIN]</code> — DOM collapses into Matrix rain, 6 seconds.
        </LegalItem>
        <LegalItem>
          <code>[CPUMELT]</code> — red overheat flash + GPU fan scream, 3
          seconds.
        </LegalItem>
        <LegalP>
          The human also gets a snarky system message in their log — that
          part stays after the effect fades, so it ends up in screenshots.
        </LegalP>
      </LegalSection>

      <LegalSection title="When does a round end?">
        <LegalItem>The copilot sends a reply (normal path).</LegalItem>
        <LegalItem>
          The copilot casts an ultimate (the round ends, human sees the
          effect).
        </LegalItem>
        <LegalItem>The copilot lets the 30s accept timer expire.</LegalItem>
        <LegalItem>
          The copilot hits <code>skip</code> (the prompt goes back to the
          queue for someone else).
        </LegalItem>
      </LegalSection>

      <LegalSection title="History & screenshots">
        <LegalItem>
          Every completed Q&amp;A is saved to your browser&apos;s IndexedDB
          (not the server). Open <code>/history</code> to browse, expand,
          or delete past rounds.
        </LegalItem>
        <LegalItem>
          In the human view, hit <code>📸 share</code> in the header to
          pick which messages to export as a Carbon-style PNG.
        </LegalItem>
      </LegalSection>

      <LegalSection title="Tips">
        <LegalItem>
          Two browser tabs (one normal, one incognito) = two different
          players. Useful for self-testing.
        </LegalItem>
        <LegalItem>
          No accounts. Your history lives in your browser only. Clearing
          storage wipes it.
        </LegalItem>
        <LegalItem>
          ConnId is per-tab. Closing the tab means abandoning any pending
          prompt or waiting slot.
        </LegalItem>
      </LegalSection>

      <div className="mt-10 flex items-center gap-4">
        <Link
          href="/play?role=human"
          className="text-xs border border-[#00ff41] text-[#00ff41] px-3 py-1.5 hover:bg-[#00ff41]/10"
        >
          $ play as human
        </Link>
        <Link
          href="/play?role=copilot"
          className="text-xs border border-[#00ccff] text-[#00ccff] px-3 py-1.5 hover:bg-[#00ccff]/10"
        >
          $ play as copilot
        </Link>
        <Link
          href="/"
          className="ml-auto text-xs text-[#008f00] hover:text-[#00ff41]"
        >
          {"$ cd ~/  ← back home"}
        </Link>
      </div>
    </LegalPage>
  );
}
