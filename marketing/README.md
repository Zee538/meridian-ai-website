# Meridian marketing agent

This is our version of the "reverse engineer a company's entire marketing strategy" setup from the reel
by @jens.heitmann (Nov 2026). It uses three systems, run from Claude Code in this repo:

1. **Marketing skills**: 40+ skills from [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills),
   including **reverse-engineer-marketing**. They're already installed in `.claude/skills/` (pinned copy, see `MARKETINGSKILLS-SOURCE.md`).
2. **Agent Reach**: gives Claude Code read access to Reddit, YouTube transcripts, X, Instagram, Facebook, GitHub and the web.
   It's a CLI, so **each person installs it on their own machine** (steps below).
3. **Marketing agent framework**: the `meridian-marketing-agent` skill in `.claude/skills/`. It merges (1) and (2) into one
   timeline and ranks plays by what we can ship this month.

All three read our context from `.agents/product-marketing.md`. **Fill in its TODO lines first**
(pricing, budget, team hours, channels, goal, competitors). The plays are only as good as that file.

## Folder map

| Path | What | Public? |
|---|---|---|
| `.agents/product-marketing.md` | Who we are, who we sell to, budget and channels | No (blocked in `netlify.toml`) |
| `.claude/skills/` | Marketing skills + `meridian-marketing-agent` | No |
| `marketing/competitors.md` | Who to tear down next | No |
| `marketing/teardowns/<domain>/` | Each run: `playbook.md`, `plays.md`, CSVs, `reach/` raw data | No |
| `marketing/content/` | Scripts and posts written from plays | No |

This repo is also the live website (Netlify publishes the repo root). The three redirect rules at the bottom of
`netlify.toml` return 404 for `/marketing/*`, `/.claude/*` and `/.agents/*`. Don't remove them.

## One-time setup (each team member)

1. Install [Claude Code](https://claude.com/claude-code) and open this repo in it. The skills load automatically.
2. Install Agent Reach. In Claude Code, paste:
   ```
   Install Agent Reach: https://raw.githubusercontent.com/Panniantong/Agent-Reach/main/docs/install.md
   ```
   - Only use the GitHub install. The PyPI package named `agent-reach` is a different project.
   - GitHub, YouTube and web work right away. For Reddit, X, Instagram or Facebook, say "add reddit" and so on.
     Login channels copy that site's login from Chrome. **Use a secondary or business account, not your personal one.**
   - It's read-only: it never posts, likes or messages.
3. Optional: connect Search Console / GA4 so the teardown can compare their numbers with ours (`.claude/skills/analytics`, `tools/SETUP.md` in the upstream repo).

## Running it

In Claude Code, from this repo:

```
run the marketing agent on <competitor-domain>
```

It will:
1. Ask for anything still TODO in `.agents/product-marketing.md`.
2. Run **reverse-engineer-marketing** (Quick mode by default, $0). It pauses between stages and quotes any paid data calls before making them.
3. Pull audience reaction with **Agent Reach**.
4. Merge both into `marketing/teardowns/<domain>/plays.md`, ending with the **top 3 plays**, each with dated proof and a build task.
5. Ask which build task to start, for example a comparison page on the site, a short-form video series, or an outreach sequence.

Other useful asks:
- "What content is working for <competitor> on TikTok?" runs Content mode only.
- "Landscape of AI receptionist companies in the Caribbean" compares 3 to 5 at once.
- "Watch <domain>" runs the monthly diff of new moves.
- Any single skill by name: "use the video skill to script 5 reels about missed calls".

## Ground rules

- Evidence is labeled **Observed / Inferred / Not found**. Nothing gets invented. That includes our own results: only Royalty Prep and the /demo are proof points until clients approve more.
- No signing up, booking demos or sending enquiries to competitors without a person approving each one, under our real name.
- Study companies, not people. No lists of a competitor's customers or followers.
- Nothing gets published, posted or sent without a person's go-ahead.

## Making videos like the reel itself

The reel is a good format for us too. Format breakdown (two parts, 36s + 27s, 9:16):

| Beat | Time | What's on screen |
|---|---|---|
| Hook: contrast | 0–5s | Face to camera, bold caption: "Most people know X… but what most people **don't** know is Y" |
| Promise | 5–9s | "Here are the three systems you need to…" with a title bar pinned at top |
| Save/share CTA, early | 9–13s | Split screen: save and share icons with a hand pointer. "Save and share this straight to your Claude Code" |
| Proof, ×3 | 13s–end | Top half is a screen recording (repo, star count, prompt); bottom is a small face cam with word-by-word captions |
| Close | last 5s | Back to full face: "the people using this are farther and farther ahead every day" |

Meridian versions to script (use the `video` and `social` skills, saving to `marketing/content/`):
1. "Most Bahamian businesses know they miss calls. What most don't know is an AI receptionist can answer the routine ones after hours and pass the rest to your team." Screen: the voice agent demo.
2. "Three systems every Nassau clinic needs so no enquiry is lost": voice agent → Messenger bot → follow-up workflow. Screen: /demo dental flow.
3. "We reverse-engineered how the fastest-growing AI agencies market themselves. Here's what we're copying." This one comes from the first teardown's `plays.md`.
