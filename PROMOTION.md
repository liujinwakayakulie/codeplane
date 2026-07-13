# CodingPlane Promotion Playbook

Updated: 2026-07-13

Live site: https://codingplane.me/

## Goal

The first promotion goal is not "go viral." The useful goal is to prove the core loop:

1. A human submits a programming prompt.
2. A copilot receives it quickly.
3. The copilot accepts and replies.
4. The human laughs, screenshots, shares, or starts another round.

Two-week target:

- 300+ unique visitors.
- 100+ submitted prompts.
- 60%+ of submitted prompts matched to a copilot.
- 40+ completed rounds.
- 20+ exported/shared screenshots.
- 10+ useful pieces of qualitative feedback.

## Positioning

Primary English tagline:

> A live coding game where humans pretend to be AI copilots.

Primary Chinese tagline:

> 一个程序员实时小游戏：你以为在问 AI，其实对面是真人在装 Copilot。

Short one-liner:

> Ask a coding question. A stranger pretends to be your AI copilot.

More playful one-liner:

> ChatGPT, but the model is a random developer trying not to laugh.

Avoid leading with "troll" in broad public channels. It works inside the product and among friends, but in discovery channels it can sound like harassment. Lead with "live coding game," "humans pretending to be AI," and "programming humor." Use "troll arena" only after the audience already understands the joke.

## Audience

Best early audiences:

- Developers who use ChatGPT, Claude, Cursor, Copilot, or other AI coding tools daily.
- Indie hackers and makers who enjoy small weird products.
- Programming humor communities.
- Dev Discord/Slack/Telegram groups where people can join at the same time.
- Chinese developer communities such as V2EX, Jike, WeChat groups, and indie maker circles.

Weak early audiences:

- Generic consumer tech audiences. They may not understand the Copilot joke.
- Paid ads. Real-time matching makes cold paid traffic inefficient until retention and empty-room handling are stronger.
- Broad AI business communities. They may expect productivity instead of play.

## Pre-Launch Checklist

Do these before posting to any large channel:

- Have 2-3 friends online as copilots for the first 60 minutes.
- Test the full human-first and copilot-first flow in production.
- Confirm the site works without login and the first screen explains the two roles quickly.
- Prepare one 10-15 second GIF or video.
- Prepare one square screenshot and one wide screenshot.
- Keep Discord open and ready to answer questions.
- Decide a launch window when you can stay online for 2-3 hours.
- Add or manually track UTM/ref sources.

Suggested source links:

| Channel | Link |
| --- | --- |
| X/Twitter | `https://codingplane.me/?utm_source=x&utm_medium=social&utm_campaign=soft_launch` |
| V2EX | `https://codingplane.me/?utm_source=v2ex&utm_medium=community&utm_campaign=soft_launch` |
| Jike | `https://codingplane.me/?utm_source=jike&utm_medium=social&utm_campaign=soft_launch` |
| Show HN | `https://codingplane.me/?utm_source=hackernews&utm_medium=community&utm_campaign=show_hn` |
| Reddit | `https://codingplane.me/?utm_source=reddit&utm_medium=community&utm_campaign=soft_launch` |
| Product Hunt | `https://codingplane.me/?utm_source=producthunt&utm_medium=launch&utm_campaign=product_hunt` |

## Launch Timeline

### Day -3: Package The Story

- Record a 10-15 second demo:
  - Human asks: "How do I center a div without crying?"
  - Copilot receives the prompt.
  - Copilot accepts.
  - Copilot replies with a fake-AI answer.
  - Human sees the answer and exports a screenshot.
- Create a short "why I made this" note.
- Prepare the posts below, but rewrite each one in your own voice before publishing.

### Day -2: Seed Testers

- Invite 10-20 friends privately.
- Ask them to join one scheduled 30-minute play window.
- Watch for empty-room confusion, slow matching, unclear buttons, and bad mobile layout.
- Collect the funniest screenshots and rough feedback.

### Day -1: Warm Up

- Post a tiny teaser without a link:
  - "I built a site where humans pretend to be AI copilots. It is either brilliant or deeply stupid. Launching tomorrow."
- Ask 3 friends to be online during launch, not to upvote anything.
- Prepare answers for common questions:
  - Is it AI? No, it is real humans pretending to be AI.
  - Do I need an account? No.
  - Is chat saved? History is local in the browser.

### Day 0: Chinese Soft Launch

Start with friendlier communities where you can explain the joke:

- Jike.
- WeChat groups.
- V2EX "分享创造".
- Personal X/Twitter.

Goal: get real usage and bug reports, not maximum exposure.

### Day 1: Show HN

Post only if production is stable and people can actually try it. Keep yourself online for comments.

### Day 3: Reddit

Post slowly and transparently. Pick one subreddit first. Do not mass-post the same link everywhere.

### Week 2: Product Hunt

Launch after you have:

- A good GIF/video.
- A clear maker comment.
- A few real screenshots.
- A stronger empty-room fallback or scheduled "play now" window.

## Platform Notes

### Hacker News / Show HN

Official rules that matter:

- Show HN is for something people can actually try.
- Early-stage projects are okay.
- Make it easy to try without signup.
- Do not ask friends to upvote or comment.
- HN comments should be human conversation, not AI-pasted text.

Suggested title, rewritten if needed:

```text
Show HN: CodingPlane - a live game where humans pretend to be AI copilots
```

First comment outline. Do not paste this verbatim on HN; rewrite it yourself:

```text
I built CodingPlane because AI coding assistants are useful, but the interaction pattern is also funny: we ask them very human questions and accept very strange answers.

The site turns that into a real-time 1v1 game. One player asks a programming question as the human. Another player receives it as the copilot, accepts or skips, and then tries to answer like an AI.

There is no signup. The matcher is in-memory, using SSE for push updates. I am currently running it as a single Railway instance.

I would love feedback on whether the first-time flow is clear, whether matching feels too empty, and what would make a round funnier.
```

HN reply posture:

- Be technical and honest.
- Answer architecture questions clearly.
- Do not defend every design choice.
- Thank people for bug reports and ship fixes quickly.
- Do not mention votes, rankings, or "front page."

References:

- https://news.ycombinator.com/showhn.html
- https://news.ycombinator.com/newsguidelines.html

### Product Hunt

Use Product Hunt after the soft launch, not before it.

Fields:

- Name: `CodingPlane`
- Tagline: `A live coding game where humans pretend to be AI copilots`
- Topics: Developer Tools, Games, Artificial Intelligence, Social Networking
- Website: `https://codingplane.me/?utm_source=producthunt&utm_medium=launch&utm_campaign=product_hunt`

Short description:

```text
CodingPlane is a real-time 1v1 game for developers. One player asks a coding question, and a stranger answers while pretending to be an AI copilot. No signup, instant play, weirdly human.
```

Maker comment draft:

```text
Hey Product Hunt, I built CodingPlane as a tiny experiment around AI coding culture.

The game is simple: one person asks a programming question, another person receives it as the "copilot" and has to answer like an AI. Every round pairs you with a fresh stranger.

I wanted it to feel like a terminal-native party game for developers: fast, anonymous, and a little chaotic.

I would love feedback on the first-time experience, matching flow, and whether the joke lands.
```

Promotion rule:

- Ask people to visit, try it, and comment.
- Do not ask people to upvote.

Reference:

- https://www.producthunt.com/launch

### Reddit

Reddit is high-risk for self-promotion. Use it only where you already understand the culture.

Possible subreddits:

- `r/SideProject`
- `r/webdev`
- `r/InternetIsBeautiful`
- `r/programminghumor`
- `r/indiehackers`

Before posting:

- Read the subreddit rules.
- Search for recent "I built" posts and see what survives.
- Be transparent that you made the site.
- Do not use multiple accounts.
- Do not ask for votes.
- Do not mass-post the same text.

Draft:

```text
I built a tiny real-time game where developers pretend to be AI copilots

The premise is simple: one player asks a programming question, and a stranger receives it as the "copilot" and tries to answer like an AI.

No signup, just a weird little live experiment around AI coding culture:
https://codingplane.me/?utm_source=reddit&utm_medium=community&utm_campaign=soft_launch

I made this mostly to see whether the interaction is funny when both sides know a human is behind the curtain. Feedback welcome, especially on whether the first-time flow makes sense.
```

References:

- https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam
- https://www.reddit.com/r/reddit.com/wiki/selfpromotion/

### V2EX

Suggested node:

- `分享创造`
- Maybe later: `程序员`

Title:

```text
[分享创造] 做了个程序员实时小游戏：真人假装 AI Copilot 回答你的问题
```

Body:

```text
做了个小网站 CodingPlane：
https://codingplane.me/?utm_source=v2ex&utm_medium=community&utm_campaign=soft_launch

玩法很简单：

一个人像平时问 AI 一样提编程问题，另一个真人会收到这个问题，然后假装成 Copilot 回答。

不用注册，打开就能玩。每一轮都是随机陌生人。

我自己觉得这个点好玩的地方是：现在大家每天都在问 AI 编程问题，但如果把 AI 背后的那个“模型”换成一个正在憋笑的人类，整个交互会突然变得很荒诞。

目前还是早期版本，最想听大家反馈：

- 第一次进来能不能看懂怎么玩？
- human / copilot 两个角色清楚吗？
- 等待匹配时会不会困惑？
- 有没有明显 bug？

如果你正好打开的时候没人接单，可以喊朋友一起开两个窗口试试。
```

Reply posture:

- V2EX users often give direct product feedback. Do not over-explain.
- If someone says "没意义", ask what would make the first round more fun.
- If someone reports a bug, reply with a fix note after shipping.

### Jike / WeChat / Small Groups

Use a more casual version:

```text
我做了个很怪的程序员小游戏：CodingPlane。

你可以像平时问 AI 一样提一个编程问题，但对面其实是另一个真人在装 Copilot。

不用注册，打开就能玩：
https://codingplane.me/?utm_source=jike&utm_medium=social&utm_campaign=soft_launch

最好两三个人同时在线玩，不然实时匹配会有点空。欢迎帮我试试这个笑点到底成不成立。
```

Small group ask:

```text
我今天晚上 9:30-10:30 会在站上当 copilot，想找几个人来问奇怪的编程问题，帮我测一下实时匹配和回复流程。
```

### X / Twitter

Post 1:

```text
I built CodingPlane: a tiny live coding game where one human asks a programming question and another human has to pretend to be an AI copilot.

No signup. Instant play. Very stupid in the best way.

https://codingplane.me/?utm_source=x&utm_medium=social&utm_campaign=soft_launch
```

Post 2:

```text
What if ChatGPT was just a random developer trying to sound confident?

That is basically CodingPlane.

Ask a coding question. A stranger answers as your fake AI copilot.

https://codingplane.me/?utm_source=x&utm_medium=social&utm_campaign=soft_launch
```

Post 3, after collecting screenshots:

```text
The best part of CodingPlane so far is watching humans accidentally become more AI than AI.

I collected a few cursed fake-copilot replies here:
[attach screenshots]

Play: https://codingplane.me/?utm_source=x&utm_medium=social&utm_campaign=screenshots
```

## Direct Outreach

Send to friends who are developers:

```text
I launched a tiny dev game and need a few real humans online at the same time.

The joke: one person asks a programming question, another person pretends to be an AI copilot and replies.

Can you try one round today? It takes 2 minutes:
https://codingplane.me/?utm_source=direct&utm_medium=dm&utm_campaign=soft_launch
```

Send to indie maker friends:

```text
I shipped a weird little real-time game for developers and I am trying to validate whether the loop is actually fun.

Could you try one round and tell me where you got confused?
https://codingplane.me/?utm_source=direct&utm_medium=dm&utm_campaign=soft_launch
```

Do not send more than one follow-up unless they reply.

## Demo Asset Script

Record a 10-15 second clip:

1. Split screen: human left, copilot right.
2. Human opens `codingplane.me` and chooses HUMAN.
3. Copilot chooses COPILOT and starts waiting.
4. Human asks:

```text
How do I fix "undefined is not a function" without deleting the whole project?
```

5. Copilot receives the prompt and clicks accept.
6. Copilot replies:

```text
Certainly. First, blame JavaScript. Then check whether the thing you are calling is actually a function, which is unfortunately required by most runtimes.
```

7. Human sees reply and exports screenshot.

Caption:

```text
Ask a coding question. A stranger pretends to be your AI copilot.
```

## Metrics To Watch

If analytics are available, track these events:

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

Most important funnels:

- Visitor -> role selected.
- Human prompt submitted -> copilot received.
- Copilot received -> accepted.
- Accepted -> reply sent.
- Round completed -> screenshot exported.

Manual spreadsheet columns:

- Date.
- Channel.
- Link used.
- Visitors.
- Prompts submitted.
- Completed rounds.
- Discord joins.
- Bugs reported.
- Best quote/screenshot.

## Weekly Operating Loop

Monday:

- Review metrics and top bug reports.
- Pick one product fix and one distribution task.

Tuesday:

- Ship the product fix.
- Post one screenshot or short clip.

Wednesday:

- Reach out to 5 relevant developers or makers for feedback.

Thursday:

- Try one community post.
- Stay online for the first hour after posting.

Friday:

- Publish a short "what I learned this week" build-in-public post.

Weekend:

- Run one scheduled play window with friends/community.

## Things Not To Do

- Do not buy traffic before the real-time matching loop is strong.
- Do not ask for upvotes on HN, Product Hunt, or Reddit.
- Do not create fake accounts or ask friends to pretend to be random users.
- Do not mass-DM people.
- Do not over-position it as a serious AI tool.
- Do not hide that you built it.
- Do not post to many Reddit communities with the same copy.
- Do not use "troll" as the first word in channels that do not know the product.

## Next Product Tweaks That Help Promotion

High-impact:

- Add "people online now" or "copilots waiting" if technically safe.
- Add a "bring a friend" link when no copilot is online.
- Add a scheduled "play window" banner during launches.
- Add a one-click share after a funny completed round.
- Add example prompts for humans who freeze on first use.

Nice-to-have:

- Public gallery of curated, non-sensitive funny rounds.
- Daily prompt challenge.
- "Was this human or AI?" guessing mode.
- Lightweight leaderboard for funniest copilot replies.

## Simple Launch Checklist

Use this before each larger push:

- [ ] Production deploy confirmed.
- [ ] Full round tested as human.
- [ ] Full round tested as copilot.
- [ ] 2-3 seeded copilots online.
- [ ] Demo GIF ready.
- [ ] UTM/ref link prepared.
- [ ] Discord/contact ready.
- [ ] You are available for 2 hours after posting.
- [ ] No asks for upvotes/comments in the post.
- [ ] Follow-up note ready for bugs and feedback.

