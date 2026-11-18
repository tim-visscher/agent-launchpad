# Security model

## Assumptions

- Colleagues are trusted but not technical.
- AI agents can make mistakes and can be prompt-injected (by a web page, a pasted document, a dependency).
- Instruction files are **context, not enforcement**. Anything that must hold is enforced by tooling.

## Layers

**1. No keys on laptops.** Agents only have the colleague's own GitHub identity. All powerful credentials live in GitHub Actions secrets and are used by the robot.

**2. Least privilege on hosting.** A dedicated server in its own Coolify team. The robot's API token has only `write` and `deploy`, no root, and an expiry date. Servers in other teams are invisible to it.

**3. Everything behind sign-in.** One identity-aware proxy in front of `*.lab`, `*.proto` and `*.tools`. The server only accepts traffic through the proxy (e.g. via a tunnel), so the sign-in can't be bypassed by hitting the IP.

**4. GitHub organisation settings.** All repos private by default. Members can't change visibility, delete or transfer repos. Write access only to their own projects.

**5. Secrets hygiene.** `gitleaks` (or GitHub secret scanning where available) in CI. `.env` files are git-ignored and blocked from agent reads via `.claude/settings.json`. Secret values are set by an admin on the server, never via issues.

**6. Agent permissions.** Shared `.claude/settings.json` with deny rules (reading `.env`, `curl | sh`, force-push, editing protected files). Equivalent rules for Codex where supported.

**7. Data classification.** Every project declares its data class. Personal data requires SSO and approval from the privacy officer. Opening a project to the public is only possible with fictional data, after an extended check.

**8. Not indexed.** Every app sends `X-Robots-Tag: noindex, nofollow` and serves a blocking `robots.txt`. Note: don't block crawling *and* rely on the meta tag — crawlers that can't fetch the page never see the noindex.

**9. Lifecycle.** Resource limits per app. Inactive `lab` projects are paused automatically. Owners can pause or archive; only admins delete.

**10. Imported code.** When existing code is imported, the agent must look for other agent instruction files (`AGENTS.md`, `.cursorrules`, `.github/copilot-instructions.md`, `GEMINI.md`, `.claude/`, …), summarise them and remove anything that contradicts platform rules. The robot checks again and blocks go-live otherwise.

## The knowledge base is an attack surface

Learnings flow back into the template, and from there into every new project. A wrong or manipulated "learning" would spread everywhere. So: learnings are bundled into a pull request, a human reviews, and **nothing is merged automatically**.
