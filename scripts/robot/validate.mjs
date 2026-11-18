// Parses and validates a platform request from an issue body.
// Usage: node validate.mjs <issue-body-file> <author-login> > request.json
// Exits non-zero with a plain-language reason on stderr when the request is rejected.
import { readFileSync, existsSync } from "node:fs";

const configPath = existsSync("platform.config.json") ? "platform.config.json" : "platform.config.example.json";
const cfg = JSON.parse(readFileSync(configPath, "utf8"));

export function extractRequest(body) {
  const m = body.match(/<!--\s*platform-request\s*-->\s*```json\s*([\s\S]*?)```/);
  if (!m) throw new Error("No platform-request JSON block found.");
  try {
    return JSON.parse(m[1]);
  } catch {
    throw new Error("The JSON in the request could not be read.");
  }
}

const OWNER_ACTIONS = ["access-mode", "database", "env", "transfer", "pause", "resume", "archive"];
const NEW_ACTIONS = ["new", "import", "fork"];

export function validate(req, author, registry = {}) {
  const fail = (msg) => { throw new Error(msg); };
  if (req.v !== 1) fail("Unknown request version.");
  if (!/^[a-z0-9]{6,12}$/.test(req.id || "")) fail("The request id must be 6–12 lowercase letters or digits.");
  if (![...NEW_ACTIONS, ...OWNER_ACTIONS].includes(req.action)) fail(`Unknown action "${req.action}".`);

  if (NEW_ACTIONS.includes(req.action)) {
    const p = req.project || fail("A project description is missing.");
    const type = cfg.types[p.type] || fail(`Unknown project type "${p.type}".`);
    if (!new RegExp(cfg.rules.nameRegex).test(p.name || "")) fail("The name must be 3–30 characters: lowercase letters, digits and hyphens, starting with a letter.");
    if (registry[`${p.type}-${p.name}`]) fail(`The name "${p.name}" is already taken for ${p.type}.`);
    if (!cfg.audiences.includes(p.audience)) fail(`Unknown audience "${p.audience}".`);
    if (!cfg.dataClasses.includes(p.data)) fail(`Unknown data class "${p.data}".`);
    if (!cfg.accessModes.includes(p.access)) fail(`Unknown access mode "${p.access}".`);
    if (cfg.rules.newProjectsNeverOpen && p.access === "open") fail("A new project can't start open. Request open access later, with fictional data only.");
    if (p.data === "personal" && p.access !== cfg.rules.personalDataRequires) fail("Projects with personal data can only use company sign-in.");
    if (p.access === "password" && !/^\$2[aby]\$\d{2}\$/.test(p.passwordHash || "")) fail("Password access needs a bcrypt hash, never the password itself.");
    if (req.action === "fork" && !req.source) fail("A fork needs the source repo.");
    return { ...req, owner: { ...req.owner, github: author }, domain: `${p.name}.${type.domain}`, repo: `${p.type}-${p.name}` };
  }

  const entry = registry[req.repo] || fail(`Project "${req.repo}" is not in the registry.`);
  const isAdmin = cfg.admins.includes(author);
  if (entry.owner.github !== author && !isAdmin) fail("Only the owner or an admin can do this.");
  if (req.action === "access-mode" && req.access === "open" && entry.data !== "fictional") fail("Only projects with fictional data can be opened up.");
  if (req.action === "access-mode" && entry.data === "personal" && req.access !== "sso") fail("Projects with personal data can only use company sign-in.");
  if (req.action === "env") {
    if (!/^[A-Z][A-Z0-9_]*$/.test(req.key || "")) fail("The key must be UPPER_SNAKE_CASE.");
    if ("value" in req) fail("Never send secret values. An admin sets the value on the server.");
    if (!req.reason) fail("Give a reason for the new key.");
  }
  return req;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [bodyFile, author] = process.argv.slice(2);
  const registry = existsSync("registry.json") ? JSON.parse(readFileSync("registry.json", "utf8")) : {};
  try {
    const req = validate(extractRequest(readFileSync(bodyFile, "utf8")), author, registry);
    process.stdout.write(JSON.stringify(req, null, 2));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
