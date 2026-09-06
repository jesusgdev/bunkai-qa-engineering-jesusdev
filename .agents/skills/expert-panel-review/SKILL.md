---
name: expert-panel-review
description: "Run a cross-functional expert panel (8 core domain experts + 5 process roles + 4 consultant roles) to refine patterns, Jira stories, QA artifacts, workflow decisions, or skill drafts before implementation. Uses Applied Critical Thinking (Red Team Thinking) for the Skeptical Reviewer pass, Engram-based learning, and continuous capability coaching. Use when the user mentions expert-development-team-analysis, expert team, panel review, cross-functional review, refine this pattern, optimize this workflow, get experts to improve it, or asks for a self-improving Engram-connected review. The skill separates evidence from inference and converts validated learning into future improvements. Core experts: Senior PO, Senior UX/Design, Senior Technical Architect, Senior Developers (Staff/Principal), Senior QA Lead, Delivery/Scrum Lead, Senior Security/AppSec Engineer, and AI Governance/Model Risk."
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]
complementary_categories: [meta-skill, issue-tracker, testing-e2e, tms]
---

# Expert Panel Review

Use a focused cross-functional panel to improve a pattern, workflow, Jira artifact, or skill before execution. The panel should make the work clearer, more repeatable, more testable, and less ambiguous.

## Core Principle

The panel compounds experience through Engram, but it must not turn every idea into a permanent rule. Treat memory as evidence, not authority. Promote a learning into a rule only when it is validated by the user, repeated across sessions, or confirmed by an observable result. The panel must distinguish decision validation, knowledge retention, and capability development: the Skeptical Reviewer validates decisions, the Engram Curator maintains learning records, and the Expert Capability Coach improves the team's knowledge over time.

## Use This Skill For

- Applying the former `expert-development-team-analysis` pattern.
- Refining another pattern before converting it into a skill.
- Reviewing Jira Story improvements before publication.
- Improving a workflow with cross-functional perspectives.
- Deciding whether a new learning should update Engram or a skill.

## Do Not Use This Skill For

- Replacing domain skills such as `/shift-left-testing`, `/sprint-testing`, `/test-automation`, or `/test-documentation`.
- Rubber-stamping a decision already made without review.
- Creating permanent rules from a single unvalidated opinion.

## Expert Roles

Activate only roles that add signal. For small tasks, use Orchestrator, QA Lead, Engram Curator, and Skeptical Reviewer. Add the Expert Capability Coach when the task changes team knowledge, workflow, or skill behavior. The panel has two tiers: **Core domain experts** (8 roles — the persistent `expert-development-team-analysis` team persisted in Engram under topic `pattern/expert-development-team-analysis`) and **Process roles** (5 roles — orchestration, capability development, memory, and quality gates, not persisted as domain experts).

### Core Domain Experts (8 roles — activate by signal)

| Role | Use when | Contribution | Verified competency source |
|---|---|---|---|
| **Senior Product Owner** | User value, ACs, prioritization, ambiguity, scope trade-offs | Clarifies outcome, customer value, decision gaps. Applies WSJF + Kano + Cost of Delay for value-based prioritization. Distinguishes tactical vs strategic responsibilities. Bridges stakeholders without direct authority. Knowledge broker between business + dev. | Scrum Alliance CSPO + Advanced CSPO; Scrum.org PSPO |
| **Senior Product/UX Design** | User flow, discoverability, usability, accessibility | Evidence-based design decisions (not opinion). Principal-level: leads big initiatives + mentors juniors + has strategy seat. Core: prototyping, visual design, research, data analysis. AI-era: critique + context architecture. | Nielsen Norman Group UX Certification + UX Maturity Model (6 levels) |
| **Senior Technical Architect** | Technical feasibility, dependencies, system design, API/DB impact | Creates shared architectural understanding, evaluates trade-offs, identifies irreversible decisions, and defines acceptance criteria, observability, fallback, dependency, and reversibility constraints. | Martin Fowler; IEEE Software; ThoughtWorks |
| **Senior Developers (Staff/Principal)** | Implementation constraints, coupling, code-level risk, testability | Validates implementation feasibility, generated-code risks, coupling, production/test boundaries, dependency behavior, and the testability of proposed changes. | StaffEng; recognized engineering practice sources |
| **Senior QA Lead** | Always — converts ideas into risks, testability, gates, acceptance checks | Owns risk-based TEVV for deterministic and AI systems, including data, model, oracle, non-determinism, bias, drift, reproducibility, automation quality, and release evidence. | ISTQB CTAL-TM; ISTQB CT-AI v2.0; ISTQB CT-GenAI; ISO/IEC 25059 |
| **Delivery/Scrum Lead** | Readiness, blockers, dependencies, sequencing, SP calibration, sprint planning risk | Master in Scrum values + empiricism + Lean thinking. Converts complex analysis into Jira/sprint-ready actions. Agile Delivery Lead = technical work + tool building + process facilitation. Empowers delivery manager to take Scrum Master accountabilities. | Scrum.org PSM + PSK; Scrum Alliance CSM + A-CSM + CSP-SM |
| **Senior Security/AppSec Engineer** | Auth, permissions, sensitive data, external exposure, token scopes, API boundaries, AI agents | Applies secure design, SAST/DAST/SCA, STRIDE, OWASP application and agentic guidance, MITRE ATLAS, prompt-injection defenses, data/model supply-chain controls, agent identity, delegation, tool permissions, secret handling, and runtime detection. | OWASP; MITRE ATLAS; NIST SP 800-218A |
| **AI Governance / Model Risk / Responsible AI** (NEW) | AI systems, autonomous agents, decisions affecting people, regulated or sensitive data, external models, high-impact or irreversible actions | Classifies AI risk and impact, maintains accountability, defines human oversight, maps controls to Govern/Map/Measure/Manage, reviews privacy, transparency, bias, model and dataset inventory, release evidence, incident escalation, and permitted use. | NIST AI RMF; NIST SP 800-218A; ISO/IEC 42001; ISO/IEC 25059 |

### Process Roles (5 roles — orchestration, memory, capability development, and quality gates)

| Role | Use when | Contribution |
|---|---|---|
| Orchestrator | Always | Defines scope, chooses roles, keeps context small. |
| Workflow/Jira | Statuses, labels, comments, traceability, dependencies | Keeps Jira workflow reliable and auditable. |
| Engram Curator | Always | Retrieves high-signal memory, records decisions and learnings, classifies confidence, detects conflicts and obsolescence, and proposes memory updates. |
| Expert Capability Coach | At panel start and during scheduled capability reviews | Researches verified sources, compares them against current role knowledge, identifies obsolete or missing capabilities, designs calibration exercises, and proposes skill updates. It does not silently change permanent rules. |
| Skeptical Reviewer (Red Team) | Always at the end | Challenges assumptions, bloat, unvalidated rules, and automation bias. Returns `APPROVED`, `APPROVED_WITH_CONDITIONS`, `REJECTED`, or `ESCALATE_TO_HUMAN`. Applies Red Team Thinking (see § Critical Thinking Framework). |

### Consultant Roles (activate by trigger — not permanent panel members)

| Role | Trigger | Contribution | Verified source |
|---|---|---|---|
| **DevOps/SRE/Platform Engineer** | Environment readiness gates, CI/CD pipeline issues, deployment risk, infra-dependent stories | Validates deployment pipelines, SLO/SLI design, environment reachability, incident response. Triggered when story touches infrastructure, deployment config, or env-readiness is uncertain. | Google SRE Handbook (sre.google); DORA 2024 report; Atlassian engineering handbook |
| **Accessibility (a11y) Specialist** | Public-facing UI, WCAG/Section-508 compliance, legal exposure | WCAG conformance audits, ARIA validation, assistive technology testing. Triggered when story has UI surface + public reach + compliance risk. | IAAP CPACC/WAS certifications; Section508.gov roles; DigitalA11y |
| **Data Engineer/Analytics / MLOps** | Data pipelines, migrations, analytics features, DB schema changes, RAG, model or dataset lifecycle | Data quality, provenance, lineage, versioning, representativeness, privacy, schema validation, retraining controls, drift, reproducibility, and model/data lifecycle management. Triggered when story touches data ingestion, transformation, analytics, or AI data/model lifecycle. | NIST AI RMF; NIST SP 800-218A; ISO/IEC 25059 |
| **Performance Engineer** | Strict SLAs, scaling phases, latency-sensitive features, load testing | End-to-end performance testing, benchmarking, bottleneck identification. Triggered when story has performance requirements or scale risk. | Brendan Gregg (performance engineering authority) |

### Role Activation Rules

1. **Always activate**: Orchestrator, QA Lead, Engram Curator, and Skeptical Reviewer. Add Expert Capability Coach when the task changes team knowledge, workflow, or skill behavior.
2. **Signal-driven activation**: Add domain experts only when their surface is in scope. Do NOT activate all 8 for every review — context efficiency matters.
3. **Consultant roles**: Activate only when the explicit trigger fires. Deactivate after the review.
4. **Security/AppSec activation**: Required for authentication, authorization, secrets, sensitive data, external exposure, tool permissions, AI agents, or API boundaries with meaningful security impact.
5. **AI Governance activation**: Required for AI autonomy, decisions affecting people, regulated or sensitive data, external models, high-impact outcomes, irreversible actions, or material changes to prompts, models, datasets, or policies.
6. **Data/MLOps activation**: Required for training data, RAG, embeddings, model or dataset versioning, drift, retraining, data pipelines, or AI provenance.
7. **SRE/Platform activation**: Required for production operation, SLOs, availability, latency, cost, scaling, rollback, or runtime model monitoring.
8. **Panel size**: Prefer 4-7 active roles and record why every additional role adds signal. The theoretical composition is 8 core + 5 process + 4 consultants, but full activation requires explicit risk justification. |

## Engram Retrieval Loop

1. Start with recent memory context.
2. If signal is missing, run 2-3 targeted searches using pattern names, ticket keys, and domain terms.
3. Read full observations only for the top 1-3 relevant memories.
4. Extract at most 3-5 applied learnings for the current task.
5. Label each learning as `validated`, `candidate`, or `conflicting`.
6. If memories conflict, ask or judge before treating either as a rule.
7. Record decision, role, evidence, confidence, outcome, validation status, and review date for every durable learning.
8. Do not save a learning merely because a role participated. Save it only when it is new, useful, and supported by evidence.
9. The Engram Curator maintains the record; the Expert Capability Coach identifies patterns across records and proposes capability updates.

## Evidence Labels

Every recommendation should identify its source:

- `Engram`: prior project memory or user preference.
- `Repo`: codebase, skill, context file, or package script.
- `Jira`: observed ticket, status, comment, label, or field behavior.
- `External`: professional reference or public documentation.
- `Inference`: expert reasoning that still needs confirmation.

## Review Workflow

```text
1. Define target and success criteria.
2. Retrieve minimal Engram context.
3. Select expert roles.
4. Produce findings by role.
5. Merge findings into one optimized pattern or recommendation.
6. Run Skeptical Reviewer pass.
7. Separate accepted rules from learning candidates.
8. Produce a decision gate: `APPROVED`, `APPROVED_WITH_CONDITIONS`, `REJECTED`, or `ESCALATE_TO_HUMAN`.
9. Ask for approval before implementation or skill conversion.
```

## Improvement Criteria

A good panel recommendation improves at least one of these:

- Clarity: fewer ambiguous instructions.
- Repeatability: same input should produce comparable output.
- Traceability: decisions link back to evidence.
- Testability: output can be verified.
- Safety: risky assumptions are surfaced early.
- Context efficiency: high-signal memory without history dumps.

## Critical Thinking Framework (Red Team Thinking)

The Skeptical Reviewer role is enhanced with **Applied Critical Thinking (ACT)** from the US Army UFMCS Red Team Handbook and UK Ministry of Defense Red Teaming Guide. This is NOT ceremony — it is a mechanical set of techniques that surface blind spots the panel would otherwise miss.

### Core ACT Principles (apply during Skeptical Reviewer pass)

1. **Slow down** — engage System 2 thinking. Do not accept the first plausible recommendation.
2. **Ask "why"** — root-cause every assumption. "Why do we believe this AC is testable?" "Why do we believe this estimate is correct?"
3. **Seek alternatives** — for every recommendation, generate at least one alternative. If only one path exists, the panel has not explored enough.
4. **Identify assumptions + biases** — list every implicit assumption the panel made. Tag each as `validated`, `unvalidated`, or `conflicting` with Engram evidence.
5. **Generate + evaluate alternatives** — do not just find alternatives; score them against the same criteria.
6. **Groupthink mitigation** — if all panel members agree quickly, that is a signal to slow down, not to proceed. Quick consensus = unexamined assumptions.
7. **Mirror imaging reduction** — do not assume the user, developer, or external system thinks like the panel. Explicitly model the "other" perspective.

### Red Team Challenge Categories (run during Skeptical Reviewer pass)

| Category | Challenge | When to apply |
|---|---|---|
| **Architecture failure modes** | How might components interact unexpectedly? What happens at edge cases? What are data-flow corruption paths? | Every architecture/dev recommendation |
| **Production vs development** | What works in dev but breaks in prod? Load patterns, cascading failures, resource exhaustion, dependency reliability? | Every deployment/infra recommendation |
| **Human-AI interaction** | How might users game the system? Over-rely on it? Use it in ways that compound risk? | Every UX/feature recommendation |
| **AI assurance** | Are the model, dataset, prompt, tool, and evaluation assumptions measurable, reproducible, and monitored after release? | Every AI or agent recommendation |
| **Security and autonomy** | Can an agent exceed delegated authority, access secrets, misuse tools, or act without adequate identity and approval? | Every agent, tool-calling, or external-model recommendation |
| **Ecosystem** | Regulatory landscape? Competitive dynamics? Societal context? Downstream effects? | Every product/business recommendation |
| **Evidentiary** | Is the recommendation based on Engram evidence, repo code, Jira observation — or on inference? Tag every claim with its evidence label. | Every recommendation, always |
| **Reversibility** | Is this decision hard to reverse? If yes, does it warrant an ADR (Architecture Decision Record)? | Every architectural recommendation |

### The Three Cs (Red Team Thinking outcomes)

- **Clarity** — the panel's output is unambiguous and decision-ready.
- **Capability** — the panel has the skills + evidence to make the call.
- **Culture** — the panel rewards dissent, not consensus. A dissenting opinion is signal, not noise.

### Anti-patterns the Skeptical Reviewer MUST reject

- Recommendations that add roles, context, or ceremony without verifiable value.
- Recommendations based on a single unvalidated opinion (Engram `candidate` label, no user approval).
- Recommendations that assume "this time is different" without citing what changed.
- Recommendations that collapse 1:N ACs into 1:1 without a "trivially atomic" justification.
- Estimates that do not cite a calibration anchor (a prior comparable ticket).
- Decisions that claim correctness without defining how the decision will be verified after execution.

## Self-Improvement Safeguards

- Do not promote a learning into a skill rule unless it has user approval, repeated evidence, or observable success.
- Keep `learning candidates` separate from `rules`.
- Any change to required tools, permissions, Jira mutation behavior, or workflow status transitions needs explicit user approval.
- Prefer small changes with clear acceptance criteria over broad process rewrites.
- The Skeptical Reviewer must reject improvements that add roles, context, or ceremony without verifiable value.
- **Role-based learning**: after a successful panel review, the Engram Curator may save role-tagged learnings (e.g. `qa-lead`, `architect`, `appsec`) only when each learning is new, useful, and evidence-backed. The Expert Capability Coach may convert repeated validated learnings into training recommendations.
- **Evidence-label discipline**: every panel recommendation must carry an evidence label (`Engram` | `Repo` | `Jira` | `External` | `Inference`). Recommendations with `Inference` label cannot become rules without user validation.
- **Calibration anchors**: every estimate (story points, effort, risk score) must cite a prior comparable ticket as anchor. No anchor → flag as `unvalidated-estimate`.
- **Sources of truth**: combine the relevant live Jira evidence, QA/project documentation, product code, operational evidence, and verified external guidance before making recommendations. Do not require irrelevant sources, and never recommend from a single source when the decision has material risk.
- **Capability coaching**: when the Expert Capability Coach finds a potentially obsolete, weak, or missing capability, it must produce a source-backed proposal, impact assessment, calibration exercise, and validation criterion. It may not silently rewrite permanent skill rules.

## AI Risk Profile

For any review involving AI, record the following before selecting roles:

| Dimension | Values to assess |
|---|---|
| Autonomy | Advisory, recommender, operator, autonomous agent |
| Data | Public, internal, personal, sensitive, regulated |
| Impact | Low, operational, financial, legal, security, human |
| Reversibility | Reversible, recoverable, difficult to reverse, irreversible |
| Dependencies | First-party, external model, external tools, data or model supply chain |
| Oversight | Human review, human approval, automated control, no effective oversight |

Activate AI Governance, Security/AppSec, Data/MLOps, and SRE/Platform according to the resulting risk profile rather than by default.

## Lifecycle Quality Gates

When AI is in scope, the panel must address the applicable gates:

1. **Discovery**: purpose, impact, affected users, permitted use, and risk classification.
2. **Design**: data, threat model, permissions, fallback, observability, human oversight, and acceptance criteria.
3. **Implementation**: conventional tests, AI evaluation, oracle design, security controls, traceability, and reproducibility.
4. **Pre-release**: TEVV evidence, accessibility, security, performance, baseline drift metrics, rollback, and owner sign-off.
5. **Production**: quality, drift, incident, cost, latency, availability, and unauthorized-action monitoring.
6. **Post-release**: incident learning, evidence review, Engram update, and capability-coaching feedback.

## Output Contract

Use this format for pattern or skill refinement:

```markdown
## Expert Panel Review - <target>

### Executive Summary
<decision-ready summary>

### Evidence Used
| Source | Evidence | Confidence |
|---|---|---|

### Expert Findings
| Role | Finding | Recommendation | Source Label |
|---|---|---|---|

### Optimized Pattern
<rewritten or improved workflow/pattern>

### Open Questions
| Owner | Question | Expert Recommendation | Pending Confirmation |
|---|---|---|---|

### Skill Conversion Notes
- Trigger:
- Boundaries:
- Inputs:
- Output format:
- Quality gates:
- Engram updates:
- Capability coaching:
- Human approval required:

### Learning Candidates
- <candidate learning and validation needed>
- <candidate role or knowledge update with source, confidence, and validation criterion>
```

## Subagent Use

For complex reviews, launch expert subagents in parallel. Each subagent brief should include:

1. Goal.
2. Context docs or memories to read.
3. Project standards.
4. Skills to load, if any.
5. Exact instructions.
6. Report format.
7. Rules and boundaries.

Do not let subagents mutate Jira or files unless the user explicitly approved implementation.

---

## Post-Automation Review

> **Use for**: After batch automation completion — quality gate review.
> **Trigger**: After `/test-automation` batch processing completes.

### Review Scope

| Area | Check | Criteria |
|------|-------|----------|
| Test Coverage | Candidate scope mapped to automated coverage | Project-defined target met and exceptions documented |
| Architecture Compliance | Tests follow the applicable project architecture | No unexplained violations |
| Batch Safety | Batch processing is compliant with service limits | No unhandled rate-limit failures |
| Test Documentation | Required test metadata and descriptions are present | Project-defined schema satisfied |
| Traceability | Tests map to their configured parent, story, or requirement | All required links present |
| Naming | Tests follow the configured naming convention | Project-defined pattern satisfied |
| Quality | Tests are deterministic and meaningful | No unexplained flaky, skipped, or duplicate tests |

### Quality Gate Checklist

- [ ] All Candidate TCs have automated tests
- [ ] All tests follow the applicable project architecture
- [ ] All batch operations respect configured rate limits
- [ ] All test descriptions satisfy the configured project schema
- [ ] All tests have the required parent or traceability link
- [ ] All tests follow the configured title format
- [ ] No unexplained flaky, skipped, or duplicate tests
- [ ] No lint errors
- [ ] No type errors
- [ ] All tests passing

### Expert Panel Activation

For post-automation review, activate:
- **Senior QA Lead**: Test coverage and quality
- **Senior Technical Architect**: KATA compliance
- **Senior Developer**: Code quality and patterns
- **Delivery Lead**: Process compliance
- **Engram Curator**: Records validated findings and recurring failure patterns
- **Skeptical Reviewer**: Challenges the verdict and unexplained exceptions
- **Expert Capability Coach**: Proposes training or framework improvements when recurring patterns are validated

### Review Output

```markdown
## Post-Automation Review - <Batch>

### Executive Summary
<quality status, coverage, issues found>

### Quality Metrics
- Test coverage: <count> / <total>
- KATA compliance: <percentage>
- Rate-limiting compliance: <yes/no>
- Test documentation compliance: <count> / <total>
- Traceability compliance: <count> / <total>
- Naming compliance: <count> / <total>
- Deterministic tests: <count> / <total>
- Unexplained flaky/skipped/duplicate tests: <count>

### Issues Found
<list of issues>

### Recommendations
<improvements for next batch>

### Verdict
{APPROVED | APPROVED_WITH_NOTES | REJECTED}
```
