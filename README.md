# Agent Launchpad

**From idea to a live, secured app with one prompt — for designers, researchers and strategists, not just developers.**

Agent Launchpad is a reference setup for running an internal "vibe coding" platform on your own infrastructure. A colleague opens Claude Code or Codex in an empty folder, pastes one starter prompt, and a few minutes later has:

- a private Git repository created from a vetted template,
- a running app on its own subdomain (e.g. `my-idea.lab.example.com`),
- access control, `noindex`, secret scanning and data rules already in place,
- an AI agent that knows the house rules and can keep building.

Nobody has to touch Git, Docker, DNS or the hosting dashboard. Nobody gets a hosting or GitHub admin key.

> Built at a digital product design agency to let the whole team experiment with AI-built tools and prototypes safely. Shared here so other teams and organisations can do the same.

---

## Why

Vibe coding is easy. Getting the result **safely hosted, shared with a client or test users, and kept maintained** is not. The usual options are bad:

| Option | Problem |
|---|---|
| Give everyone hosting / GitHub admin access | One prompt injection or typo away from deleting production |
| Let people deploy to random free hosts | No overview, no access control, data ends up everywhere |
| Only developers may build | Ideas die in the backlog |

Agent Launchpad puts a small **request robot** in between. The agent can only *ask* for things; the robot holds the keys and enforces the rules.

## How it works

```
Colleague ──paste prompt──▶ AI agent (Claude Code / Codex)
                               │  opens an issue with a JSON request
                               ▼
                     platform repo (GitHub)
                               │  GitHub Action = "the robot" (holds the secrets)
             ┌─────────────────┼──────────────────┐
             ▼                 ▼                  ▼
   new repo from template   app on Coolify    reply in issue
   (owner gets write)       <name>.<type>.domain  (links, next steps)
                               │
                               ▼
              agent clones repo, reads AGENTS.md, builds, pushes
              every push → checks → live in minutes
```

1. **Request, don't grant.** Opening an issue only needs read access, so colleagues can never change the workflow or see secrets. Every request is logged.
2. **The robot validates everything** against `platform.config.json`: name rules, project type, audience, data classification, access mode.
3. **Template, not blank slate.** Every project starts from the same template with a proven Dockerfile, health check, CI build and agent instructions.
4. **Guardrails that are enforced, not suggested.** Instruction files (AGENTS.md) are context for the agent; real limits live in `.claude/settings.json` deny rules, CI checks and the robot.
5. **A knowledge base that improves itself.** Agents report solved problems as `learning:` issues. A scheduled job bundles them into one pull request on the template. A human reviews and merges — never automatically.

## Project types

| Type | Subdomain | Meant for | Lifecycle |
|---|---|---|---|
| `lab` | `*.lab.example.com` | experiments and explorations | paused after a period without changes |
| `proto` | `*.proto.example.com` | prototypes for clients and user tests | archived after the project |
| `tools` | `*.tools.example.com` | internal tools that keep running | maintained by an owner |

## Safety rules (enforced by the robot)

- A new project **never starts publicly open**. Opening up comes later, after an extended check, and only with fictional data.
- Projects with **personal data** can only use company sign-in (SSO), never a shared password.
- Working on a colleague's project is always a **fork**; only the owner works in the original.
- Passwords never go to GitHub — only a hash. Secret values never go into issues — only the key name and a reason.
- Only an admin can permanently delete; an owner can pause or archive.
- Every site sends `X-Robots-Tag: noindex` and serves a blocking `robots.txt`.

See [`docs/security.md`](docs/security.md) for the full threat model.

## What's in this repo

```
.
├── README.md
├── starter-prompt.md              # the one prompt colleagues paste
├── platform.config.example.json   # types, domains, defaults, limits
├── docs/
│   ├── architecture.md
│   ├── security.md
│   ├── request-format.md          # JSON contract between agent and robot
│   └── knowledge-base.md          # the self-improving loop
├── scripts/robot/validate.mjs     # parses + validates requests against the config
├── .agents/skills/new-project/    # skill the agent follows to open a request
├── template/                      # what every new project starts from
│   ├── AGENTS.md
│   ├── CLAUDE.md
│   ├── PROJECT.md
│   ├── Dockerfile
│   ├── .env.example
│   ├── .gitignore
│   ├── .claude/settings.json
│   └── .github/workflows/ci.yml
└── .github/
    ├── ISSUE_TEMPLATE/platform-request.md
    └── workflows/
        ├── robot.yml              # skeleton of the request robot
        └── learnings.yml          # weekly knowledge-base bundling
```

## Requirements

- A GitHub organisation (repos private by default, members without delete/visibility rights)
- A server with [Coolify](https://coolify.io) in a dedicated team, API token with only `write` + `deploy`, with an expiry date
- A wildcard DNS setup per project type, ideally behind an identity-aware proxy (e.g. Cloudflare Access + Tunnel) so nobody can bypass sign-in
- Claude Code and/or Codex for colleagues

## Status

This is a **reference implementation and pattern library**, extracted from a working internal platform. Organisation-specific code, domains and data have been removed. Contributions, questions and alternative hosting adapters are welcome.

## License

MIT — see [LICENSE](LICENSE).
