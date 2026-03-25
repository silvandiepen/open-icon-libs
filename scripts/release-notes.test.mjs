import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  groupReleaseNotes,
  renderReleaseNotesIndex,
  writeReleaseNotes,
} from "./release-notes.mjs";

test("groupReleaseNotes keeps conventional commits in release sections", () => {
  const sections = groupReleaseNotes([
    "feat(Docs): add package overview",
    "fix(Site): align inline icon previews",
    "feat(API)!: remove legacy output\n\nBREAKING CHANGE: output shape changed",
    "chore(Release): skip me",
  ]);

  assert.deepEqual(sections, {
    Changed: ["`API`: Remove legacy output."],
    Added: ["`Docs`: Add package overview."],
    Fixed: ["`Site`: Align inline icon previews."],
  });
});

test("writeReleaseNotes writes a version page and updates the index", () => {
  const rootDir = mkdtempSync(join(tmpdir(), "open-icon-release-notes-"));
  mkdirSync(join(rootDir, "apps/open-icon-org/release-notes"), { recursive: true });

  const { pagePath, readmePath } = writeReleaseNotes({
    rootDir,
    version: "0.1.2",
    date: "2026-03-25",
    commits: [
      "feat(Docs): simplify package section",
      "fix(CI): publish generated release notes",
    ],
  });

  const page = readFileSync(pagePath, "utf8");
  const index = readFileSync(readmePath, "utf8");

  assert.match(page, /title: 0.1.2/);
  assert.match(page, /Released on 2026-03-25\./);
  assert.match(page, /## Added/);
  assert.match(page, /`Docs`: Simplify package section\./);
  assert.match(page, /## Fixed/);
  assert.match(page, /`CI`: Publish generated release notes\./);

  assert.match(index, /# Release Notes/);
  assert.match(index, /\[0.1.2\]\(\/release-notes\/v0-1-2\/index\.html\)/);
});

test("renderReleaseNotesIndex shows placeholder copy without versions", () => {
  const index = renderReleaseNotesIndex([]);

  assert.match(index, /Release notes are generated during the publish workflow\./);
});
