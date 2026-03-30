import { promises as fs } from 'node:fs';
import path from 'node:path';
import { OPEN_ICON_CUSTOM_ALIASES } from './openIconCustomAliases.mjs';

export const normalizeSegment = (value) => {
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

export const normalizePath = (value) => {
	return value
		.replace(/\\/g, '/')
		.split('/')
		.map(normalizeSegment)
		.filter(Boolean)
		.join('/');
};

export const stripIconPrefix = (value) => value.replace(/^icon[-_]*/i, '');

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

export const walkSvgFiles = async (directory, result = []) => {
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

export const buildOpenIconCatalog = async ({
	iconsRoot,
	filePathPrefix = 'icons',
} = {}) => {
	if (!iconsRoot) {
		throw new Error('iconsRoot is required');
	}

	const files = (await walkSvgFiles(iconsRoot)).sort((left, right) => left.localeCompare(right));
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
		const aliases = new Set([iconName, rawNormalizedPath, rawBasename, canonicalBaseName]);

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
			filePath: `${filePathPrefix}/${relativePath}`,
			aliases: Array.from(aliases).filter(Boolean).sort((left, right) => left.localeCompare(right)),
		});
	}

	entries.sort((left, right) => left.iconName.localeCompare(right.iconName));

	const categories = Array.from(new Set(entries.map((entry) => entry.category))).sort((left, right) =>
		left.localeCompare(right)
	);
	const names = entries.map((entry) => entry.iconName);
	const keyToName = Object.fromEntries(
		entries
			.slice()
			.sort((left, right) => left.key.localeCompare(right.key))
			.map((entry) => [entry.key, entry.iconName])
	);
	const nameToFile = Object.fromEntries(entries.map((entry) => [entry.iconName, entry.filePath]));
	const categoryToNames = Object.fromEntries(
		categories.map((category) => [
			category,
			entries
				.filter((entry) => entry.category === category)
				.map((entry) => entry.iconName),
		])
	);
	const aliasToName = {};

	for (const entry of entries) {
		for (const alias of entry.aliases) {
			if (!aliasToName[alias]) {
				aliasToName[alias] = entry.iconName;
			}
		}
	}

	for (const [alias, iconName] of Object.entries(OPEN_ICON_CUSTOM_ALIASES)) {
		if (!aliasToName[alias] && names.includes(iconName)) {
			aliasToName[alias] = iconName;
		}
	}

	return {
		entries,
		categories,
		names,
		keyToName,
		nameToFile,
		categoryToNames,
		aliasToName,
	};
};

export const renderOpenIconCatalogTs = (catalog) => {
	const keyLines = Object.entries(catalog.keyToName)
		.map(([key, value]) => `\t${key}: ${quote(value)},`)
		.join('\n');

	const nameToFileLines = Object.entries(catalog.nameToFile)
		.map(([name, value]) => `\t${quote(name)}: ${quote(value)},`)
		.join('\n');

	const categoryLines = Object.entries(catalog.categoryToNames)
		.map(([category, names]) => `\t${quote(category)}: [${names.map((name) => quote(name)).join(', ')}],`)
		.join('\n');

	const aliasLines = Object.entries(catalog.aliasToName)
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([alias, iconName]) => `\t${quote(alias)}: ${quote(iconName)},`)
		.join('\n');

	return `// AUTO-GENERATED FILE. DO NOT EDIT.
// Generated by scripts/generate-open-icon-catalog.mjs

export const OPEN_ICON_CATEGORIES = [${catalog.categories.map((category) => quote(category)).join(', ')}] as const;
export type OpenIconCategory = (typeof OPEN_ICON_CATEGORIES)[number];

export const OPEN_ICON_NAMES = [${catalog.names.map((name) => quote(name)).join(', ')}] as const;
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
};
