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
      blurb="好消息：我们目前几乎不收集你任何东西。"
    >
      <LegalP>
        我们也讨厌「用隐私换便利」。codingplane 目前的设计目标就是：
        <strong>不存账号、不追踪、不分析</strong>。等接入真实匹配后我们会更新这份文档，
        那时才会涉及真实数据处理。
      </LegalP>

      <LegalSection title="我们收集什么">
        <LegalItem>
          <strong>没有账号</strong>，所以没有 user id、邮箱、密码。
        </LegalItem>
        <LegalItem>
          没有 cookie（除浏览器本地 storage 里可能存的视角偏好，仅本机）。
        </LegalItem>
        <LegalItem>
          没有埋点、没有 Google Analytics、没有第三方 tracker。
        </LegalItem>
        <LegalItem>
          对话内容不离开你的浏览器——目前所有「AI 回复」是写死的前端 mock。
        </LegalItem>
      </LegalSection>

      <LegalSection title="我们可能会收到什么（被动）">
        <LegalItem>
          托管平台（Vercel/Cloudflare 等）的基础访问日志：IP、UA、时间戳。
          这部分由平台保留，我们仅在排查故障时查看。
        </LegalItem>
        <LegalItem>
          如果未来接入真实模型 API，你输入的提问会经过我们的服务器转发给模型供应商。
          这部分上线前我们会单独告知并更新本文档。
        </LegalItem>
      </LegalSection>

      <LegalSection title="你主动产生什么">
        <LegalItem>
          你输入的对线文本：当前阶段只存在你自己的浏览器内存里，刷新即清空。
        </LegalItem>
        <LegalItem>
          你点击「分享/截图」后导出的 PNG：由你本地浏览器生成、由你决定发去哪。
          我们不接收、不存储、不缓存。
        </LegalItem>
      </LegalSection>

      <LegalSection title="未成年人">
        <LegalP>
          本站没有年龄验证，但内容定位是成年人之间的冷幽默。家长如果觉得不合适，
          别让小孩玩。我们不做 kid-safe 内容过滤。
        </LegalP>
      </LegalSection>

      <LegalSection title="联系">
        <LegalP>
          隐私相关问题： <code className="text-[#00ccff]">privacy@codingplane.me</code>。
          读得到，但不一定及时回。
        </LegalP>
      </LegalSection>
    </LegalPage>
  );
}
