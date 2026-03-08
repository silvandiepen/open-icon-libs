import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const iconsRoot = path.join(packageRoot, 'icons');
const generatedDir = path.join(packageRoot, 'src', 'generated');
const generatedFile = path.join(generatedDir, 'openIconCatalog.generated.ts');

const normalizeSegment = (value) => {
	return value
		.toLowerCase()
		.trim()
		.replace(/&/g, ' and ')
		.replace(/["'`]/g, '')
		.replace(/[\s_+]+/g, '-')
		.replace(/[^a-z0-9-]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
};

const normalizePath = (value) => {
	return value
		.replace(/\\/g, '/')
		.split('/')
		.map(normalizeSegment)
		.filter(Boolean)
		.join('/');
};

const stripIconPrefix = (value) => value.replace(/^icon[-_]*/i, '');

const isSvgFile = (fileName) => fileName.toLowerCase().endsWith('.svg');

const toConstKey = (value) => {
	const raw = value
		.toUpperCase()
		.replace(/[^A-Z0-9]+/g, '_')
		.replace(/_+/g, '_')
		.replace(/^_+|_+$/g, '');

	if (!raw) {
		return 'ICON_UNNAMED';
	}

	if (/^[0-9]/.test(raw)) {
		return `ICON_${raw}`;
	}

	return raw;
};

const walkSvgFiles = async (directory, result = []) => {
	const entries = await fs.readdir(directory, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.name.startsWith('.')) {
			continue;
		}

		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			await walkSvgFiles(fullPath, result);
			continue;
		}

		if (entry.isFile() && isSvgFile(entry.name)) {
			result.push(fullPath);
		}
	}

	return result;
};

const ensureUniqueName = (candidate, taken) => {
	if (!taken.has(candidate)) {
		taken.add(candidate);
		return candidate;
	}

	let index = 2;
	let next = `${candidate}-${index}`;
	while (taken.has(next)) {
		index += 1;
		next = `${candidate}-${index}`;
	}

	taken.add(next);
	return next;
};

const ensureUniqueKey = (candidate, taken) => {
	if (!taken.has(candidate)) {
		taken.add(candidate);
		return candidate;
	}

	let index = 2;
	let next = `${candidate}_${index}`;
	while (taken.has(next)) {
		index += 1;
		next = `${candidate}_${index}`;
	}

	taken.add(next);
	return next;
};

const quote = (value) => JSON.stringify(value);

const main = async () => {
	const files = (await walkSvgFiles(iconsRoot)).sort((a, b) => a.localeCompare(b));

	if (files.length === 0) {
		throw new Error(`No SVG files found in ${iconsRoot}`);
	}

	const usedNames = new Set();
	const usedKeys = new Set();
	const entries = [];

	for (const absoluteFilePath of files) {
		const relativePath = path.relative(iconsRoot, absoluteFilePath).split(path.sep).join('/');
		const relativeWithoutExtension = relativePath.replace(/\.svg$/i, '');
		const segments = relativeWithoutExtension.split('/');
		const rawBaseName = segments.pop() ?? '';
		const category = normalizePath(segments.join('/'));

		const strippedBaseName = normalizeSegment(stripIconPrefix(rawBaseName));
		const normalizedBaseName = normalizeSegment(rawBaseName);
		const canonicalBaseName = strippedBaseName || normalizedBaseName || 'icon';
		const candidateName = category ? `${category}/${canonicalBaseName}` : canonicalBaseName;
		const iconName = ensureUniqueName(candidateName, usedNames);

		const rawNormalizedPath = normalizePath(relativeWithoutExtension);
		const rawBasename = normalizeSegment(rawBaseName);
		const aliases = new Set([
			iconName,
			rawNormalizedPath,
			rawBasename,
			canonicalBaseName,
		]);

		if (category && rawBasename) {
			aliases.add(`${category}/${rawBasename}`);
		}
		if (category && canonicalBaseName) {
			aliases.add(`${category}/${canonicalBaseName}`);
		}

		const keyCandidate = toConstKey(iconName);
		const key = ensureUniqueKey(keyCandidate, usedKeys);

		entries.push({
			key,
			iconName,
			category,
			filePath: `icons/${relativePath}`,
			aliases,
		});
	}

	entries.sort((a, b) => a.iconName.localeCompare(b.iconName));

	const categories = Array.from(new Set(entries.map((entry) => entry.category))).sort((a, b) =>
		a.localeCompare(b)
	);
	const names = entries.map((entry) => entry.iconName);

	const categoryMap = new Map();
	for (const category of categories) {
		categoryMap.set(category, []);
	}
	for (const entry of entries) {
		categoryMap.get(entry.category).push(entry.iconName);
	}

	const aliasToName = new Map();
	for (const entry of entries) {
		const aliases = Array.from(entry.aliases).filter(Boolean).sort((a, b) => a.localeCompare(b));
		for (const alias of aliases) {
			if (!aliasToName.has(alias)) {
				aliasToName.set(alias, entry.iconName);
			}
		}
	}

	const keyLines = entries
		.slice()
		.sort((a, b) => a.key.localeCompare(b.key))
		.map((entry) => `\t${entry.key}: ${quote(entry.iconName)},`)
		.join('\n');

	const nameToFileLines = entries
		.map((entry) => `\t${quote(entry.iconName)}: ${quote(entry.filePath)},`)
		.join('\n');

	const categoryLines = categories
		.map((category) => {
			const categoryNames = categoryMap.get(category)
				.map((name) => quote(name))
				.join(', ');
			return `\t${quote(category)}: [${categoryNames}],`;
		})
		.join('\n');

	const aliasLines = Array.from(aliasToName.entries())
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([alias, iconName]) => `\t${quote(alias)}: ${quote(iconName)},`)
		.join('\n');

	const content = `// AUTO-GENERATED FILE. DO NOT EDIT.
// Generated by scripts/generate-open-icon-catalog.mjs

export const OPEN_ICON_CATEGORIES = [${categories.map((category) => quote(category)).join(', ')}] as const;
export type OpenIconCategory = (typeof OPEN_ICON_CATEGORIES)[number];

export const OPEN_ICON_NAMES = [${names.map((name) => quote(name)).join(', ')}] as const;
export type OpenIconName = (typeof OPEN_ICON_NAMES)[number];

export const OPEN_ICON_KEY_TO_NAME = {
${keyLines}
} as const;

export const OPEN_ICON_NAME_TO_FILE = {
${nameToFileLines}
} as const satisfies Record<OpenIconName, string>;

export const OPEN_ICON_CATEGORY_TO_NAMES = {
${categoryLines}
} as const satisfies Record<OpenIconCategory, readonly OpenIconName[]>;

export const OPEN_ICON_ALIAS_TO_NAME = {
${aliasLines}
} as const;
`;

	await fs.mkdir(generatedDir, { recursive: true });
	await fs.writeFile(generatedFile, content, 'utf8');

	console.log(`[open-icon-svg] Generated catalog for ${entries.length} icons.`);
	console.log(`[open-icon-svg] Categories: ${categories.length}`);
	console.log(`[open-icon-svg] Output: ${generatedFile}`);
};

main().catch((error) => {
	console.error('[open-icon-svg] Failed to generate icon catalog.');
	console.error(error);
	process.exit(1);
});
