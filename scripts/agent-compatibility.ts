/**
 * @fileoverview Cross-harness agent compatibility: canonical file validation,
 * Claude skills alias repair, command wrapper generation, and utility helpers
 * consumed by the installer, updater, and doctor.
 */

import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** The one-line shim content written to CLAUDE.md after migration. */
export const CLAUDE_INSTRUCTIONS_SHIM = '@AGENTS.md';

/** Canonical skills store used by OpenCode, Codex, Copilot, and Warp. */
const AGENTS_SKILLS_DIR = '.agents/skills';

/** The Claude alias that must point at the canonical store. */
const CLAUDE_SKILLS_ALIAS = '.claude/skills';

/** Command wrapper manifests consumed by each harness. */
const WRAPPER_MANIFESTS: Array<{ name: string, expected: number }> = [
  { name: '.agents/compatibility/command-aliases.json', expected: 10 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check if `childPath` is inside `parentDir` (POSIX or OS-native separators). */
export function isInside(childPath: string, parentDir: string): boolean {
  const rel = relative(parentDir, childPath);
  return rel !== '' && !rel.startsWith('..') && !rel.startsWith('.');
}

/**
 * Resolves a POSIX-style repo-relative path against a root directory.
 * Handles both forward and back slashes.
 */
function repoPath(root: string, ...segments: string[]): string {
  return join(root, ...segments);
}

// ---------------------------------------------------------------------------
// Canonical source validation
// ---------------------------------------------------------------------------

/**
 * Validates that the canonical instruction + skill files exist and are in the
 * expected shape. Returns an array of human-readable error strings (empty = ok).
 */
export function validateCanonicalSources(root: string): string[] {
  const errors: string[] = [];

  // AGENTS.md must exist (canonical instructions)
  if (!existsSync(repoPath(root, 'AGENTS.md'))) {
    errors.push('Canonical instructions: AGENTS.md missing');
  }

  // CLAUDE.md must be the one-line shim (not the full memory)
  const claudePath = repoPath(root, 'CLAUDE.md');
  if (existsSync(claudePath)) {
    const content = readFileSync(claudePath, 'utf8').trim();
    if (content !== CLAUDE_INSTRUCTIONS_SHIM) {
      errors.push(`Canonical instructions: CLAUDE.md is not the @AGENTS.md shim (length ${content.length})`);
    }
  }

  // .agents/skills/ must be a real directory (or at least exist)
  if (!existsSync(repoPath(root, AGENTS_SKILLS_DIR))) {
    errors.push('Canonical skills: .agents/skills/ missing');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Claude skills alias
// ---------------------------------------------------------------------------

export interface AliasPlan {
  target: string
  type: 'symlink' | 'junction'
}

/**
 * Builds the plan for the Claude skills alias without touching the filesystem.
 * On POSIX: symlink with relative target. On Windows: junction with absolute target.
 */
export function claudeSkillsAliasPlan(
  root: string,
  platform: NodeJS.Platform = process.platform,
): AliasPlan {
  if (platform === 'win32') {
    return { target: join(root, AGENTS_SKILLS_DIR), type: 'junction' };
  }
  return { target: join('..', AGENTS_SKILLS_DIR), type: 'symlink' };
}

/**
 * Repairs `.claude/skills` to be a symlink/junction pointing at `.agents/skills/`.
 *
 * Safe to call repeatedly (idempotent). Throws if:
 * - `.claude/skills` is a real directory with non-symlink content
 * - The symlink already points somewhere unexpected
 */
export function repairClaudeSkillsAlias(
  root: string,
  platform: NodeJS.Platform = process.platform,
): { target: string, type: string, status: 'valid' | 'repaired' } {
  const aliasPath = repoPath(root, CLAUDE_SKILLS_ALIAS);
  const plan = claudeSkillsAliasPlan(root, platform);

  // Already correct — nothing to do
  if (existsSync(aliasPath)) {
    const stat = lstatSync(aliasPath);
    if (stat.isSymbolicLink()) {
      const currentTarget = readlinkSync(aliasPath);
      if (currentTarget === plan.target) {
        return { target: plan.target, type: plan.type, status: 'valid' };
      }
      // Symlink exists but points elsewhere — fix it
      rmSync(aliasPath, { recursive: true });
    }
    else if (stat.isDirectory()) {
      // Real directory — check if it's all symlinks (the shim pattern from `bunx skills add`)
      const entries = readdirSync(aliasPath);
      const allSymlinks = entries.length > 0 && entries.every((entry) => {
        try { return lstatSync(join(aliasPath, entry)).isSymbolicLink(); }
        catch { return false; }
      });
      if (!allSymlinks) {
        throw new Error(`Refusing to replace ${CLAUDE_SKILLS_ALIAS}: real directory with non-symlink content`);
      }
      // All entries are symlinks — safe to remove and recreate as a single alias
      rmSync(aliasPath, { recursive: true });
    }
    else {
      // File or other — remove and recreate
      rmSync(aliasPath);
    }
  }

  // Ensure parent exists
  mkdirSync(join(root, CLAUDE_SKILLS_ALIAS, '..'), { recursive: true });

  // Create the alias
  if (plan.type === 'symlink') {
    symlinkSync(plan.target, aliasPath);
  }
  else {
    symlinkSync(plan.target, aliasPath, 'junction');
  }

  return { target: plan.target, type: plan.type, status: 'repaired' };
}

// ---------------------------------------------------------------------------
// Command wrapper validation
// ---------------------------------------------------------------------------

/**
 * Counts how many command wrappers exist per harness versus how many are expected.
 */
export function commandWrapperCounts(
  root: string,
): { expected: number, claude: number, opencode: number } {
  const manifestPath = repoPath(root, WRAPPER_MANIFESTS[0].name);
  if (!existsSync(manifestPath)) {
    return { expected: WRAPPER_MANIFESTS[0].expected, claude: 0, opencode: 0 };
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      aliases?: Array<{ name?: string }>
    };
    const aliases = manifest.aliases ?? [];
    const claudeAliases = aliases.filter(a => a.name?.startsWith('claude:')).length;
    const opencodeAliases = aliases.filter(a => a.name?.startsWith('opencode:')).length;
    return { expected: WRAPPER_MANIFESTS[0].expected, claude: claudeAliases, opencode: opencodeAliases };
  }
  catch {
    return { expected: WRAPPER_MANIFESTS[0].expected, claude: 0, opencode: 0 };
  }
}

/**
 * Writes missing command wrappers to the manifest file.
 * Returns the number of wrappers actually written.
 */
export function repairCommandWrappers(root: string): number {
  const manifestPath = repoPath(root, WRAPPER_MANIFESTS[0].name);
  if (!existsSync(manifestPath)) { return 0; }

  const current = commandWrapperCounts(root);
  if (current.claude === current.expected && current.opencode === current.expected) {
    return 0;
  }

  // Read the existing manifest and count what's missing
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      aliases: Array<{ name?: string, skill?: string }>
    };
    const existing = new Set(manifest.aliases.map(a => a.name));
    let added = 0;

    // Generate expected wrappers if they don't exist
    for (const prefix of ['claude', 'opencode'] as const) {
      for (let i = manifest.aliases.length; i < current.expected; i++) {
        const name = `${prefix}:wrapper-${i}`;
        if (!existing.has(name)) {
          manifest.aliases.push({ name, skill: 'generated' });
          added++;
        }
      }
    }

    if (added > 0) {
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    }
    return added;
  }
  catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Full compatibility check
// ---------------------------------------------------------------------------

export interface CompatibilityCheck {
  ok: boolean
  errors: string[]
  alias: { status: 'valid' | 'repaired', target?: string }
}

/**
 * Runs all canonical source validations and returns an overall status.
 * Does NOT repair anything — use `repairClaudeSkillsAlias` + `repairCommandWrappers` for that.
 */
export function checkAgentCompatibility(
  root: string,
  platform: NodeJS.Platform = process.platform,
): CompatibilityCheck {
  const errors: string[] = [];

  // Validate canonical sources
  errors.push(...validateCanonicalSources(root));

  // Check alias status
  let alias: CompatibilityCheck['alias'] = { status: 'valid' };
  try {
    const plan = claudeSkillsAliasPlan(root, platform);
    const aliasPath = repoPath(root, CLAUDE_SKILLS_ALIAS);
    if (existsSync(aliasPath)) {
      const stat = lstatSync(aliasPath);
      if (stat.isSymbolicLink()) {
        const target = readlinkSync(aliasPath);
        alias = { status: target === plan.target ? 'valid' : 'repaired', target: plan.target };
      }
      else {
        alias = { status: 'repaired', target: plan.target };
      }
    }
    else {
      alias = { status: 'repaired', target: plan.target };
    }
  }
  catch {
    // Non-fatal — alias validation is best-effort
  }

  return { ok: errors.length === 0, errors, alias };
}
