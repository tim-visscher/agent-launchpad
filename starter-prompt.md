# Starter prompt

Colleagues open Claude Code (app or terminal) or Codex in an **empty folder** and paste the prompt below. It contains no secrets, so it can live on your intranet.

Replace `YOUR-ORG/platform` with your platform repo.

```
Help me build something on our internal platform. I'm not technical: do everything yourself and briefly explain what you're doing.

1. Check whether git and the GitHub CLI (gh) are installed and install them if needed.
   Log me in with `gh auth login --web` and `gh auth setup-git`; I'll only click in the browser.
2. Clone YOUR-ORG/platform (read-only) to a temporary folder and read
   `docs/request-format.md` and `.agents/skills/new-project/SKILL.md`.
3. Ask me, one question at a time:
   - what kind of project this is (lab, proto or tools — explain the difference),
   - a title and what it should do, for whom, in one or two sentences,
   - who it is for (internal, client, test participants, public),
   - what kind of data it will use (fictional, internal, client-confidential, personal data),
   - roughly what I'll build (database, AI feature, forms, login, user test, file uploads).
   Suggest a short web-address name. Never use a confidential client name in it.
4. Create the request exactly as the skill describes and open it as an issue in YOUR-ORG/platform.
5. Wait until the robot replies with the repo link and the live link (check every 30 seconds).
   If the robot rejects the request, explain why in plain language and fix it with me.
6. Clone the new repo here, read AGENTS.md and follow those rules from now on.
7. Ask what I want to build. Work in small steps, run the checks, and push after every working step.
```
