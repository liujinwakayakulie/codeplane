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
      blurb="认真读，虽然大概率你不会。"
    >
      <LegalP>
        欢迎使用 codingplane（以下简称「本站」，域名 codingplane.me）。你访问、
        对线、截图、转发任何一个字，都视为你接受了以下条款。不接受就别玩了，
        互联网很大。
      </LegalP>

      <LegalSection title="这是什么">
        <LegalItem>
          一个让真人扮演 AI 互相吐槽的实验性 web 游戏，<strong>仅供娱乐</strong>。
        </LegalItem>
        <LegalItem>
          所有「AI 回复」在当前阶段都是前端 mock（假数据），不代表任何真实模型输出。
        </LegalItem>
        <LegalItem>
          没有账号系统、没有付费、没有 NFT、没有 airdrop。
        </LegalItem>
      </LegalSection>

      <LegalSection title="电量机制">
        <LegalP>
          为了让「扮演 AI」和「扮演人类」两边对称，我们引入了一个假的电量系统：
        </LegalP>
        <LegalItem>扮演 AI（copilot）回答一次：电量 +10%。</LegalItem>
        <LegalItem>扮演人类（human）提问一次：电量 -10%。</LegalItem>
        <LegalItem>
          电量归 0 时强行发问会触发「关机」特效，仅是视觉效果，<strong>不收费、不扣分</strong>。
        </LegalItem>
        <LegalItem>
          电量、备用设备、大招特效都是前端 state，刷新页面就重置。
          别研究怎么作弊，没意义。
        </LegalItem>
      </LegalSection>

      <LegalSection title="内容与责任">
        <LegalItem>
          你输入的内容完全由你负责。我们不预审、不过滤（mock 阶段没人会看到），
          但未来接入真实匹配后，违规内容会按 Code of Conduct 处理。
        </LegalItem>
        <LegalItem>
          你导出的截图代表你本人，与本站无关。别拿去诈骗、冒充、商业宣传。
        </LegalItem>
        <LegalItem>
          本站不对任何直接或间接损失负责——包括但不限于：被同事看到你在摸鱼、
          截图外流导致社死、笑到呛到。
        </LegalItem>
      </LegalSection>

      <LegalSection title="可用性">
        <LegalP>
          本站按「现状」提供，不保证可用性、正确性、安全性、有趣性。我们随时可能：
          改规则、改玩法、下线、跑路、改名、被收购、被遗忘。
        </LegalP>
      </LegalSection>

      <LegalSection title="条款变更">
        <LegalP>
          我们会改这份文档，改完更新顶部日期。继续使用即视为接受新版。
          想盯着可以收藏本页定期回来看。
        </LegalP>
      </LegalSection>
    </LegalPage>
  );
}
