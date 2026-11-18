---
name: new-project
description: Ask a colleague the right questions and open a platform request for a new, imported or forked project.
---

# New project

Never handle keys, tokens or the hosting dashboard yourself. You only open a request; the robot does the rest.

## 1. Ask (one question at a time, in plain language)

1. **Type** — explain the options from `platform.config.json` → `types`:
   - `lab`: experiments, short-lived, paused after a while without changes
   - `proto`: prototypes for clients and user tests
   - `tools`: internal tools that keep running
2. **Title** and **purpose** (what it does, for whom, one or two sentences).
3. **Web-address name** — suggest one from the title. 3–30 characters, lowercase, digits, hyphens, starts with a letter. Never a confidential client name: the address is visible to anyone with the link. Check it's free: `gh repo view <org>/<type>-<name>` must fail.
4. **Audience**: internal, client, test participants or public.
5. **Data**: fictional, internal, client (confidential) or personal. Personal data only after approval of the privacy officer.
6. **Access**: `sso` (colleagues sign in with the company account) or `password` (e.g. for clients or test participants). A new project never starts open.
7. **What will you roughly build?** database, AI feature, forms, login, user test, file uploads.

For an **import**, also ask where the code is, which port and health path it uses, and look for other agent instruction files (`AGENTS.md`, `.cursorrules`, `.cursor/rules/`, `.github/copilot-instructions.md`, `GEMINI.md`, `.claude/`, `.agents/`). Summarise them and agree to remove anything that contradicts platform rules.

## 2. Password (only with `password`)

Generate a strong password locally, show it **once** and ask the colleague to store it in the password manager. Put only a bcrypt hash in the request. Never write the password to a file in the repo or to the issue.

## 3. Open the request

Write the issue body to a temp file **outside** the project folder, in the format of `docs/request-format.md`, with a fresh 6–12 character id. Then:

```
gh issue create -R <org>/platform --title "[platform] new: <type>/<name>" --body-file <tempfile>
```

## 4. Wait and continue

Check the issue every 30 seconds for a comment containing your id. On success, clone the repo, read `AGENTS.md` and start. On rejection, explain the reason simply and fix the request together.
