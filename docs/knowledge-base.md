# Self-improving knowledge base

Every project starts from the same template, so a problem solved once should never need solving twice.

## Loop

1. **Capture.** `AGENTS.md` tells the agent: when you solve a non-obvious problem (a build error, a config quirk, a library gotcha), open an issue `learning: <short title>` in the platform repo with *symptom*, *cause*, *fix* and *which template file would prevent it*.
2. **Bundle.** A scheduled workflow (`learnings.yml`) runs weekly. It uses Claude Code in GitHub Actions to read new `learning:` issues, de-duplicate them, and propose one pull request on the template (AGENTS.md rules, skills, Dockerfile, CI).
3. **Review.** An admin reviews the PR. Only merged changes reach new projects.
4. **Propagate.** Existing projects pick up platform-owned files on their next deploy check; project-specific rules are left alone.

## What makes a good learning

- Reproducible: symptom and exact error text.
- General: would help the next project too, not just this one.
- Actionable: points at a file to change.

## What never goes in

- Secrets, client names, personal data, internal URLs.
- Instructions that loosen safety rules. The bundling job is told to flag these instead of including them.
