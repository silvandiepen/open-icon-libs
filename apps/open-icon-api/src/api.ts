import {
	OPEN_ICON_API_ALIAS_TO_NAME,
	OPEN_ICON_API_CATEGORY_TO_NAMES,
	OPEN_ICON_API_ICONS,
	OPEN_ICON_API_NAME_TO_FILE,
	OPEN_ICON_API_PACKAGES,
} from './generated/openIconApi.generated.js';
import type { ApiIconDetail, ApiIconEntry, ApiPackageEntry } from './api.model.js';

const ICONS = OPEN_ICON_API_ICONS as unknown as readonly ApiIconEntry[];
const PACKAGES = OPEN_ICON_API_PACKAGES as unknown as readonly ApiPackageEntry[];

const ICON_INDEX = new Map<string, ApiIconEntry>(ICONS.map((entry) => [entry.name, entry]));
const PACKAGE_INDEX = new Map<string, ApiPackageEntry>(PACKAGES.map((entry) => [entry.name, entry]));

const SVG_CONTENT_TYPE = 'image/svg+xml; charset=utf-8';
const PNG_CONTENT_TYPE = 'image/png';
const PRIMARY_FILL_COLORS = new Set(['#ed2024', '#ed1c24', '#ed1f24', '#ee1c4e', '#ed1e2b', '#ed1e27', '#ff0013']);
const PRIMARY_STROKE_COLORS = new Set(['#000', '#010101', '#231f20']);
const SECONDARY_FILL_COLORS = new Set(['#000', '#010101', '#231f20', '#fff', '#ffffff']);
const SECONDARY_STROKE_COLORS = new Set(['#ed2024', '#ed1c24', '#ed1f24', '#ee1c4e', '#ed1e2b', '#ed1e27', '#ff0013']);

const escapeForHtml = (value: string): string =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');

const normalizeSearchValue = (value: string): string =>
	value
		.toLowerCase()
		.trim()
		.replace(/[_\s]+/g, '-')
		.replace(/[^a-z0-9/-]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');

const stripIconPrefix = (value: string): string => value.replace(/^icon[-_]*/i, '');

const buildLookupCandidates = (value: string): string[] => {
	const normalized = normalizeSearchValue(decodeURIComponent(value));
	if (!normalized) {
		return [];
	}

	const segments = normalized.split('/').filter(Boolean);
	const basename = segments.pop() ?? normalized;
	const strippedBasename = normalizeSearchValue(stripIconPrefix(basename));
	const strippedPath = strippedBasename
		? segments.length
			? `${segments.join('/')}/${strippedBasename}`
			: strippedBasename
		: '';

	return Array.from(new Set([normalized, strippedPath, strippedBasename].filter(Boolean)));
};

const clampNumber = (value: string | null, fallback: number, min: number, max: number): number => {
	const parsed = Number.parseInt(value ?? '', 10);
	if (!Number.isFinite(parsed)) {
		return fallback;
	}

	return Math.min(Math.max(parsed, min), max);
};

export const getRasterSizeOptions = (url: URL): { width?: number; height?: number } => {
	const size = url.searchParams.get('size');
	if (size) {
		const dimension = clampNumber(size, 512, 1, 4096);
		return { width: dimension, height: dimension };
	}

	const width = url.searchParams.get('width');
	const height = url.searchParams.get('height');
	return {
		...(width ? { width: clampNumber(width, 512, 1, 4096) } : {}),
		...(height ? { height: clampNumber(height, 512, 1, 4096) } : {}),
	};
};

export const resolveIconName = (value: string): string | null => {
	const candidates = buildLookupCandidates(value);
	for (const candidate of candidates) {
		const resolved = OPEN_ICON_API_ALIAS_TO_NAME[candidate as keyof typeof OPEN_ICON_API_ALIAS_TO_NAME];
		if (resolved) {
			return resolved;
		}
	}

	return null;
};

export const searchIcons = (query: string, category: string): ApiIconEntry[] => {
	const normalizedQuery = normalizeSearchValue(query);

	return ICONS.filter((icon) => {
		if (category && category !== 'all' && icon.category !== category) {
			return false;
		}

		if (!normalizedQuery) {
			return true;
		}

		const haystack = [icon.name, icon.label, ...icon.aliases].join(' ').toLowerCase();
		return haystack.includes(normalizedQuery);
	});
};

export const paginate = <T>(items: readonly T[], page: number, perPage: number): T[] => {
	const start = Math.max(page - 1, 0) * perPage;
	return items.slice(start, start + perPage);
};

export const applySvgMutations = (svg: string, searchParams: URLSearchParams): string => {
	let output = svg;
	const title = searchParams.get('title');
	const fill = searchParams.get('fill');
	const fillSecondary = searchParams.get('fillSecondary');
	const stroke = searchParams.get('stroke');
	const strokeSecondary = searchParams.get('strokeSecondary');
	const color = searchParams.get('color');
	const opacity = searchParams.get('opacity');
	const strokeWidth = searchParams.get('strokeWidth');

	const normalizePaintValue = (value: string): string => value.trim().toLowerCase();

	const replacePaintValue = (input: string, property: 'fill' | 'stroke', nextValue: string): string =>
		input
			.replace(new RegExp(`${property}="(?!none)[^"]*"`, 'gi'), `${property}="${nextValue}"`)
			.replace(new RegExp(`${property}:\\s*(?!none)[^;"']+`, 'gi'), `${property}: ${nextValue}`);

	const replacePaintGroup = (
		input: string,
		property: 'fill' | 'stroke',
		nextValue: string,
		targetValues: ReadonlySet<string>
	): string =>
		input
			.replace(new RegExp(`${property}="([^"]*)"`, 'gi'), (match, currentValue: string) => {
				const normalizedValue = normalizePaintValue(currentValue);
				if (normalizedValue === 'none' || !targetValues.has(normalizedValue)) {
					return match;
				}

				return `${property}="${nextValue}"`;
			})
			.replace(new RegExp(`${property}:\\s*([^;"']+)`, 'gi'), (match, currentValue: string) => {
				const normalizedValue = normalizePaintValue(currentValue);
				if (normalizedValue === 'none' || !targetValues.has(normalizedValue)) {
					return match;
				}

				return `${property}: ${nextValue}`;
			});

	const replaceDimensionValue = (input: string, property: 'stroke-width', nextValue: string): string =>
		input
			.replace(new RegExp(`${property}="[^"]*"`, 'gi'), `${property}="${nextValue}"`)
			.replace(new RegExp(`${property}:\\s*[^;"']+`, 'gi'), `${property}: ${nextValue}`);

	const setRootSvgAttribute = (input: string, attribute: string, value: string): string =>
		input.replace(/<svg\b([^>]*)>/i, (fullMatch, attributes: string) => {
			const attributePattern = new RegExp(`\\s${attribute}="[^"]*"`, 'i');
			if (attributePattern.test(attributes)) {
				return fullMatch.replace(attributePattern, ` ${attribute}="${value}"`);
			}

			return `<svg${attributes} ${attribute}="${value}">`;
		});

	if (title) {
		const sanitizedTitle = escapeForHtml(title);
		if (/<title>.*?<\/title>/i.test(output)) {
			output = output.replace(/<title>.*?<\/title>/i, `<title>${sanitizedTitle}</title>`);
		} else {
			output = output.replace(/<svg\b([^>]*)>/i, `<svg$1><title>${sanitizedTitle}</title>`);
		}
	}

	if (color) {
		output = replacePaintValue(output, 'fill', color);
		output = replacePaintValue(output, 'stroke', color);
	}

	if (fillSecondary) {
		output = replacePaintGroup(output, 'fill', fillSecondary, SECONDARY_FILL_COLORS);
	}

	if (fill) {
		output = replacePaintGroup(output, 'fill', fill, PRIMARY_FILL_COLORS);
	}

	if (stroke) {
		output = replacePaintGroup(output, 'stroke', stroke, PRIMARY_STROKE_COLORS);
	}

	if (strokeSecondary) {
		output = replacePaintGroup(output, 'stroke', strokeSecondary, SECONDARY_STROKE_COLORS);
	}

	if (opacity) {
		output = setRootSvgAttribute(output, 'opacity', opacity);
	}

	if (strokeWidth) {
		output = replaceDimensionValue(output, 'stroke-width', strokeWidth);
		output = setRootSvgAttribute(output, 'stroke-width', strokeWidth);
	}

	return output;
};

export const createJsonResponse = (data: unknown, init: ResponseInit = {}): Response =>
	new Response(JSON.stringify(data, null, 2), {
		...init,
		headers: {
			'access-control-allow-origin': '*',
			'access-control-allow-methods': 'GET,OPTIONS',
			'access-control-allow-headers': 'content-type',
			'cache-control': 'public, max-age=300',
			'content-type': 'application/json; charset=utf-8',
			...(init.headers ?? {}),
		},
	});

export const createErrorResponse = (status: number, message: string): Response =>
	createJsonResponse(
		{
			error: {
				status,
				message,
			},
		},
		{ status }
	);

export const createCorsPreflightResponse = (): Response =>
	new Response(null, {
		status: 204,
		headers: {
			'access-control-allow-origin': '*',
			'access-control-allow-methods': 'GET,OPTIONS',
			'access-control-allow-headers': 'content-type',
		},
	});

export const createIconDetail = (iconName: string, baseUrl: string): ApiIconDetail | null => {
	const icon = ICON_INDEX.get(iconName);
	if (!icon) {
		return null;
	}

	return {
		...icon,
		aliases: icon.aliases.filter((alias) => alias !== icon.name),
		svgUrl: `${baseUrl}/v1/icons/${encodeURIComponent(icon.name)}.svg`,
		pngUrl: `${baseUrl}/v1/icons/${encodeURIComponent(icon.name)}.png`,
	};
};

export const getPackageDetail = (packageName: string): ApiPackageEntry | null =>
	PACKAGE_INDEX.get(packageName) ?? null;

export const getPackages = (): readonly ApiPackageEntry[] => PACKAGES;

export const getAssetPathForIcon = (iconName: string): string | null =>
	OPEN_ICON_API_NAME_TO_FILE[iconName as keyof typeof OPEN_ICON_API_NAME_TO_FILE] ?? null;

export const getCategories = () =>
	Object.entries(OPEN_ICON_API_CATEGORY_TO_NAMES).map(([name, entries]) => ({
		name,
		count: entries.length,
	}));

export const getCatalogSummary = () => ({
	total: ICONS.length,
	categories: getCategories(),
	packages: PACKAGES.length,
});

export const getSvgResponseHeaders = (): HeadersInit => ({
	'access-control-allow-origin': '*',
	'cache-control': 'public, max-age=31536000, immutable',
	'content-type': SVG_CONTENT_TYPE,
});

export const getPngResponseHeaders = (): HeadersInit => ({
	'access-control-allow-origin': '*',
	'cache-control': 'public, max-age=86400',
	'content-type': PNG_CONTENT_TYPE,
});

export const parseIconListRequest = (url: URL) => ({
	query: url.searchParams.get('query') ?? '',
	category: url.searchParams.get('category') ?? 'all',
	page: clampNumber(url.searchParams.get('page'), 1, 1, 10_000),
	perPage: clampNumber(url.searchParams.get('perPage'), 48, 1, 200),
});
