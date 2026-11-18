# Architecture

## Components

| Component | Role | Holds secrets? |
|---|---|---|
| **AI agent** (Claude Code / Codex on the colleague's laptop) | Asks questions, writes code, opens requests, pushes to its own repo | No — only the colleague's own GitHub login |
| **Platform repo** | Config, registry of projects, issue inbox, robot workflows, knowledge base | Secrets live in GitHub Actions secrets, not in files |
| **Robot** (GitHub Action) | Validates and executes requests, replies in the issue | Yes: a GitHub App key and a scoped hosting API token |
| **Template repo** | Starting point for every project: Dockerfile, health check, CI, agent rules | No |
| **Project repos** | One per project, private, owner has write | No |
| **Hosting** (Coolify in a dedicated team) | Builds and runs each project from its repo | — |
| **Access proxy** (e.g. Cloudflare Access + Tunnel) | SSO or password in front of every subdomain; the server is not reachable around it | — |

## Request flow (`new`)

1. Agent opens an issue with a `platform-request` JSON block.
2. Robot checks: author is an org member, JSON valid, rules in `platform.config.json` satisfied, name free.
3. Robot creates `<type>-<name>` from the template, grants the author write access, writes `.platform/project.json`.
4. Robot creates the app on the hosting server: repo, branch, port, health check, resource limits, `noindex` headers, domain `<name>.<type-domain>`.
5. Robot sets up access (SSO or password hash) on the proxy.
6. Robot adds the project to the registry and replies with links and next steps.

## Deploy flow

- Every push to `main` runs the template CI (build the same Docker image, run tests, secret scan, check that protected files are unchanged).
- Deploy is triggered by the robot, not by the hosting webhook directly, so the safety gate always runs first.
- A follow-up job watches the build and reports in the issue when the new version is actually live, with timing per step. `/rollback` restores the previous version.

## Protected files

Some files in each project belong to the platform, not the project: `AGENTS.md` (platform block), `CLAUDE.md`, `.claude/settings.json`, platform skills. The robot restores them on every deploy check if they were changed or removed. Projects can add their own rules *below* the platform block in `AGENTS.md`.

## Why issues and not an MCP server or API keys

- Opening an issue only needs read access → colleagues can't modify the robot or read secrets.
- Every action has an audit trail with author and timestamp.
- Handing out a hosting MCP or token would give each agent access to *all* apps in the team.
