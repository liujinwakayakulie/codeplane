import Link from "next/link";
import { SITE_DOMAIN } from "@/lib/site";

const BANNER = String.raw` ██████  ██████  ██ ███    ██ ██████  ███████ ██████
██       ██   ██ ██ ████   ██ ██   ██ ██      ██   ██
██   ███ ██████  ██ ██ ██  ██ ██████  █████   ██   ██
██    ██ ██   ██ ██ ██  ██ ██ ██      ██      ██   ██
 ██████  ██   ██ ██ ██   ████ ██      ███████ ██████

██████   ██   ██ ██      ██ ███████ ██████
██   ██  ██   ██ ██      ██ ██      ██   ██
██████   ███████ ██      ██ █████   ██████
██       ██   ██ ██      ██ ██      ██   ██
██       ██   ██ ███████ ██ ███████ ██   ██

            ${SITE_DOMAIN}
`;

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 overflow-y-auto">
      <pre className="text-[#00ff41] text-[10px] sm:text-xs leading-tight select-none mb-3 whitespace-pre">
        {BANNER}
      </pre>
      <p className="text-[#008f00] mb-10 text-xs sm:text-sm text-center">
        {"// real-time troll arena. who acts more like an AI?"}
      </p>

      <div className="flex flex-col sm:flex-row gap-5 mb-10">
        <RoleButton
          href="/play?role=human"
          label="HUMAN"
          sub="ask the questions"
          accent="#00ff41"
        />
        <RoleButton
          href="/play?role=copilot"
          label="COPILOT"
          sub="pretend to be the AI"
          accent="#00ccff"
        />
      </div>

      <p className="text-[#008f00] text-[10px] sm:text-xs text-center max-w-md leading-relaxed">
        {"no login · play instantly · every answer costs 10% battery"}
        <br />
        {"playing AI charges +10%, playing human drains -10%"}
      </p>

      <p className="mt-6 text-[10px] text-[#008f00]/70">
        <Link
          href="/how-to-play"
          className="text-[#00ccff] hover:text-[#00ff41] underline-offset-2 hover:underline"
        >
          {"$ how to play"}
        </Link>
      </p>
    </main>
  );
}

function RoleButton({
  href,
  label,
  sub,
  accent,
}: {
  href: string;
  label: string;
  sub: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group relative border-2 px-10 py-8 min-w-[220px] text-center transition-all hover:translate-y-[-2px]"
      style={{ borderColor: accent, color: accent }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
        style={{ backgroundColor: accent }}
      />
      <div className="relative text-2xl font-bold tracking-widest">
        [ {label} ]
      </div>
      <div className="relative text-xs mt-2 opacity-70 group-hover:opacity-100">
        {sub}
      </div>
    </Link>
  );
}
