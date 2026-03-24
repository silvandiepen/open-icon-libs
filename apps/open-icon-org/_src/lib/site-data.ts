import type { SiteIconCatalog, SitePackageCatalog } from './site-data.model.js';

const ICONS_URL = '/assets/generated/icons.json';
const PACKAGES_URL = '/assets/generated/packages.json';

let iconsPromise: Promise<SiteIconCatalog> | null = null;
let packagesPromise: Promise<SitePackageCatalog> | null = null;

declare global {
	interface Window {
		OPEN_ICON_API_BASE_URL?: string;
	}
}

const fetchJson = async <T>(url: string): Promise<T> => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to load ${url}: ${response.status}`);
	}

	return response.json() as Promise<T>;
};

const getApiBaseUrl = (): string => {
	if (typeof window === 'undefined') {
		return '';
	}

	return window.OPEN_ICON_API_BASE_URL?.replace(/\/$/, '') ?? '';
};

export const loadIconCatalog = async (): Promise<SiteIconCatalog> => {
	const apiBaseUrl = getApiBaseUrl();
	iconsPromise ??= apiBaseUrl
		? fetchJson<{
				total: number;
				categories: SiteIconCatalog['categories'];
				entries: SiteIconCatalog['entries'];
		  }>(`${apiBaseUrl}/v1/catalog?include=entries`).then((data) => ({
				total: data.total,
				categories: data.categories,
				entries: data.entries,
		  }))
		: fetchJson<SiteIconCatalog>(ICONS_URL);
	return iconsPromise;
};

export const loadPackageCatalog = async (): Promise<SitePackageCatalog> => {
	const apiBaseUrl = getApiBaseUrl();
	packagesPromise ??= apiBaseUrl
		? fetchJson<{
				total: number;
				items: SitePackageCatalog['entries'];
		  }>(`${apiBaseUrl}/v1/packages`).then((data) => ({
				total: data.total,
				entries: data.items,
		  }))
		: fetchJson<SitePackageCatalog>(PACKAGES_URL);
	return packagesPromise;
};
