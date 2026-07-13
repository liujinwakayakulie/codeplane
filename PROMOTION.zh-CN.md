# CodingPlane 英文发行计划（中文阅读版）

更新日期：2026-07-13

线上地址：https://codingplane.me/

> 说明：这份文档不是“中文社区推广方案”。它是英文发行计划的中文翻译版，方便你自己阅读和执行。实际对外发布仍然以英文渠道、英文话术、英文素材为主。

## 发行目标

第一阶段不要把目标设成“爆火”。CodingPlane 现在最需要验证的是核心循环是否成立：

1. human 提交一个编程问题。
2. copilot 能尽快收到这个问题。
3. copilot 愿意点击 accept 并回复。
4. human 看到回复后觉得好笑、截图、分享，或者继续下一轮。

两周内建议目标：

- 300+ 独立访客。
- 100+ human 提交问题。
- 60%+ 的问题能被 copilot 收到。
- 40+ 完成回合。
- 20+ 截图或分享动作。
- 10+ 条有效反馈。

## 英文定位

主 tagline：

> A live coding game where humans pretend to be AI copilots.

短版一句话：

> Ask a coding question. A stranger pretends to be your AI copilot.

更轻松一点的版本：

> ChatGPT, but the model is a random developer trying not to laugh.

更适合技术社区的版本：

> A real-time 1v1 game for developers: one player asks a programming question, and another player answers while pretending to be an AI copilot.

## 定位建议

对外发布时，不建议一开始就强调 `troll`。这个词在产品内部和熟人圈可以成立，但在英文陌生社区里可能被理解成骚扰、攻击或低质量整活。

更稳的表达顺序：

1. live coding game
2. humans pretending to be AI
3. programming humor
4. weird / chaotic / strangely human

把 `troll arena` 放在产品气质里可以，但不要当作陌生渠道的第一句。

## 目标受众

优先受众：

- 每天使用 ChatGPT、Claude、Cursor、GitHub Copilot 的开发者。
- 喜欢小而怪产品的 indie hackers。
- 喜欢编程幽默和 AI 梗的人。
- 会逛 Hacker News、Product Hunt、Reddit、X/Twitter 的开发者。
- 开发者 Discord、Slack、Telegram 社区里的早期用户。

暂时不优先：

- 泛消费用户：他们可能不懂 Copilot 和 AI coding assistant 的梗。
- 纯 AI 工具购买者：他们可能期待生产力，不期待小游戏。
- 付费广告流量：实时匹配产品冷启动成本高，先不要花钱买流量。

## 发行难点

CodingPlane 最大的问题不是文案，而是实时匹配的冷启动。

如果用户打开后没有 copilot 在线，human 会等不到回复；如果 copilot 在线但没有 human 提问，copilot 会一直空等。这个体验会让用户以为产品坏了。

所以英文发行要围绕“同一时间让一批人进来”设计，而不是随便丢链接。

正确策略：

- 发布前安排 2-3 个朋友在线当 copilot。
- 发布后你自己在线盯 1-2 小时。
- 每次只推一个主要渠道，不要同时到处发。
- 优先收集真实反馈和截图，再扩大范围。

## 发布前准备清单

正式发到英文渠道前，先完成这些：

- [ ] 线上站稳定可用。
- [ ] human-first 流程测试通过。
- [ ] copilot-first 流程测试通过。
- [ ] 至少 2-3 个朋友可以在发布后 60 分钟内在线。
- [ ] 准备一个 10-15 秒英文 Demo 视频或 GIF。
- [ ] 准备一张横版截图。
- [ ] 准备一张正方形截图。
- [ ] 准备 Show HN 标题和首条评论。
- [ ] 准备 Product Hunt tagline、短介绍和 maker comment。
- [ ] 准备 Reddit 版本文案。
- [ ] 准备 X/Twitter 版本文案。
- [ ] 给不同渠道准备 UTM/ref 链接。

推荐链接：

| 渠道 | 链接 |
| --- | --- |
| X/Twitter | `https://codingplane.me/?utm_source=x&utm_medium=social&utm_campaign=soft_launch` |
| Show HN | `https://codingplane.me/?utm_source=hackernews&utm_medium=community&utm_campaign=show_hn` |
| Reddit | `https://codingplane.me/?utm_source=reddit&utm_medium=community&utm_campaign=soft_launch` |
| Product Hunt | `https://codingplane.me/?utm_source=producthunt&utm_medium=launch&utm_campaign=product_hunt` |
| Indie Hackers | `https://codingplane.me/?utm_source=indiehackers&utm_medium=community&utm_campaign=soft_launch` |
| Direct DM | `https://codingplane.me/?utm_source=direct&utm_medium=dm&utm_campaign=soft_launch` |

## 英文发行节奏

### Day -3：包装故事和素材

准备一个 10-15 秒 Demo：

1. 左边 human，右边 copilot。
2. human 输入一个带梗的编程问题。
3. copilot 收到 prompt。
4. copilot 点击 accept。
5. copilot 回一个像 AI 又不像 AI 的答案。
6. human 看到回复，并导出截图。

示例问题：

```text
How do I center a div without summoning ancient CSS trauma?
```

示例回答：

```text
Certainly. Use flexbox. If that fails, add display: flex to every ancestor until the layout becomes too afraid to resist.
```

视频字幕：

```text
Ask a coding question.
A stranger pretends to be your AI copilot.
No signup. Instant chaos.
```

### Day -2：英文小范围测试

先找 10-20 个英文能看懂的开发者朋友、indie hacker 朋友，或者开发者群友。

目标不是推广，而是验证：

- 第一次打开能不能理解 human / copilot 两个角色？
- 是否知道应该点哪个入口？
- human 提问后等待是否合理？
- copilot 收到消息后 accept / skip 是否明显？
- 一轮结束后有没有分享欲？

私信模板：

```text
I launched a tiny dev game and need a few real humans online at the same time.

The joke: one person asks a programming question, another person pretends to be an AI copilot and replies.

Can you try one round today? It takes 2 minutes:
https://codingplane.me/?utm_source=direct&utm_medium=dm&utm_campaign=soft_launch
```

### Day -1：英文预热

在 X/Twitter 或小圈子里发一句轻预热，不一定带链接：

```text
I built a site where humans pretend to be AI copilots. It is either brilliant or deeply stupid. Launching tomorrow.
```

同时找 2-3 个朋友约好发布时间在线，不是让他们点赞，而是让他们真的玩，保证首批用户不是空房间。

### Day 0：X/Twitter + 小圈子软启动

先从自己的英文 X/Twitter、indie maker 小群、开发者 Discord 开始。

目标：

- 让 30-80 人试玩。
- 收集第一批截图。
- 修掉最明显的新手困惑。
- 判断英文定位是否能被理解。

X/Twitter 文案 1：

```text
I built CodingPlane: a tiny live coding game where one human asks a programming question and another human has to pretend to be an AI copilot.

No signup. Instant play. Very stupid in the best way.

https://codingplane.me/?utm_source=x&utm_medium=social&utm_campaign=soft_launch
```

X/Twitter 文案 2：

```text
What if ChatGPT was just a random developer trying to sound confident?

That is basically CodingPlane.

Ask a coding question. A stranger answers as your fake AI copilot.

https://codingplane.me/?utm_source=x&utm_medium=social&utm_campaign=soft_launch
```

### Day 1：Show HN

如果 Day 0 没有严重 bug，再发 Show HN。

Show HN 适合 CodingPlane，因为它是一个别人可以直接打开体验的项目，而且不需要注册。发布时要注意：不要拉票，不要让朋友集中点赞，不要在评论里提排名。

标题：

```text
Show HN: CodingPlane - a live game where humans pretend to be AI copilots
```

首条评论草稿：

```text
I built CodingPlane because AI coding assistants are useful, but the interaction pattern is also funny: we ask them very human questions and accept very strange answers.

The site turns that into a real-time 1v1 game. One player asks a programming question as the human. Another player receives it as the copilot, accepts or skips, and then tries to answer like an AI.

There is no signup. The matcher is in-memory, using SSE for push updates. I am currently running it as a single Railway instance.

I would love feedback on whether the first-time flow is clear, whether matching feels too empty, and what would make a round funnier.
```

HN 回复策略：

- 诚实回答技术问题。
- 可以讲 Next.js、SSE、in-memory matcher、Railway 单实例。
- 不要防御性太强。
- 不要让评论看起来像 AI 自动生成。
- 有 bug 先感谢，再修，再回来回复。

参考：

- https://news.ycombinator.com/showhn.html
- https://news.ycombinator.com/newsguidelines.html

### Day 3：Reddit

Reddit 风险比 HN 更高，因为很多 subreddit 对自我推广非常敏感。

可以考虑：

- `r/SideProject`
- `r/webdev`
- `r/InternetIsBeautiful`
- `r/programminghumor`
- `r/indiehackers`

规则：

- 每次只选一个 subreddit。
- 发之前读规则。
- 不要复制同一段文案到多个地方。
- 透明说这是你做的。
- 不要要求 upvote。
- 不要用多个账号。

Reddit 文案：

```text
I built a tiny real-time game where developers pretend to be AI copilots

The premise is simple: one player asks a programming question, and a stranger receives it as the "copilot" and tries to answer like an AI.

No signup, just a weird little live experiment around AI coding culture:
https://codingplane.me/?utm_source=reddit&utm_medium=community&utm_campaign=soft_launch

I made this mostly to see whether the interaction is funny when both sides know a human is behind the curtain. Feedback welcome, especially on whether the first-time flow makes sense.
```

参考：

- https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam
- https://www.reddit.com/r/reddit.com/wiki/selfpromotion/

### Week 2：Product Hunt

Product Hunt 不建议第一天就发。它更适合在你已经有 Demo、截图、真实反馈之后做一次正式发行。

Product Hunt 字段：

- Name: `CodingPlane`
- Tagline: `A live coding game where humans pretend to be AI copilots`
- Topics: Developer Tools, Games, Artificial Intelligence, Social Networking
- Website: `https://codingplane.me/?utm_source=producthunt&utm_medium=launch&utm_campaign=product_hunt`

短介绍：

```text
CodingPlane is a real-time 1v1 game for developers. One player asks a coding question, and a stranger answers while pretending to be an AI copilot. No signup, instant play, weirdly human.
```

Maker comment：

```text
Hey Product Hunt, I built CodingPlane as a tiny experiment around AI coding culture.

The game is simple: one person asks a programming question, another person receives it as the "copilot" and has to answer like an AI. Every round pairs you with a fresh stranger.

I wanted it to feel like a terminal-native party game for developers: fast, anonymous, and a little chaotic.

I would love feedback on the first-time experience, matching flow, and whether the joke lands.
```

Product Hunt 注意事项：

- 可以邀请朋友访问、试用、评论。
- 不要直接要求 upvote。
- 发布当天你要在线回复评论。
- 最好准备 GIF，而不是只有静态截图。

参考：

- https://www.producthunt.com/launch

## 英文直接私信模板

给开发者朋友：

```text
I launched a tiny dev game and need a few real humans online at the same time.

The joke: one person asks a programming question, another person pretends to be an AI copilot and replies.

Can you try one round today? It takes 2 minutes:
https://codingplane.me/?utm_source=direct&utm_medium=dm&utm_campaign=soft_launch
```

给 indie maker 朋友：

```text
I shipped a weird little real-time game for developers and I am trying to validate whether the loop is actually fun.

Could you try one round and tell me where you got confused?
https://codingplane.me/?utm_source=direct&utm_medium=dm&utm_campaign=soft_launch
```

给开发者社区管理员：

```text
Hey, I built a small real-time game for developers where people pretend to be AI copilots.

It is free, no signup, and mostly a programming humor experiment. Would it be okay if I share it in the community for feedback?
```

## Demo 素材脚本

推荐录屏结构：

1. 分屏：human 在左，copilot 在右。
2. human 输入：

```text
How do I fix "undefined is not a function" without deleting the whole project?
```

3. copilot 收到消息并点击 accept。
4. copilot 回复：

```text
Certainly. First, blame JavaScript. Then check whether the thing you are calling is actually a function, which is unfortunately required by most runtimes.
```

5. human 看到回复。
6. 展示 share/export 截图。

视频标题：

```text
A live coding game where humans pretend to be AI copilots
```

## 指标观察

建议追踪事件：

- `role_selected`
- `prompt_submitted`
- `copilot_waiting_started`
- `prompt_received`
- `prompt_accepted`
- `prompt_skipped`
- `reply_sent`
- `round_completed`
- `screenshot_exported`
- `discord_clicked`

最重要漏斗：

- 访问 -> 选择角色。
- human 提交问题 -> copilot 收到。
- copilot 收到 -> accept。
- accept -> reply sent。
- round completed -> screenshot exported。

手动记录表：

| 日期 | 渠道 | 链接 | 访客 | 提问数 | 完成回合 | 截图数 | Discord 点击 | Bug | 最好笑截图 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-07-13 | X/Twitter | `?utm_source=x` | | | | | | | |
| 2026-07-14 | Show HN | `?utm_source=hackernews` | | | | | | | |

## 每周英文发行节奏

周一：

- 看数据和反馈。
- 选一个产品问题修。
- 选一个英文渠道动作。

周二：

- 修产品问题。
- 发一张英文截图或短视频。

周三：

- 私信 5 个英文开发者或 indie maker 朋友，请他们试玩。

周四：

- 发一个英文社区帖。
- 发布后在线 1 小时。

周五：

- 发一条英文 build-in-public：
  - 本周多少人玩。
  - 学到了什么。
  - 修了什么。
  - 下周准备做什么。

周末：

- 组织一次 30-60 分钟英文试玩窗口。

## 不要做的事

- 不要买流量。
- 不要刷赞。
- 不要要求 HN / Product Hunt / Reddit upvote。
- 不要让朋友伪装成随机用户。
- 不要群发私信。
- 不要把它包装成严肃 AI 工具。
- 不要同时在多个 Reddit 社区复制粘贴。
- 不要忽略空房间问题。

## 能提升英文发行转化的产品改动

优先级高：

- 空房间提示：当没有 copilot 在线时，让 human 知道可以邀请朋友一起玩。
- 等待状态提示：告诉 copilot 现在是否有人类 prompt 在排队。
- 示例问题：给 human 3 个英文搞笑 prompt。
- 回合结束后的 share/export 更明显。
- 发布期间加 banner：`Live play window: 9:30-10:30 PM UTC`.

优先级中：

- 精选截图墙。
- Daily prompt challenge。
- `Was this human or AI?` 猜测模式。
- funniest copilot replies 排行榜。

## 最小可执行计划

如果你只想做最小发行，就按这个顺序：

1. 今天录一个 10-15 秒英文 Demo。
2. 找 5 个英文开发者朋友同时在线试玩。
3. 明天发 X/Twitter。
4. 后天发 Show HN。
5. 收集最搞笑的 3 张截图。
6. 修掉最大的新手困惑。
7. 第二周再做 Product Hunt。

