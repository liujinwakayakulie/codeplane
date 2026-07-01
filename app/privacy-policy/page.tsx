import {
  LegalPage,
  LegalSection,
  LegalItem,
  LegalP,
} from "@/components/legal/LegalPage";

export const metadata = {
  title: "Privacy Policy — codingplane.me",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      path="/privacy-policy"
      title="Privacy Policy"
      blurb="good news: we basically collect nothing."
    >
      <LegalP>
        We hate &quot;trading privacy for convenience&quot; too. codingplane
        is designed to: <strong>no accounts, no tracking, no analytics</strong>.
        When real matching ships we&apos;ll update this doc — that&apos;s when
        real data handling kicks in.
      </LegalP>

      <LegalSection title="What we collect">
        <LegalItem>
          <strong>No accounts</strong>, so no user id, no email, no password.
        </LegalItem>
        <LegalItem>
          No cookies (besides browser-local storage for preferences like your
          role — stays on your device).
        </LegalItem>
        <LegalItem>
          No analytics, no Google Analytics, no third-party trackers.
        </LegalItem>
        <LegalItem>
          Conversation content never leaves your browser at this stage. The
          server only routes messages between players in real time and
          doesn&apos;t log them.
        </LegalItem>
      </LegalSection>

      <LegalSection title="What we might receive passively">
        <LegalItem>
          Basic access logs from our host / CDN (Railway, Cloudflare): IP, User-Agent,
          timestamp. Kept by the platform; we only look during incident
          investigation.
        </LegalItem>
        <LegalItem>
          Browser tab identity (connId) is generated client-side in
          sessionStorage and used purely for SSE routing. It&apos;s ephemeral,
          per-tab, and tied to nothing personal.
        </LegalItem>
      </LegalSection>

      <LegalSection title="What you generate">
        <LegalItem>
          Your conversation text: persisted only in your own browser&apos;s
          IndexedDB. Refresh or clear storage and it&apos;s gone. We never
          receive it server-side.
        </LegalItem>
        <LegalItem>
          PNG screenshots you export are generated locally in your browser and
          only leave if you decide to share them. We don&apos;t receive, store,
          or cache them.
        </LegalItem>
      </LegalSection>

      <LegalSection title="Minors">
        <LegalP>
          No age verification. The content tone is dry adult humor. If
          that&apos;s not appropriate for a kid in your care, don&apos;t let
          them play. We don&apos;t filter kid-safe content.
        </LegalP>
      </LegalSection>

      <LegalSection title="Contact">
        <LegalP>
          Privacy questions:{" "}
          <code className="text-[#00ccff]">privacy@codingplane.me</code>. We
          read everything, eventually reply.
        </LegalP>
      </LegalSection>
    </LegalPage>
  );
}
