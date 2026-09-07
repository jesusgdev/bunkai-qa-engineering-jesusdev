import { resolve } from 'node:path';

import { expect, test } from 'bun:test';

test('allows documented Jira placeholders used by skill templates', () => {
  const repoRoot = resolve(import.meta.dir, '..');
  const result = Bun.spawnSync({
    cmd: [process.execPath, 'scripts/lint-vars.ts'],
    cwd: repoRoot,
    stderr: 'pipe',
    stdout: 'pipe',
  });
  const output = new TextDecoder().decode(result.stdout) + new TextDecoder().decode(result.stderr);

  expect(result.exitCode).toBe(0);
  expect(output).not.toContain('UNDECLARED: {{ISSUE_KEY}}');
  expect(output).not.toContain('UNDECLARED: {{QA_ARTIFACT_LABEL}}');
});
