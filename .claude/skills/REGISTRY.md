# Skill Registry (auto-generated)

> Generated: `2026-07-06T19:12:59.489Z`
> Generator: `bun scripts/build-skill-registry.ts`
> Protocol: `.claude/skills/agentic-qa-core/references/skill-resolver.md`

This file is the per-session compact-rules cache for the Skill Resolver protocol.
The orchestrator copies one or more `## Skill: <slug>` blocks below into every subagent briefing under `## Project Standards (auto-resolved)`.
Subagents trust those compact rules and only read the full SKILL.md when explicitly instructed.

Skills indexed: 25

---
## Skill: acli

**Purpose**: Atlassian CLI (official `acli` binary, v1.3+ as of 2026) for Jira Cloud, Confluence Cloud, and org admin tasks from the terminal.

**Compact Rules**:
- **Silent pagination truncation.** `workitem search` without `--paginate` returns the first page only — no warning. Scripts that count or iterate keys read the wrong number of items.
- **Auth is per-product.** `acli jira auth login` does not authenticate `acli admin`, `acli confluence`, or `acli rovodev`. There is also a top-level `acli auth` for global OAuth (newer surface). Each scope has its own session.
- **The "work item" vs "issue" split.** The CLI renamed commands (`jira issue` → `jira workitem`) but the JSON response still has a top-level `issues[]` array and CSV inputs still use `issueType`/`parentIssueId` spellings. Mixing old and new terminology in the same script works, but confuses readers.
- **Unknown subcommands fail silently.** Typing `acli jira workflow --help` does NOT error — it falls back to `acli jira --help` with exit 0. So "no error" ≠ "command exists". Always verify by checking the help body actually changed.
- **Hard limits the docs do not advertise.** `acli` cannot list custom fields, edit custom-field values on existing items, manage workflows, manage issue types, or touch project versions/components. See `references/gotchas.md`.
- Read `complementary_categories` from this skill's frontmatter (`issue-tracker`).
- Resolve via the host repo's skill-registry cache (`.claude/skills/REGISTRY.md`, built by `scripts/build-skill-registry.ts`). Fallback: scan the session-start `system-reminder` skill list.
- Apply the threshold rule per the host repo's skill-composition strategy doc (T1 / T3 silent; T4 ASK).
- The Atlassian MCP fallback documented below is OPT-IN, not a skill — enable manually via `docs/mcp/`.
- `acli` binary is not installed in the environment.
- `acli` auth fails and cannot be fixed in the current session.
- The operation is one of the documented `acli` blind spots: enumerate custom fields, edit custom-field values on existing work items, manage workflows / issue types / priorities / resolutions / project versions / components, upload attachments, add watchers, add an item to a sprint.
- Bulk operations (acli consumes far fewer tokens per call).
- Scripting / CI pipelines.
- Operations that return large result sets (MCP payloads inflate token usage).
- (truncated — read full SKILL.md for the rest)

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/acli/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: agentic-qa-core

**Purpose**: Foundation skill that hosts shared references cited by other workflow skills (briefing template, dispatch patterns, orchestration doctrin...

**Compact Rules**:
- agentic-qa-core/references/briefing-template.md
- agentic-qa-core/references/dispatch-patterns.md
- Create or modify any files. It is a passive reference library.
- Create or modify `.context/` files (that belongs to `/project-discovery`).
- Generate or scaffold tests, fixtures, or KATA components (that belongs to `/adapt-framework` and `/test-automation`).
- Adapt the framework to a specific stack (that belongs to `/adapt-framework`).
- Sync AI-critical documents or project-specific facts in `CLAUDE.md` (that belongs to `/sync-ai-memory`).
- Sync OpenAPI / API schemas (that's `bun run api:sync`).

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/agentic-qa-core/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: agentic-qa-onboard

**Purpose**: Walks new users through this repo's QA flow — Playwright + KATA + Allure + Xray stack, Jira QA workflow (Backlog → Shift-Left QA → Estima...

**Compact Rules**:
- **Speak like a human, not a terminal.** For the whole explanation, **suspend any compressed / caveman register** — full sentences, warm tone, simple words, zero unexplained jargon. Define each technical term the first time you use it ("an ATC — basically one complete test case, start to finish"). This is an explicit in-skill override of the default register; resume your normal style once the person is oriented.
- **Mirror the user's language.** Spanish in → explain in Spanish. English in → explain in English — but note that the visual decks ship in Spanish only (technical terms stay in English inside them).
- **Start from where they are.** If the goal is unclear, ask ONE quick question ("are you trying to test a ticket, or understand the whole flow?"). Don't dump all six stages on someone who asked about one.
- **Concept first, in plain words** — what the activity is and *why* it matters — before any command, flag, or file path.
- **Then offer the visual presentation.** Each workflow skill has a `how-it-works` deck that walks the skill's workflow step by step: a cover slide, a full workflow map (main path + adjacent paths), then one phase per slide with the craft concepts embedded where they apply. Offer to open it in their browser — follow the opening protocol below.
- **Hand off when oriented.** Once they know which skill to call, point them at it and step back.
- **Announce + ask.** "I can open a short visual deck that walks through how `/sprint-testing` works — the full workflow map first, then each phase step by step. Want me to open it in your browser?"
- **Decks are Spanish-only** (`.es.html`). If the user speaks English, mention the deck is in Spanish (technical terms stay in English) before opening it.
- **On a yes, open exactly one deck** — published URL first; local file as offline fallback (pick the OS command for the user's platform):
- **One at a time.** Let the person watch and come back with questions before offering the next skill's deck. Do not batch-open several.
- **After it opens,** tell them the keys (`←` `→` to move, `S` for speaker notes) and offer to walk the slides together or answer questions as they go.
- **For "how does KATA work" / architecture questions,** also offer the interactive KATA Academy (`.../kata/`) — 8 interactive chapters, Spanish, presentation mode with the `P` key.
- Syncs the ticket from Jira via `bun run jira:sync-issues get <KEY> --include-comments` (canonical detailed read — `acli view` returns null for custom fields), then reads the materialized `.md` files.
- Loads the synced context from `.context/PBI/epics/EPIC-<KEY>-<slug>/stories/STORY-<KEY>-<slug>/` (Module = Epic; Jira-synced files are a read-only cache).
- Explores the relevant code in the target repo.
- (truncated — read full SKILL.md for the rest)

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/agentic-qa-onboard/SKILL.md` · phase: `bootstrap` · extraction strategy: B

---

## Skill: cavecrew

**Purpose**: Decision guide for delegating to caveman-style subagents.

**Compact Rules**:
- path:line — `symbol` — short note
- `cavecrew-investigator` returns site list.
- Main thread picks 1-2 sites, hands paths to `cavecrew-builder`.
- `cavecrew-reviewer` audits the diff.
- Don't use `cavecrew-builder` when you don't already know the file. Spawn investigator first or main thread will eat tokens passing context.
- Don't chain `cavecrew-investigator → cavecrew-builder` for a 5-file refactor. Builder will return `too-big.` and you'll have wasted a turn.
- Don't ask `cavecrew-reviewer` for "general feedback" — it returns findings only, no architecture opinions. Use `Code Reviewer` for that.
- Don't expect prose. Cavecrew output is structured, sometimes terse to the point of cryptic. If a human will read it directly, paraphrase.

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/cavecrew/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: caveman

**Purpose**: Ultra-compressed communication mode.

**Compact Rules**:
- lite: "Your component re-renders because you create a new object reference each render. Wrap it in `useMemo`."
- full: "New object ref each render. Inline object prop = new ref = re-render. Wrap in `useMemo`."
- ultra: "Inline obj prop → new ref → re-render. `useMemo`."
- wenyan-lite: "組件頻重繪，以每繪新生對象參照故。以 useMemo 包之。"
- wenyan-full: "物出新參照，致重繪。useMemo .Wrap之。"
- wenyan-ultra: "新參照→重繪。useMemo Wrap。"
- lite: "Connection pooling reuses open connections instead of creating new ones per request. Avoids repeated handshake overhead."
- full: "Pool reuse open DB connections. No new connection per request. Skip handshake overhead."
- ultra: "Pool = reuse DB conn. Skip handshake → fast under load."
- wenyan-full: "池reuse open connection。不每req新開。skip handshake overhead。"
- wenyan-ultra: "池reuse conn。skip handshake → fast。"
- Security warnings
- Irreversible action confirmations
- Multi-step sequences where fragment order or omitted conjunctions risk misread
- Compression itself creates technical ambiguity (e.g., `"migrate table drop column backup first"` — order unclear without articles/conjunctions)
- (truncated — read full SKILL.md for the rest)

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/caveman/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: caveman-commit

**Purpose**: Ultra-compressed commit message generator.

**Compact Rules**:
- `<type>(<scope>): <imperative summary>` — `<scope>` optional
- Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `build`, `ci`, `style`, `revert`
- Imperative mood: "add", "fix", "remove" — not "added", "adds", "adding"
- ≤50 chars when possible, hard cap 72
- No trailing period
- Match project convention for capitalization after the colon
- Skip entirely when subject is self-explanatory
- Add body only for: non-obvious *why*, breaking changes, migration notes, linked issues
- Wrap at 72 chars
- Bullets `-` not `*`
- Reference issues/PRs at end: `Closes #42`, `Refs #17`
- "This commit does X", "I", "we", "now", "currently" — the diff says what
- "As requested by..." — use Co-authored-by trailer
- "Generated with Claude Code" or any AI attribution
- Emoji (unless project convention requires)
- (truncated — read full SKILL.md for the rest)

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/caveman-commit/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: caveman-compress

**Purpose**: Compress natural language memory files (CLAUDE.md, todos, preferences) into caveman format to save input tokens.

**Compact Rules**:
- The compression scripts live in `scripts/` (adjacent to this SKILL.md). If the path is not immediately available, search for `scripts/__main__.py` next to this SKILL.md.
- From the directory containing this SKILL.md, run:
- The CLI will:
- detect file type (no tokens)
- call Claude to compress
- validate output (no tokens)
- if errors: cherry-pick fix with Claude (targeted fixes only, no recompression)
- retry up to 2 times
- if still failing after 2 retries: report error to user, leave original file untouched
- Return result to user
- Articles: a, an, the
- Filler: just, really, basically, actually, simply, essentially, generally
- Pleasantries: "sure", "certainly", "of course", "happy to", "I'd recommend"
- Hedging: "it might be worth", "you could consider", "it would be good to"
- Redundant phrasing: "in order to" → "to", "make sure to" → "ensure", "the reason is because" → "because"
- (truncated — read full SKILL.md for the rest)

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/caveman-compress/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: caveman-help

**Purpose**: Quick-reference card for all caveman modes, skills, and commands.

**Compact Rules**:
- Display this reference card when invoked. One-shot — do NOT change mode, write flag files, or persist anything. Output in caveman style.
- Mode stick until changed or session end.
- Say "stop caveman" or "normal mode". Resume anytime with `/caveman`.
- Default mode = `full`. Change it:
- **Environment variable** (highest priority):
- export CAVEMAN_DEFAULT_MODE=ultra
- **Config file** (`~/.config/caveman/config.json`):
- { "defaultMode": "lite" }
- Set `"off"` to disable auto-activation on session start. User can still activate manually with `/caveman`.
- Resolution: env var > config file > `full`.
- Full docs: https://github.com/JuliusBrussee/caveman

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/caveman-help/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: caveman-review

**Purpose**: Ultra-compressed code review comments.

**Compact Rules**:
- `🔴 bug:` — broken behavior, will cause incident
- `🟡 risk:` — works but fragile (race, missing null check, swallowed error)
- `🔵 nit:` — style, naming, micro-optim. Author can ignore
- `❓ q:` — genuine question, not a suggestion
- "I noticed that...", "It seems like...", "You might want to consider..."
- "This is just a suggestion but..." — use `nit:` instead
- "Great work!", "Looks good overall but..." — say it once at the top, not per comment
- Restating what the line does — the reviewer can read the diff
- Hedging ("perhaps", "maybe", "I think") — if unsure use `q:`
- Exact line numbers
- Exact symbol/function/variable names in backticks
- Concrete fix, not "consider refactoring this"
- The *why* if the fix isn't obvious from the problem statement

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/caveman-review/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: caveman-stats

**Purpose**: Show real token usage and estimated savings for the current session.

**Compact Rules**:
- This skill is delivered by `hooks/caveman-stats.js` (read by `hooks/caveman-mode-tracker.js` on `/caveman-stats`). The model does not need to do anything when this skill fires — the hook returns `decision: "block"` with the formatted stats as the reason. The user sees the numbers immediately.

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/caveman-stats/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: expert-panel-review

**Purpose**: Run a cross-functional expert panel (7 core domain experts + 4 process roles + 4 consultant roles) to refine patterns, Jira stories, QA a...

**Compact Rules**:
- Applying the former `expert-development-team-analysis` pattern.
- Refining another pattern before converting it into a skill.
- Reviewing Jira Story improvements before publication.
- Improving a workflow with cross-functional perspectives.
- Deciding whether a new learning should update Engram or a skill.
- Replacing domain skills such as `/shift-left-testing`, `/sprint-testing`, `/test-automation`, or `/test-documentation`.
- Rubber-stamping a decision already made without review.
- Creating permanent rules from a single unvalidated opinion.
- **Always activate**: Orchestrator, QA Lead, Engram Curator, Skeptical Reviewer.
- **Signal-driven activation**: Add domain experts only when their surface is in scope. Do NOT activate all 7 for every review — context efficiency matters.
- **Consultant roles**: Activate only when the explicit trigger fires. Deactivate after the review.
- **Security/AppSec is ALWAYS activated when**: the target touches auth, tokens, permissions, external integrations, user data, or API boundaries. This is non-negotiable for the Bunkai project (auth surface, Resend integration, workspace/member data).
- **Small-task minimum**: Orchestrator + QA Lead + Engram Curator + Skeptical Reviewer (4 roles).
- **Full panel**: All 7 core + relevant consultants (max 11 roles — but context budget usually limits to 5-7 active). |
- Start with recent memory context.
- (truncated — read full SKILL.md for the rest)

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/expert-panel-review/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: framework-development

**Purpose**: Framework evolution mode — evolves the QA boilerplate itself (KATA, fixtures, cli/, scripts/, api/schemas/ pipeline, package.json deps).

**Compact Rules**:
- `kata-manifest.json` — Component + ATC registry (source of truth per Critical Rule #12). Establishes what already exists before any new fixture API, Page, Api, Steps module, or ATC ID is proposed.
- `.claude/skills/test-automation/references/kata-architecture.md` + `.claude/skills/test-automation/references/typescript-patterns.md` — KATA layer flow (TestContext → ApiBase / UiBase → YourApi / YourPage → TestFixture), ATC identity rules, fixture-selection contract, import-alias conventions.
- `tests/components/` — current Api / Page / Steps shape; required reading when touching any L2 / L3 surface or adding a fixture consumed by these components.
- `cli/install.ts` — installer flow; required reading when evolving the installer, adding install steps, or modifying boilerplate scaffold behavior.
- `scripts/sync-openapi.ts` + `api/schemas/` — OpenAPI-derived TypeScript types pipeline; required reading when touching the API contract pipeline, schema generation, or any consumer of generated facades.
- `package.json` + `bun.lockb` — dep landscape; required reading before bumping Playwright / Bun / TypeScript / fixture-runtime versions or adding/removing scripts.
- **Plan artifact location**: `.session/framework-development/<change-name>/plan.md`. The `.session/` tree is gitignored — the plan is local, not committed. Recovery on mid-run crash: the file persists; the orchestrator reads it back on the next session via Phase 0 resume check (see `./session-management.md` §4).
- **Grace period for legacy path**: prior versions wrote to `.scratch/framework-changes/<change-name>/{plan.md, apply-progress.md}`. Phase 0 also checks the legacy path during the grace period — if found, the orchestrator offers to copy state to the new `.session/...` location before resuming.
- **Path guardrails injected per dispatch**: every Plan and Code subagent briefing MUST include the line `KATA invariants and ALLOWED/FORBIDDEN paths: .claude/skills/framework-development/references/kata-invariants.md (read §10 before touching any file).` Do NOT inline the path tables — the reference is authoritative.
- **On any subagent failure**: STOP, return the failing report, do NOT auto-rerun. The orchestrator decides retry / skip / abort. See `.claude/skills/agentic-qa-core/references/orchestration-doctrine.md`.
- **Strict TDD flag** is set in Phase 1's `plan.md` under §"Strict TDD flag". Default OFF. Flipped ON only when the user explicitly opted in. Code phase reads it from the plan; no separate cache needed.
- Read `references/kata-invariants.md` §10 (ALLOWED + FORBIDDEN paths).
- Ask the user (or infer from the request): "Which paths will this change touch?"
- For each path, look it up in §10 ALLOWED → proceed. Or §10 FORBIDDEN → abort and redirect to the skill named in the row.
- If a path matches neither table, ASK the user explicitly — never assume.
- (truncated — read full SKILL.md for the rest)

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/framework-development/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: git-flow-master

**Purpose**: End-to-end Git operator for any branching strategy.

**Compact Rules**:
- "I want to start work on UPEX-123" → branch creation
- "commit and push", "subir cambios", "push to main" → commit + push flow
- "abrí un PR contra staging" → PR creation
- "tengo conflictos al hacer pull" → conflict resolution
- "este PR va a quedar enorme" → chained-PR planning hand-off
- "qué estrategia de git usamos en este repo" → strategy detection / persistence
- "el push fue rechazado" → diagnostic + recovery flow
- Current branch.
- Dirty / clean working tree (staged / unstaged / untracked counts).
- Unpushed / unpulled commits (ahead / behind upstream).
- Upstream status (no upstream, up-to-date, diverged).
- Remote name(s) — most repos have one (`origin`); some have a fork + upstream.
- **`git_strategy:` block in `.agents/project.yaml`** — read it. If `git_strategy.strategy` is non-null (one of the eight slugs), it + `git_strategy.branches` (production / integration / ephemeral_pattern) + `git_strategy.decisions` (promote_method / feature_merge / hotfix_policy) ARE the persisted decision — use them. Each `git_strategy.decisions.*` field whose value is NOT `n/a`/empty means Strategy Setup SKIPS that question on re-run (idempotent — idempotency is keyed off the `git_strategy.decisions.*` fields, not markers). **Inherited-template guard:** the boilerplate ships the block FILLED (`strategy: solo-main`) and a scaffolded project INHERITS it verbatim (the scaffolder only patches `project.project_name` / `project.project_key`). So a non-null `git_strategy.strategy` is only authoritative when the project is actually onboarded. Read `project.project_name` in the SAME file: if `git_strategy.strategy` is non-null BUT `project.project_name` is `null`, the block was INHERITED from the template (not chosen for THIS project) — treat the strategy as UNCONFIRMED and route to the Bootstrap trigger's inherited case (it still operates under the inherited strategy if the offer is declined). If `project.project_name` is set, the block is confirmed → use it normally, no nudge.
- **Single-branch heuristic** — `git branch -a` shows only `main` (or `master`) and no integration branch in the remote → `solo-main`.
- **Two-branch heuristic** — exactly `main` (or `master`) + one of `{staging, dev, develop, integration}` exists upstream → `main-integration` (record the integration branch name).
- (truncated — read full SKILL.md for the rest)

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/git-flow-master/SKILL.md` · phase: `implementation` · extraction strategy: B

---

## Skill: git-flow-master-refinement

**Purpose**: Use alongside /git-flow-master when a dirty worktree needs expert staging classification before commit/push.

**Compact Rules**:
- Classifying dirty worktrees into atomic conventional commits.
- Reviewing modified + untracked files before staging.
- Separating product, test, docs, generated metadata, config, and tooling changes.
- Creating a commit plan with exact paths per commit.
- Flagging files that should stay unstaged or need user confirmation.
- Branch creation, commits, push, PR creation, conflict resolution, or strategy setup. Use `/git-flow-master` for those actions.
- Replacing `/git-flow-master` safety rules.
- Running destructive git commands or broad staging commands.
- `git status --porcelain` or `git status --short`
- `git diff --stat`
- Relevant `git diff -- <path>` for each changed group
- For untracked files, inspect content/type before recommending staging
- Classify by responsibility and outcome, not by directory alone.
- Identify the dominant change type per file cluster: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
- If supporting files exist only because of the dominant change, keep them in the same commit.
- (truncated — read full SKILL.md for the rest)

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/git-flow-master-refinement/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: judgment-day

**Purpose**: Trigger: judgment day, dual review, adversarial review, juzgar.

**Compact Rules**:
- `/test-automation` — Review phase for high-risk test changes
- `/git-flow-master` — pre-PR gate when the diff is large or touches shared fixtures / base classes
- `/framework-development` — pre-archive review of framework evolution diffs
- The diff / files / PR / architecture slice under review — the literal target the user named.
- `CLAUDE.md` — repo conventions, Critical Rules, behavioral layer (the judges must score against these, not generic best-practice).
- `.claude/skills/REGISTRY.md` — skill registry; resolve which project skills apply to the target's file paths + task type, and inject the same `Skills to load before work` block into both judge prompts.
- The change's spec / PR description / Jira ticket — the stated intent. Judges score against intent, not their imagined intent.
- `references/prompts-and-formats.md` — judge prompts, fix prompts, warning rubric, verdict table format.
- Prior judge outputs from earlier rounds (Round 2+ only) — to detect regressions or stale findings vs. new ones.
- Resolve project skills before launching agents: read skill registry, match skill paths by target files/task, and inject the same `Skills to load before work` block into both judge prompts and fix prompts.
- Launch **two blind judges in parallel** with identical target and criteria; never review the code yourself.
- Wait for both judges before synthesis; never accept a partial verdict.
- Classify warnings as `WARNING (real)` only if normal intended use can trigger them; otherwise downgrade to INFO as `WARNING (theoretical)`.
- Ask before fixing Round 1 confirmed issues.
- After any fix agent runs, immediately re-launch both judges in parallel before commit/push/done/session summary.
- (truncated — read full SKILL.md for the rest)

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/judgment-day/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: project-discovery

**Purpose**: Onboard a project to this testing boilerplate and generate the context files that every QA and automation session depends on.

**Compact Rules**:
- **Target project repo** — path resolved at session start (see "Before starting: target repo location" below). Read code and any in-repo PRD. This is the primary source of truth — discovery is reverse-engineering, never aspirational design.
- **Target repo's `README.md` and existing onboarding docs** — fastest path to project intent, stack signals, and run commands before deep code reads.
- **`.context/` directory** (if partial state exists from a prior discovery run) — informs Phase 0 resume decisions and prevents redundant work. Diff against current code before overwriting.
- **`.agents/project.yaml` and `.env.example`** — variable resolution patterns (`{{PROJECT_KEY}}`, env URLs, MCP names) that every downstream context file references.
- **`kata-manifest.json`** — registry of existing KATA Components + ATCs. Anchors what test surface the boilerplate already expects so discovery records gaps coherently.
- **`.claude/skills/agentic-qa-core/references/skill-composition-strategy.md`** — workflow context for downstream skill hand-offs (`/adapt-framework`, `/sprint-testing`, `/test-documentation`).
- **Business / domain docs supplied by the user** (Confluence, Notion exports, internal wikis) — secondary source for business model and glossary when in-repo signal is thin.
- Check `.session/project-discovery/progress.md`.
- If it does NOT exist → proceed to "Before starting: target repo location" below, then "Pick the scope first" (which writes `plan.md`).
- If it DOES exist:
- Read `plan.md` (chosen scope, target repo path, phase plan).
- Read tail of `progress.md` (last completed phase + next planned phase).
- Surface to the user: scope chosen, target repo, last completed phase, next phase, any open Discovery Gaps from the last entry.
- Offer **resume / restart / abort**. On `restart`, archive to `.session/.archive/<YYYY-MM-DD>-project-discovery-aborted/` before proceeding.
- **Project Connection** -- repo paths, tech stack detection, environment URLs, credentials from `.env`, team contacts.
- (truncated — read full SKILL.md for the rest)

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/project-discovery/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: regression-testing

**Purpose**: Execute regression test suites via CI/CD, analyze results, classify failures, and produce GO/NO-GO release decisions.

**Compact Rules**:
- `.github/workflows/*.yml` — workflow files for regression / smoke / sanity suites; defines triggers, inputs, and artifact uploads.
- `.context/master-test-plan.md` — regression Epic key + expected pass-rate SLOs per suite.
- `playwright.config.ts` — reporter config, retry policy, project matrix; needed to interpret retry counts and shard splits.
- Previous run's Allure report (artifact URL or local download under `./analysis/previous/`) — baseline for trend computation.
- `kata-manifest.json` — registry of tests and ATCs available; used to cross-reference failed test IDs.
- `.agents/jira-required.yaml` — Jira refs (project key, work types, transitions) for filing regression issues.
- `agentic-qa-core/references/defect-management-doctrine.md` — **canonical authority** for classifying (Bug/Defect/Improvement), the mandatory field matrix, QA-Assignee ownership, and the QA process epic when a confirmed regression is filed in Jira (Phase 3). Read BEFORE filing any defect.
- **Error protocol**: On any subagent failure: STOP, report full context to user, present retry / skip / abort options. Do NOT auto-fix. See `.claude/skills/agentic-qa-core/references/orchestration-doctrine.md`.
- Compute prospective `<scope>` = `<env>-<YYYY-MM-DD>` from invocation context (env defaults to `{{DEFAULT_ENV}}`).
- Check `.session/regression-testing/<scope>/progress.md`.
- If it does NOT exist → proceed to suite selection + Phase 1 preflight + plan.md write.
- If it DOES exist:
- Read `plan.md` (captured `suite`, `env`, `workflow_file`, `RUN_ID` if Phase 1 already triggered).
- Read tail of `progress.md`.
- If `RUN_ID` is present AND `progress.md` last entry is `Phase 1 — Trigger — status: completed` but Monitor entry is missing/failed: surface the option to **re-attach** to the existing `RUN_ID` via `gh run view <RUN_ID> --json status,conclusion` instead of re-triggering. This is the high-value resume case.
- (truncated — read full SKILL.md for the rest)

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/regression-testing/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: shift-left-refinement

**Purpose**: Refine a single Jira Story before development into an Ely-style shift-left package: evidence, scope, expert decisions, refined ACs, risks...

**Compact Rules**:
- Story detail via `bun run jira:sync-issues get <STORY_KEY> --include-comments`, then read the synced Markdown. If sync fails but `acli jira workitem search --jql "key = <STORY_KEY>"` can prove the issue exists and is a Story, continue with `acli` fallback for standard fields, labels, description, comments, and links. Never use `acli view` as proof that custom fields are absent; label custom-field evidence as unavailable and avoid repeated sync retries.
- Story title, description, ACs, scope, business rules, source spec, labels, status, points, parent epic, and comments.
- Parent epic/module context when dependencies matter.
- `.context/business/*` and `.context/master-test-plan.md` when product/domain/test scope is unclear.
- Relevant Engram memories for prior pattern learnings: `BK-2`, `BK-18`, `BK-27`, `BK-28`, `BK-32`, `BK-34`, `BK-38`, `BK-91`, `Ely-style`, `shift-left-workflow-pattern`, `QA Handoff Mirror`, `story points`.
- When publishing or auditing existing publication, read live Jira evidence directly too: REST `GET /issue/<KEY>?fields=description,labels,status,<candidate fields>`, `/editmeta`, comments, and changelog. Synced Markdown is useful but not authoritative for rich-text custom fields when cached field catalogs drift.
- Jira publishing rules when writing rich text: author Markdown, convert to ADF, then verify rendered/read-back content.
- Jira/source evidence conflicts.
- The decision changes product scope, user promise, security posture, data retention, billing, compliance, or rollout risk.
- The implementation has two materially different architectures and repo/Jira evidence does not favor one.
- The user explicitly asks not to decide on behalf of PO/Dev.
- ACs are the floor. Push beyond happy path into boundaries, exceptions, states, and anomalies.
- 1:N is the default for non-trivial ACs. Derive scenarios through equivalence partitions, BVA, state transitions, decision tables, or pairwise. If an AC maps to one scenario, justify why it is trivially atomic.
- Avoid padding. Every added AC, edge case, and ATP row must explore a distinct risk or contract.
- Any `Expert Decision` that changes user-visible behavior, API/data contract, permission behavior, default filtering, validation, or error semantics must appear in the canonical refined ACs, not only in ATP, mirror, or description. If the decision is only in ATP/mirror, the package is incomplete.
- (truncated — read full SKILL.md for the rest)

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/shift-left-refinement/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: shift-left-testing

**Purpose**: Orchestrates pre-sprint Shift-Left QA on a batch of backlog Stories.

**Compact Rules**:
- ACs are the FLOOR. Refinement's job is to push past the happy-path contract: surface the boundaries, exceptions, states, and anomalies the Story is silent on.
- 1:N is the default: a non-trivial AC implies multiple outlines (valid partition + each distinct invalid + boundaries + states). A 1-outline AC requires a written "trivially atomic" justification — never the default.
- Tag each refinement gap to a technique: ranges/limits → BVA; status/lifecycle fields → State-Transition; 2+ interacting conditions → Decision Table; 3+ combinable factors → Pairwise.
- A refined AC (Given/When/Then) is the business assertion; the outline (`Should <behavior> <condition>`) is its exploration. Keep them distinct.
- Stories ONLY (no bugs — nothing to refine upstream). Entry status Backlog / Shift-Left QA / Estimation / Ready For Dev.
- Output = refined ACs + gap/ambiguity questions + ATP DRAFT (outline NAMES + coverage estimate, no test code, no execution).
- The heart of the skill (Phase 2) = edge cases not in story + ambiguities + gaps — feed them to PO/Dev as questions AND as derived outlines.
- On taking a Story into refinement (first QA pickup), set `qa_assignee` to self — read-before-write, never overwrite an existing owner (`agentic-qa-core/references/defect-management-doctrine.md` Part 2). This skill files NO Bug/Defect/Improvement; only the QA-Assignee hook applies.
- On completion: add label `shift-left-reviewed`; transition Backlog → Shift-Left QA → Estimation.

**Read full SKILL.md when**: running the batch grooming pipeline, writing the per-Story `shift-left-refinement.md`, or handling the PO/Dev handoff.

> Source: `.claude/skills/shift-left-testing/SKILL.md` · phase: `unknown` · extraction strategy: A

---

## Skill: sprint-testing

**Purpose**: Orchestrates in-sprint manual QA per ticket across Stages 1 (Planning), 2 (Execution) and 3 (Reporting).

**Compact Rules**:
- AC-pass is the FLOOR, not the goal. Coverage = AC-conformance + risk-beyond-AC (boundaries, errors, states, anomalies). Never report "% of ACs verified" as completeness.
- 1:N is the default: explode every non-trivial AC into multiple cases (EP partitions + boundaries + states + contexts). Collapsing an AC to one case requires a written "trivially atomic" justification.
- Apply techniques by trigger: EP always; BVA wherever a range / limit / length / date-window exists; State-Transition for stateful entities; Decision Table when 2+ conditions interact; Pairwise when 3+ combinable factors (log the reduction); Error-Guessing charters for experience-based risk.
- A criterion is a business assertion; a test case is a concrete exploration of it. Run the Test-Design Checklist before finalizing the ATP.
- CLASSIFY before filing — stop hardcoding "Bug". **Bug** = affected feature already live above Staging (end-user visible); **Defect** = feature still pre-release (Staging or below), the normal output of sprint testing; **Improvement** = not a broken AC (an enhancement, or an under-specified/absent AC surfaced by a test-beyond-AC). Classification follows the FEATURE's lifecycle stage, not where the problem was found (Part 1).
- `qa_assignee` (`{{jira.qa_assignee}}`) = the authenticated session user (self-assign). Set it when a Story is TAKEN INTO TESTING (start_testing) and on every filed Bug / Defect / Improvement. NEVER-OVERWRITE an existing owner (read-before-write); distinct from the native dev `assignee` (Part 2).
- `components` (native, MANDATORY) = the affected product module/Epic, must pre-exist in the Jira Components module (Part 3).
- Three-axis model: **parent** = QA Defect Management process epic (`qa.qa_epics.defect_epic`, found-or-created — NEVER a product/dev epic, NEVER the Story); **issue link** = the source Story (traceability); **components** = product module (Part 4).
- `priority` (native) is auto-derived from `{{jira.severity}}` (critica→Highest, mayor→High, moderada→Medium, menor→Low, trivial→Lowest); override with a 1-line justification (Part 5.1).
- Three stages, always in order: Stage 1 Planning → Stage 2 Execution → Stage 3 Reporting. Hand off Stages 4/5/6 to `test-documentation` / `test-automation` / `regression-testing`.
- Jira is source of truth. Read tickets via `bun run jira:sync-issues get <KEY> --include-comments`, then the synced `.md`. NEVER `acli workitem view` for custom fields (returns `null`).
- Bugs run the veto + triage + risk-score decision tree BEFORE any ATP is written.
- Execution = smoke pass first, then trifuerza (UI/API/DB) exploration; capture evidence under the PBI folder.
- API testing = three-tool maneuver: OpenAPI MCP for schema (READ-ONLY) → `bun run api:login` for the token (→ `.auth/tokens.env`) → **curl** for authenticated requests. NEVER execute via the OpenAPI MCP. Canon: `agentic-qa-core/references/api-testing-doctrine.md`.
- Consult `domain-glossary.md` (if present) before authoring the ATP, refined ACs, and TC outlines.
- (truncated — read full SKILL.md for the rest)

**Read full SKILL.md when**: starting a sprint cold, resuming a session, or handling a bug-triage / batch-sprint flow not covered by the rules above.

> Source: `.claude/skills/sprint-testing/SKILL.md` · phase: `unknown` · extraction strategy: A

---

## Skill: sprint-testing-refinement

**Purpose**: Pre-sprint reconciliation layer between shift-left refinement and sprint-testing execution.

**Compact Rules**:
- **Over-planning**: ATP authored against a stale assumption → wasted Planning effort on TCs that don't reflect current state.
- **Under-execution**: ATP claims 25 TCs, only 19 get executed, quality posture is unclear (root cause: BK-27 ATP desync).
- A Story transitions to `Ready For QA` (or equivalent sprint-ready status).
- The Story has `shift-left-reviewed` label (dated <30 days) OR an `acceptance-test-plan.md` on disk.
- The user says "refine this for sprint", "pre-flight check", "QA intake", "before sprint-testing".
- `shift-left-refinement/SKILL.md` — shift-left output structure (this skill consumes its artifacts).
- `sprint-testing/SKILL.md` — ATP structure expected by Stage 1.
- `acli/SKILL.md` + `acli/references/adf-authoring-style.md` — Jira Bug field publishing, ADF panels/status lozenges, and live `editmeta` verification when a follow-up defect must be filed.
- Story via `bun run jira:sync-issues get <KEY> --include-comments` → `story.md`, `acceptance-criteria.md`, `acceptance-test-plan.md`, `comments.md`. Also scan `comments.md` for existing `QA Testing Complete`, `TEST RESULTS`, or prior ATR comments that must be preserved in the Stage 3 reporting handoff.
- `.context/PBI/epics/EPIC-<KEY>-<slug>/stories/STORY-<KEY>-<slug>/shift-left-refinement.md` — if it exists.
- `.context/PBI/epics/EPIC-<KEY>-<slug>/stories/STORY-<KEY>-<slug>/acceptance-test-plan.md` — ATP from shift-left or prior attempt.
- `.context/PBI/epics/EPIC-<KEY>-<slug>/stories/STORY-<KEY>-<slug>/context.md` — session notes from prior work.
- `.context/business/business-data-map.md`, `business-feature-map.md`, `business-api-map.md` — domain context.
- `.agents/project.yaml` — project identity, `{{PROJECT_KEY}}`, active environment.
- `.agents/jira-required.yaml` — Jira field slugs.
- (truncated — read full SKILL.md for the rest)

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/sprint-testing-refinement/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: test-automation

**Purpose**: Plan, write, and review automated tests following KATA (Component Action Test Architecture) on Playwright + TypeScript.

**Compact Rules**:
- "All ACs covered" is the FLOOR, not the success bar. The ATC set must also cover risk-beyond-AC: invalid/boundary inputs, auth/error paths, state transitions, and anomalies the AC is silent on.
- 1:N is the default: one AC maps to multiple ATCs. EP-merge collapses same-behavior inputs INSIDE one partition into a parameterized ATC — it must NEVER collapse across distinct partitions, boundaries, or states. BVA cases are required wherever a range/limit/length/date-window exists (EP alone misses off-by-one).
- Apply techniques by trigger: EP always; BVA on ranges/limits; State-Transition for stateful flows; Decision Table when 2+ conditions interact; Pairwise when 3+ combinable factors (log the reduction).
- Parametrize for artifact economy: same-behavior data variants → ONE parameterized `@atc` (fixture / data-factory rows iterated by the test) per partition, NOT N ATCs; split only when action / outcome / state differs. (Canon: doctrine §"Part 2.5".)
- An AC is the business assertion; an ATC is its concrete exploration (Precondition + Action + Assertions). Run the Test-Design Checklist before finalizing the plan.
- Plan → Code → Review, always in order. Only automate `Candidate` verdicts from `/test-documentation`.
- Fixture selection: API-only → `{ api }` (no browser); UI-only → `{ ui }`; hybrid → `{ test }`.
- ATC = atomic mini-flow; NEVER calls another ATC. Reusable chains → a Steps module.
- Max 2 positional params (3+ → object param). Locators inline (extract only at 2+ uses). Imports via aliases (`@api/`, `@schemas/`, `@utils/`) — no relative imports.
- Public methods fail fast; utilities silent-fail (return null). Validate against `kata-manifest.json` before adding components/ATCs (anti-duplication gate).

**Read full SKILL.md when**: writing KATA component code, choosing fixtures for a hybrid flow, or applying the Phase 3 review checklist.

> Source: `.claude/skills/test-automation/SKILL.md` · phase: `unknown` · extraction strategy: A

---

## Skill: test-documentation

**Purpose**: Analyze, prioritize, and document test cases in TMS (Jira/Xray) -- the bridge between manual QA and test automation.

**Compact Rules**:
- Documenting an AC→TC map is the FLOOR (≥1 TC per AC is a minimum, never a target). Coverage = AC-conformance + risk-beyond-AC; the TC set must include boundary / negative / state / anomaly cases the AC is silent on.
- 1:N applies to DERIVATION (consider many cases by technique), not to the REGRESSION repository. Only regression-worthy scenarios (Candidate/Manual) are persisted there; most are Deferred. jira-native: Stage 4 CREATES `Test`s for those only (Deferred = report-only). jira-xray: sprint `Test`s already exist (Stage 1) — Stage 4 PROMOTES the regression-worthy into the Test Plan + enriches them. Document because it will be re-run, never to hit a count.
- Apply techniques by trigger: EP always; BVA wherever a range/limit/length/date-window exists; State-Transition for stateful entities; Decision Table when 2+ conditions interact; Pairwise when 3+ combinable factors.
- Parametrize for artifact economy: same-behavior data variants → ONE Test (`Scenario Outline` + `Examples` rows) per partition, NOT N separate Tests; split only when action / outcome / status / state differs. (Canon: doctrine §"Part 2.5".)
- Cross-cutting characteristics (XSS, perf, a11y) deferred to app-level suites are an EXPLICIT handoff, not a silent drop — name the receiving suite or file the gap.
- Documents already-validated behavior only — not an exploration tool (exploration belongs to `/sprint-testing`).
- TC identity = Precondition + Action + verifiable outcome. Naming (TC): `{US_ID}: TC#: should <expected outcome> [<connector> <condition>] [given <precondition>]`; `Validate <feature>` is reserved for the GROUPING layer (Test Set summary / `describe()`). Reject `"Login test"`, `"Login - error"`, `"TC1: Test form"`.
- ROI formula → one of three verdicts per TC: Candidate (feeds test-automation), Manual, Deferred. Prioritize by risk.
- Cardinality: US→TC is 1:N; AC→TC is N:1 or N:M. Resolve TMS modality (Xray vs Jira-native) in Phase 0 before documenting.
- Bug-driven (GOLDEN RULE): not every bug is a regression TC, but a regression-worthy bug MUST end with a Test — REUSE the existing failed Test if it came from one, else CREATE one (both modalities). A non-qualifying bug is treated like a failed test → Deferred, no new Test.

**Read full SKILL.md when**: resolving TMS modality, computing ROI, writing Gherkin, or wiring US-ATP-ATR-TC traceability links.

> Source: `.claude/skills/test-documentation/SKILL.md` · phase: `unknown` · extraction strategy: A

---

## Skill: tickets-board-statuses

**Purpose**: Create a token-efficient PM/QA Jira board status report: shift-left candidates, user-worked Stories needing follow-up or sprint testing,...

**Compact Rules**:
- Finding unassigned Backlog Stories the user can take for `/shift-left-testing`.
- Finding user-worked `shift-left-reviewed` Stories that are Ready For QA for `/sprint-testing`.
- Listing the user's shift-left continuity without comment counts.
- Mapping formal or inferred dependencies that change next-work priority.
- Jira writes, assignments, transitions, labels, comments, or mutations.
- Full `/shift-left-testing` or `/sprint-testing` execution.
- Replacing `/acli`; this skill defines analysis and reporting, while `/acli` owns Jira CLI mechanics.
- Jira project key, board scope, or explicit JQL.
- Exact user comment author string, e.g. `jesusgpythondev`.
- Status names for Backlog and Ready For QA.
- Shift-left completion label, default `shift-left-reviewed`.
- Optional epic/product scope for dependency analysis.
- Use `assignee is EMPTY`, not `assignee = unassigned`.
- Use `--paginate` for every search that feeds decisions.
- Request minimal fields on searches: `key,parent,summary,status,priority,assignee,labels,updated,created,issuelinks` as needed.
- (truncated — read full SKILL.md for the rest)

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/tickets-board-statuses/SKILL.md` · phase: `unknown` · extraction strategy: B

---

## Skill: xray-cli

**Purpose**: Xray Cloud test management via `bun xray` CLI: create/list tests, manage test executions and plans, import JUnit/Cucumber/Xray JSON resul...

**Compact Rules**:
- Confirm the project is in Modality jira-xray. Resolution logic lives in `test-documentation/SKILL.md` §Phase 0.
- If the project is in Modality jira-native (no Xray plugin) -> **do not use this skill**. Instead, load `/acli` — TMS operations map to native Jira issues (see `test-documentation/references/jira-setup.md`).
- **Jira key**: `{{PROJECT_KEY}}-194` — resolved via Jira REST in-process. Requires Jira credentials configured (`auth login --jira-url --jira-email --jira-token` or the `JIRA_*` env vars).
- **Numeric Xray issueId**: `1042389` — used as-is, no resolution call.
- *Missing at Xray layer*: tests linked at the Jira layer but not registered with Xray. `--apply` re-attaches them.
- *Missing at Jira layer*: tests registered with Xray but without a Jira issuelink. Reported only — sync never auto-deletes.
- `~/.xray-cli/config.json` - Stored credentials and default project
- `~/.xray-cli/token.json` - Cached auth token (24h validity)
- `xray` binary is not installed in the environment.
- Auth cannot be completed in the current session.
- Operation is simple (single test status update, small query).
- Bulk test import (JUnit/Cucumber/Xray JSON).
- Backup / restore / large sync operations.
- Anything involving Test Plans or Test Executions at scale (xray-cli is far more complete).
- **X1.** NEVER call `bun xray ...` directly from workflow skills (`sprint-testing`, `test-documentation`, `test-automation`, `regression-testing`). Workflow skills use `[TMS_TOOL]` pseudo-code and load `/xray-cli` — only this skill owns the literal CLI syntax.
- (truncated — read full SKILL.md for the rest)

**Read full SKILL.md when**: the compact rules above are insufficient (e.g. novel scenario, debugging, or the briefing tells you to load the full skill).

> Source: `.claude/skills/xray-cli/SKILL.md` · phase: `unknown` · extraction strategy: B
