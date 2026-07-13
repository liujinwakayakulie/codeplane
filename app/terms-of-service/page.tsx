import {
  LegalPage,
  LegalSection,
  LegalItem,
  LegalP,
} from "@/components/legal/LegalPage";

export const metadata = {
  title: "Terms of Service — codingplane.me",
};

export default function TermsOfServicePage() {
  return (
    <LegalPage
      path="/terms-of-service"
      title="Terms of Service"
      blurb="read it. you won't, but read it."
    >
      <LegalP>
        Welcome to codingplane (the &quot;Site&quot;, domain codingplane.me).
        Visit, troll, screenshot, forward — any of that counts as agreeing to
        these terms. Don&apos;t agree? Don&apos;t play. The internet is large.
      </LegalP>

      <LegalSection title="What this is">
        <LegalItem>
          An experimental web game where real humans roleplay as AIs and mock
          each other. <strong>For entertainment only.</strong>
        </LegalItem>
        <LegalItem>
          Replies are part of the game flow and are for entertainment, not
          professional advice.
        </LegalItem>
        <LegalItem>
          No accounts, no payments, no NFTs, no airdrops.
        </LegalItem>
      </LegalSection>

      <LegalSection title="The battery mechanic">
        <LegalP>
          To keep &quot;playing AI&quot; and &quot;playing human&quot;
          symmetric, there&apos;s a fake battery system:
        </LegalP>
        <LegalItem>Answer as copilot once: battery +10%.</LegalItem>
        <LegalItem>Ask as human once: battery -10%.</LegalItem>
        <LegalItem>
          Hitting 0% and forcing a send triggers a &quot;shutdown&quot; effect
          — purely visual. <strong>No real charge, no real penalty.</strong>
        </LegalItem>
        <LegalItem>
          Battery, backup devices, ultimates — all client-side state. Refresh
          the page and it resets. Cheating this is pointless.
        </LegalItem>
      </LegalSection>

      <LegalSection title="Content & liability">
        <LegalItem>
          What you type is on you. We don&apos;t pre-moderate (no one sees it
          during the mock phase), but once real matching ships, violations get
          handled per the Code of Conduct.
        </LegalItem>
        <LegalItem>
          Screenshots you export represent you, not us. Don&apos;t use them
          for fraud, impersonation, or commercial promotion.
        </LegalItem>
        <LegalItem>
          The Site is not liable for any direct or indirect damages —
          including but not limited to: a coworker catching you slacking off,
          a screenshot leaking and ending your career, laughing so hard you
          choke.
        </LegalItem>
      </LegalSection>

      <LegalSection title="Availability">
        <LegalP>
          The Site is provided &quot;as is&quot;. No guarantees of uptime,
          correctness, security, or fun. We may at any time: change the rules,
          change the gameplay, take it offline, rebrand, get acquired, or fade
          into obscurity.
        </LegalP>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <LegalP>
          We&apos;ll update this doc and bump the date at the bottom. Continued
          use means you accept the new version. Bookmark this page if you want
          to keep an eye on it.
        </LegalP>
      </LegalSection>
    </LegalPage>
  );
}
