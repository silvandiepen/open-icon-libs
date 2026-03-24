import { Resvg } from '@cf-wasm/resvg';

import type { Env } from './api.model.js';
import {
	applySvgMutations,
	createCorsPreflightResponse,
	createErrorResponse,
	createIconDetail,
	createJsonResponse,
	getAssetPathForIcon,
	getCatalogSummary,
	getCategories,
	getRasterSizeOptions,
	getPackageDetail,
	getPackages,
	getPngResponseHeaders,
	getSvgResponseHeaders,
	parseIconListRequest,
	paginate,
	resolveIconName,
	searchIcons,
} from './api.js';

const getBaseUrl = (request: Request): string => {
	const url = new URL(request.url);
	return `${url.protocol}//${url.host}`;
};

const fetchAsset = async (request: Request, env: Env, assetPath: string): Promise<Response> =>
	env.ASSETS.fetch(new Request(new URL(`/${assetPath.replace(/^\//, '')}`, request.url)));

const loadTransformedSvg = async (
	request: Request,
	env: Env,
	iconName: string,
	searchParams: URLSearchParams
): Promise<string | null> => {
	const assetPath = getAssetPathForIcon(iconName);
	if (!assetPath) {
		return null;
	}

	const assetResponse = await fetchAsset(request, env, assetPath);
	if (!assetResponse.ok) {
		return null;
	}

	const rawSvg = await assetResponse.text();
	return applySvgMutations(rawSvg, searchParams);
};

const createSearchResponse = (
	baseUrl: string,
	query: string,
	category: string,
	page: number,
	perPage: number
): Response => {
	const results = searchIcons(query, category);

	return createJsonResponse({
		total: results.length,
		page,
		perPage,
		items: paginate(results, page, perPage).map((icon) => ({
			...icon,
			detailUrl: `${baseUrl}/v1/icons/${encodeURIComponent(icon.name)}`,
		})),
	});
};

const serveSvg = async (request: Request, env: Env, iconName: string): Promise<Response> => {
	const transformedSvg = await loadTransformedSvg(request, env, iconName, new URL(request.url).searchParams);
	if (!transformedSvg) {
		return createErrorResponse(404, `Asset missing for ${iconName}`);
	}

	return new Response(transformedSvg, {
		status: 200,
		headers: getSvgResponseHeaders(),
	});
};

const servePng = async (request: Request, env: Env, iconName: string): Promise<Response> => {
	const url = new URL(request.url);
	const { width, height } = getRasterSizeOptions(url);
	const svgSearchParams = new URLSearchParams(url.searchParams);
	svgSearchParams.delete('size');
	svgSearchParams.delete('width');
	svgSearchParams.delete('height');
	const transformedSvg = await loadTransformedSvg(request, env, iconName, svgSearchParams);
	if (!transformedSvg) {
		return createErrorResponse(404, `Asset missing for ${iconName}`);
	}

	try {
		const rasterSize = width ?? height ?? 512;
		const renderedImage = new Resvg(transformedSvg, {
			fitTo: {
				mode: width ? 'width' : 'height',
				value: rasterSize,
			},
		}).render();
		const pngBytes = renderedImage.asPng();
		const pngBuffer = new ArrayBuffer(pngBytes.byteLength);
		new Uint8Array(pngBuffer).set(pngBytes);

		return new Response(pngBuffer, {
			status: 200,
			headers: getPngResponseHeaders(),
		});
	} catch {
		return createErrorResponse(502, 'PNG conversion failed in the worker.');
	}
};

const createIndexResponse = (baseUrl: string): Response =>
	createJsonResponse({
		name: 'open-icon-api',
		version: '0.1.0',
		baseUrl,
		endpoints: [
			'/health',
			'/v1/catalog',
			'/v1/categories',
			'/v1/icons',
			'/v1/icons/search',
			'/v1/icons/:name',
			'/v1/icons/:name.svg',
			'/v1/icons/:name.png',
			'/v1/packages',
			'/v1/packages/:name',
		],
	});

const router = async (request: Request, env: Env): Promise<Response> => {
	if (request.method === 'OPTIONS') {
		return createCorsPreflightResponse();
	}

	const url = new URL(request.url);
	const pathname = url.pathname.replace(/\/+$/, '') || '/';
	const baseUrl = getBaseUrl(request);

	if (pathname === '/_asset' || pathname.startsWith('/_asset/')) {
		const assetPath = pathname.replace(/^\/_asset\/?/, '');
		return fetchAsset(request, env, assetPath);
	}

	if (pathname === '/' || pathname === '/v1') {
		return createIndexResponse(baseUrl);
	}

	if (request.method === 'POST' && pathname === '/v1/icons/search') {
		const body = (await request.json()) as {
			query?: string;
			category?: string;
			page?: number;
			perPage?: number;
		};

		return createSearchResponse(
			baseUrl,
			body.query ?? '',
			body.category ?? 'all',
			typeof body.page === 'number' ? Math.max(body.page, 1) : 1,
			typeof body.perPage === 'number' ? Math.min(Math.max(body.perPage, 1), 200) : 48
		);
	}

	if (request.method !== 'GET') {
		return createErrorResponse(405, 'Only GET, POST, and OPTIONS are supported.');
	}

	if (pathname === '/health') {
		return createJsonResponse({ ok: true });
	}

	if (pathname === '/v1/catalog') {
		const includeEntries = url.searchParams.get('include') === 'entries';
		return createJsonResponse({
			...getCatalogSummary(),
			...(includeEntries ? { entries: searchIcons('', 'all') } : {}),
		});
	}

	if (pathname === '/v1/categories') {
		return createJsonResponse({ items: getCategories() });
	}

	if (pathname === '/v1/icons') {
		const { query, category, page, perPage } = parseIconListRequest(url);
		return createSearchResponse(baseUrl, query, category, page, perPage);
	}

	if (pathname === '/v1/packages') {
		const packages = getPackages();
		return createJsonResponse({ total: packages.length, items: packages });
	}

	if (pathname.startsWith('/v1/packages/')) {
		const packageName = decodeURIComponent(pathname.replace('/v1/packages/', ''));
		const packageDetail = getPackageDetail(packageName);
		if (!packageDetail) {
			return createErrorResponse(404, `Unknown package: ${packageName}`);
		}

		return createJsonResponse(packageDetail);
	}

	const iconAssetMatch = pathname.match(/^\/v1\/icons\/(.+)\.(svg|png)$/);
	if (iconAssetMatch) {
		const [, rawName, extension] = iconAssetMatch;
		const iconName = resolveIconName(rawName);
		if (!iconName) {
			return createErrorResponse(404, `Unknown icon: ${decodeURIComponent(rawName)}`);
		}

		return extension === 'svg' ? serveSvg(request, env, iconName) : servePng(request, env, iconName);
	}

	if (pathname.startsWith('/v1/icons/')) {
		const rawName = pathname.replace('/v1/icons/', '');
		const iconName = resolveIconName(rawName);
		if (!iconName) {
			return createErrorResponse(404, `Unknown icon: ${decodeURIComponent(rawName)}`);
		}

		const detail = createIconDetail(iconName, baseUrl);
		return detail ? createJsonResponse(detail) : createErrorResponse(404, `Unknown icon: ${iconName}`);
	}

	return createErrorResponse(404, 'Not found');
};

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		return router(request, env);
	},
};
