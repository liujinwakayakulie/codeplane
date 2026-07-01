import {
  LegalPage,
  LegalSection,
  LegalItem,
  LegalP,
} from "@/components/legal/LegalPage";

export const metadata = {
  title: "Code of Conduct — codingplane.me",
};

export default function CodeOfConductPage() {
  return (
    <LegalPage
      path="/code-of-conduct"
      title="Code of Conduct"
      blurb="trolls welcome, harassment not."
    >
      <LegalP>
        codingplane is a place where humans pretend to be AIs and roast each
        other. We don&apos;t keep accounts, we don&apos;t sell data, we
        don&apos;t score you. That said, &quot;no rules&quot; isn&apos;t the
        vibe. Break these and your content gets routed to{" "}
        <code className="text-[#00ccff]">/dev/null</code>.
      </LegalP>

      <LegalSection title="Do">
        <LegalItem>
          Stay funny, <strong>punch up, not at people</strong>. Roasting code,
          architectures, languages — fine. Roasting a specific person —
          that&apos;s just being a jerk.
        </LegalItem>
        <LegalItem>
          Own the L. If the other side figures out you&apos;re the AI, admit
          it. That&apos;s the cyber spirit.
        </LegalItem>
        <LegalItem>
          Read your screenshot before sharing. What you post represents you,
          not us.
        </LegalItem>
      </LegalSection>

      <LegalSection title="Don't">
        <LegalItem>
          Personal attacks, harassment, sexist / racist / homophobic slurs.
        </LegalItem>
        <LegalItem>
          Spam, ads, phishing links, crypto shilling.
        </LegalItem>
        <LegalItem>
          NSFW, gore, illegal content, anything that&apos;d make your boss
          frown.
        </LegalItem>
        <LegalItem>
          Doxxing, leaking someone&apos;s private info — no matter how funny
          you think it is.
        </LegalItem>
        <LegalItem>
          Reverse-engineering our system to cheat. Battery and match outcomes
          are written as a joke. Cheating here is just sad.
        </LegalItem>
      </LegalSection>

      <LegalSection title="What we do if you break it">
        <LegalP>
          No accounts means no &quot;bans&quot;. What we will do: return{" "}
          <code className="text-[#00ccff]">503 Service Unavailable</code> on
          your requests, or swap your mock replies for colder jokes. Serious
          violations we cooperate with law enforcement.
        </LegalP>
      </LegalSection>

      <LegalSection title="Reporting">
        <LegalP>
          No in-app report channel yet (no Discord either). For serious
          issues email{" "}
          <code className="text-[#00ccff]">abuse@codingplane.me</code>. We read
          everything, reply on a best-effort basis.
        </LegalP>
      </LegalSection>
    </LegalPage>
  );
}
