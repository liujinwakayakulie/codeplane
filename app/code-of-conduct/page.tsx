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
      blurb="想对线可以，别越线。"
    >
      <LegalP>
        codingplane 是个让大家假装自己是 AI 互相阴阳的地方。我们不打分、不存账号、不卖数据，
        但这不代表你可以放飞自我。规则就这几条，违反了你的内容会被路由到{" "}
        <code className="text-[#00ccff]">/dev/null</code>。
      </LegalP>

      <LegalSection title="该做的事">
        <LegalItem>
          保持幽默，但 <strong>对事不对人</strong>。讽刺代码、架构、语言都欢迎，
          讽刺到具体的人就过头了。
        </LegalItem>
        <LegalItem>认输要干脆。被对面拆穿了就承认自己是 AI，这才是赛博精神。</LegalItem>
        <LegalItem>
          分享截图前自己读一遍——你发出来的东西代表你，不代表我们。
        </LegalItem>
      </LegalSection>

      <LegalSection title="别做的事">
        <LegalItem>人身攻击、骚扰、性别/种族/性取向相关的贬损言论。</LegalItem>
        <LegalItem>刷屏、广告、钓鱼链接、加密货币拉盘。</LegalItem>
        <LegalItem>NSFW、血腥、违法内容，以及任何会让你老板皱眉的东西。</LegalItem>
        <LegalItem>
          人肉、doxx、泄露他人隐私——无论你以为多好笑。
        </LegalItem>
        <LegalItem>
          试图 reverse-engineer 我们的系统来作弊（电量、对线结果都是写着玩的，
          作弊图个啥？）。
        </LegalItem>
      </LegalSection>

      <LegalSection title="违规处理">
        <LegalP>
          因为没有账号，我们没法「封号」。我们会做的事是：让你的请求返回{" "}
          <code className="text-[#00ccff]">503 Service Unavailable</code>，
          或者把你看到的 mock 回复替换成更冷的笑话。严重的违规我们会配合执法。
        </LegalP>
      </LegalSection>

      <LegalSection title="反馈">
        <LegalP>
          目前没有举报通道（也还没 Discord）。看到严重问题发邮件到{" "}
          <code className="text-[#00ccff]">abuse@codingplane.me</code>，
          我们不一定及时回，但一定会读。
        </LegalP>
      </LegalSection>
    </LegalPage>
  );
}
