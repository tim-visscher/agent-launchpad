# Request format

The agent never talks to the hosting server or the GitHub admin API. It opens an **issue** in the platform repo with a JSON block. The robot (a GitHub Action holding the secrets) parses, validates and executes it, then replies in the same issue.

## Shape

````markdown
Request via the agent of <colleague name>.

<!-- platform-request -->
```json
{ "v": 1, "id": "k3x9q2", "action": "new", ... }
```
````

- `v` — format version, currently `1`
- `id` — unique 6–12 characters (lowercase letters and digits), so the agent can find the robot's reply
- `action` — see below

## Actions

| action | fields besides `v`, `id`, `action` | who |
|---|---|---|
| `new` | `project`, `owner`, optional `skills` | anyone in the org |
| `import` | as `new`, plus `port` (default 3000) and `healthPath` (default `/api/health`) | anyone |
| `fork` | as `new`, plus `source` (repo of the original) | anyone |
| `access-mode` | `repo`, `access` (`open`, `password`, `sso`), with password: `passwordHash` | owner |
| `database` | `repo`, `kind: "postgres"` | owner |
| `env` | `repo`, `key` (UPPER_SNAKE_CASE), `reason`. **Never the value.** | owner |
| `transfer` | `repo`, `newOwner: { github, name, email }` | owner |
| `pause` / `resume` / `archive` | `repo` | owner |

## `project` (for `new`, `import`, `fork`)

```json
{
  "type": "lab | proto | tools",
  "name": "lowercase-with-hyphens",
  "title": "Readable title",
  "purpose": "What it does and for whom, in one or two sentences.",
  "audience": "internal | client | test-participants | public",
  "client": "",
  "data": "fictional | internal | client | personal",
  "access": "password | sso",
  "passwordHash": "only with password, see below",
  "features": ["database", "ai", "forms", "login", "user-test", "files"]
}
```

`owner`: `{ "name": "First Last", "email": "name@example.com" }`.

## Rules the robot enforces

- `name` matches `^[a-z][a-z0-9-]{2,29}$` and is not taken in the registry or on GitHub.
- A new project never starts `open`. `access-mode: open` is only accepted for `data: fictional`, after an extended check.
- `data: personal` only allows `sso`.
- Working on someone else's project is always a `fork`.
- Permanent deletion is admin-only.
- The issue author's GitHub identity decides who the owner is; the JSON cannot override it.

## Passwords

The password itself never goes to GitHub. The agent generates a strong password locally, shows it **once** to the colleague (to store in the password manager), and only puts a salted hash (e.g. bcrypt) in the request. The access proxy checks against the hash.

## Secrets

`env` requests only name the key and why it's needed. An admin sets the value directly on the hosting server. This keeps secret values out of issues, logs and agent context.
