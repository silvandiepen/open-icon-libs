import {
	OPEN_ICON_ALIAS_TO_NAME,
	OPEN_ICON_CATEGORIES,
	OPEN_ICON_CATEGORY_TO_NAMES,
	OPEN_ICON_KEY_TO_NAME,
	OPEN_ICON_NAME_TO_FILE,
	OPEN_ICON_NAMES,
} from './generated/openIconCatalog.generated.js';
import { OPEN_ICON_SVG_LOADER_BY_NAME } from './generated/openIconLoaders.generated.js';
import type { OpenIconName } from './generated/openIconCatalog.generated.js';

export const Icons = OPEN_ICON_KEY_TO_NAME;

export {
	OPEN_ICON_ALIAS_TO_NAME,
	OPEN_ICON_CATEGORIES,
	OPEN_ICON_CATEGORY_TO_NAMES,
	OPEN_ICON_KEY_TO_NAME,
	OPEN_ICON_NAME_TO_FILE,
	OPEN_ICON_NAMES,
};

export type {
	OpenIconCategory,
	OpenIconName,
} from './generated/openIconCatalog.generated.js';

export type OpenIconKey = keyof typeof OPEN_ICON_KEY_TO_NAME;

const OPEN_ICON_NAME_SET = new Set<string>(OPEN_ICON_NAMES);
const OPEN_ICON_LOADED_SVG_BY_NAME = new Map<OpenIconName, string>();

const normalizeSegment = (value: string): string => {
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

const normalizePath = (value: string): string => {
	return value
		.replace(/\\/g, '/')
		.split('/')
		.map(normalizeSegment)
		.filter(Boolean)
		.join('/');
};

const stripIconPrefix = (value: string): string => value.replace(/^icon[-_]*/i, '');

const stripPackagePathPrefixes = (value: string): string => {
	const segments = value.split('/').filter(Boolean);
	const iconsIndex = segments.indexOf('icons');
	if (iconsIndex >= 0 && iconsIndex < segments.length - 1) {
		return segments.slice(iconsIndex + 1).join('/');
	}

	return value;
};

const normalizeLookupValue = (value: string): string => {
	const withoutExtension = value.replace(/\.svg$/i, '');
	const withoutPrefix = stripPackagePathPrefixes(withoutExtension);
	const normalizedPath = normalizePath(withoutPrefix);
	if (!normalizedPath) {
		return '';
	}

	const segments = normalizedPath.split('/');
	const basename = segments.pop() ?? '';
	const strippedBasename = normalizeSegment(stripIconPrefix(basename));
	const normalizedBasename = normalizeSegment(basename);
	const withStripped = strippedBasename
		? segments.length
			? `${segments.join('/')}/${strippedBasename}`
			: strippedBasename
		: '';

	return withStripped || normalizedPath || normalizedBasename;
};

export const isOpenIconName = (value: string): value is OpenIconName => OPEN_ICON_NAME_SET.has(value);

export const resolveOpenIconName = (value: string): OpenIconName | null => {
	const normalized = normalizeLookupValue(value);
	if (!normalized) {
		return null;
	}

	const direct = OPEN_ICON_ALIAS_TO_NAME[normalized as keyof typeof OPEN_ICON_ALIAS_TO_NAME];
	if (direct) {
		return direct;
	}

	if (OPEN_ICON_NAME_SET.has(normalized)) {
		return normalized as OpenIconName;
	}

	const basename = normalized.split('/').pop() ?? normalized;
	const fallback = OPEN_ICON_ALIAS_TO_NAME[basename as keyof typeof OPEN_ICON_ALIAS_TO_NAME];
	return fallback ?? null;
};

export const getOpenIconFilePath = (value: string): string | null => {
	const iconName = resolveOpenIconName(value);
	if (!iconName) {
		return null;
	}

	return OPEN_ICON_NAME_TO_FILE[iconName] ?? null;
};

export const getOpenIconImportPath = (value: string): string | null => {
	const filePath = getOpenIconFilePath(value);
	if (!filePath) {
		return null;
	}

	return encodeURI(`open-icon-svg/${filePath}`);
};

export const peekLoadedIcon = (value: string): string | null => {
	const iconName = resolveOpenIconName(value);
	if (!iconName) {
		return null;
	}

	return OPEN_ICON_LOADED_SVG_BY_NAME.get(iconName) ?? null;
};

export const loadIcon = async (value: string): Promise<string | null> => {
	const iconName = resolveOpenIconName(value);
	if (!iconName) {
		return null;
	}

	const cached = OPEN_ICON_LOADED_SVG_BY_NAME.get(iconName);
	if (cached) {
		return cached;
	}

	const loader = OPEN_ICON_SVG_LOADER_BY_NAME[iconName];
	if (!loader) {
		return null;
	}

	const svg = await loader();
	OPEN_ICON_LOADED_SVG_BY_NAME.set(iconName, svg);
	return svg;
};
