import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const RELEASE_NOTES_DIR = "apps/open-icon-org/release-notes";

const SECTION_ORDER = ["Changed", "Added", "Fixed"];
const VERSION_FILE_PATTERN = /^v(\d+)-(\d+)-(\d+)\.md$/;

const ensureSentence = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const sentence = trimmed[0].toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
};

export const parseConventionalMessage = (message) => {
  const lines = message
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const header = lines[0] || "";
  const match = header.match(
    /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?: (?<subject>.+)$/i
  );

  if (!match?.groups) {
    return null;
  }

  return {
    type: match.groups.type.toLowerCase(),
    scope: match.groups.scope || "",
    subject: match.groups.subject.trim(),
    breaking:
      Boolean(match.groups.breaking) ||
      lines.some((line) => line.startsWith("BREAKING CHANGE:")),
  };
};

export const getReleaseSection = (message) => {
  const parsed = parseConventionalMessage(message);
  if (!parsed) {
    return null;
  }

  if (parsed.breaking) {
    return "Changed";
  }

  if (parsed.type === "feat") {
    return "Added";
  }

  if (parsed.type === "fix") {
    return "Fixed";
  }

  return null;
};

export const getReleaseEntry = (message) => {
  const parsed = parseConventionalMessage(message);
  const section = getReleaseSection(message);

  if (!parsed || !section) {
    return null;
  }

  const subject = ensureSentence(parsed.subject);
  const text = parsed.scope ? `\`${parsed.scope}\`: ${subject}` : subject;

  return {
    section,
    text,
  };
};

export const groupReleaseNotes = (commits) => {
  const sections = {
    Changed: [],
    Added: [],
    Fixed: [],
  };

  for (const commit of commits) {
    const message = typeof commit === "string" ? commit : commit.message || "";
    const entry = getReleaseEntry(message);
    if (!entry) {
      continue;
    }

    if (!sections[entry.section].includes(entry.text)) {
      sections[entry.section].push(entry.text);
    }
  }

  return Object.fromEntries(
    SECTION_ORDER.filter((section) => sections[section].length > 0).map(
      (section) => [section, sections[section]]
    )
  );
};

const getVersionFile = (version) => `v${version.replace(/\./g, "-")}.md`;

const parseVersion = (value) => value.split(".").map((part) => Number(part));

const getVersionOrder = (version) => {
  const [major, minor, patch] = parseVersion(version);
  return -1 * (major * 10000 + minor * 100 + patch);
};

const compareVersionsDesc = (left, right) => {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);

  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] !== rightParts[index]) {
      return rightParts[index] - leftParts[index];
    }
  }

  return 0;
};

const getExistingVersions = (notesDir) =>
  readdirSync(notesDir)
    .map((file) => file.match(VERSION_FILE_PATTERN))
    .filter(Boolean)
    .map((match) => `${match[1]}.${match[2]}.${match[3]}`)
    .sort(compareVersionsDesc);

export const renderReleaseNotesPage = ({ version, date, sections }) => {
  const renderedSections = SECTION_ORDER.filter((section) => sections[section])
    .map(
      (section) =>
        `## ${section}\n\n${sections[section]
          .map((entry) => `- ${entry}`)
          .join("\n")}`
    )
    .join("\n\n");

  const fallbackCopy = renderedSections
    ? renderedSections
    : "No user-facing changes were captured from conventional commits in this release.";

  return `---
title: ${version}
description: Release notes for Open Icon ${version}.
order: ${getVersionOrder(version)}
---

# ${version}

Released on ${date}.

${fallbackCopy}
`;
};

export const renderReleaseNotesIndex = (versions) => {
  const links = versions.length
    ? versions
        .map(
          (version) =>
            `- [${version}](/release-notes/${getVersionFile(version).replace(".md", "")}/index.html)`
        )
        .join("\n")
    : "- Release notes are generated during the publish workflow.";

  return `---
title: Release Notes
description: Release notes for published Open Icon releases.
---

# Release Notes

Published changes for Open Icon releases.

${links}
`;
};

export const writeReleaseNotes = ({ rootDir, version, date, commits }) => {
  const notesDir = resolve(rootDir, RELEASE_NOTES_DIR);
  mkdirSync(notesDir, { recursive: true });

  const sections = groupReleaseNotes(commits);
  const pagePath = join(notesDir, getVersionFile(version));
  const readmePath = join(notesDir, "README.md");

  writeFileSync(pagePath, renderReleaseNotesPage({ version, date, sections }));

  const versions = Array.from(
    new Set([...getExistingVersions(notesDir), version])
  ).sort(compareVersionsDesc);

  writeFileSync(readmePath, renderReleaseNotesIndex(versions));

  return {
    pagePath,
    readmePath,
    sections,
  };
};

export const getCommitMessagesFromRange = ({ rootDir, range }) => {
  const output = execFileSync("git", ["log", "--reverse", "--format=%B%x1e", range], {
    cwd: rootDir,
    encoding: "utf8",
  });

  return output
    .split("\x1e")
    .map((message) => message.trim())
    .filter(Boolean);
};

const getArgumentValue = (argumentsList, key) => {
  const index = argumentsList.findIndex((argument) => argument === key);
  return index >= 0 ? argumentsList[index + 1] : "";
};

const runCli = () => {
  const args = process.argv.slice(2);
  const version = getArgumentValue(args, "--version");
  const date = getArgumentValue(args, "--date");
  const range = getArgumentValue(args, "--range");
  const rootDir = resolve(getArgumentValue(args, "--root") || process.cwd());

  if (!version || !date || !range) {
    throw new Error(
      "Usage: node scripts/release-notes.mjs --version 1.2.3 --date 2026-03-25 --range <from>..<to> [--root /path/to/repo]"
    );
  }

  const commits = getCommitMessagesFromRange({ rootDir, range });
  const { pagePath, readmePath, sections } = writeReleaseNotes({
    rootDir,
    version,
    date,
    commits,
  });

  process.stdout.write(
    [
      `Wrote ${pagePath.replace(`${rootDir}/`, "")}`,
      `Updated ${readmePath.replace(`${rootDir}/`, "")}`,
      `Sections: ${Object.keys(sections).join(", ") || "none"}`,
    ].join("\n")
  );
};

const isCliEntry = (() => {
  if (!process.argv[1]) {
    return false;
  }

  const entryPath = resolve(process.argv[1]);
  if (!existsSync(entryPath)) {
    return false;
  }

  return entryPath === fileURLToPath(import.meta.url);
})();

if (isCliEntry) {
  runCli();
}
