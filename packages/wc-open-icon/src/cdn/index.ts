import type {
	CdnOpenIconDefinitionOptions,
	CdnOpenIconRequestOptions,
} from './cdn.model.js';

const BaseHTMLElement = globalThis.HTMLElement ?? class {};

const OPEN_ICON_API_PATHNAME = '/v1/icons';
const DEFAULT_OPEN_ICON_API_BASE_URL = 'https://api.open-icon.org';
const OPEN_ICON_CDN_SVG_BY_URL = new Map<string, Promise<string>>();

const normalizeSegment = (value: string): string =>
	value
		.toLowerCase()
		.trim()
		.replace(/&/g, ' and ')
		.replace(/["'`]/g, '')
		.replace(/[\s_+]+/g, '-')
		.replace(/[^a-z0-9-]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');

const normalizePath = (value: string): string =>
	value
		.replace(/\\/g, '/')
		.split('/')
		.map(normalizeSegment)
		.filter(Boolean)
		.join('/');

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
	const decodedValue = decodeURIComponent(value).trim();
	const withoutExtension = decodedValue.replace(/\.svg$/i, '');
	const withoutPrefix = stripPackagePathPrefixes(withoutExtension);
	const normalizedPath = normalizePath(withoutPrefix);
	if (!normalizedPath) {
		return '';
	}

	const segments = normalizedPath.split('/');
	const basename = segments.pop() ?? '';
	const strippedBasename = normalizeSegment(stripIconPrefix(basename));
	return strippedBasename
		? segments.length
			? `${segments.join('/')}/${strippedBasename}`
			: strippedBasename
		: normalizedPath;
};

const normalizeApiBaseUrl = (value: string | null | undefined): string =>
	(value?.trim() || DEFAULT_OPEN_ICON_API_BASE_URL).replace(/\/+$/g, '');

const escapeAttribute = (value: string): string =>
	value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

export const resolveCdnOpenIconName = (value: string | null | undefined): string | null => {
	if (typeof value !== 'string') {
		return null;
	}

	const normalized = normalizeLookupValue(value);
	return normalized || null;
};

export const getCdnOpenIconSvgUrl = (
	name: string | null | undefined,
	options: CdnOpenIconRequestOptions = {}
): string | null => {
	const iconName = resolveCdnOpenIconName(name);
	if (!iconName) {
		return null;
	}

	return `${normalizeApiBaseUrl(options.apiBaseUrl)}${OPEN_ICON_API_PATHNAME}/${encodeURIComponent(iconName)}.svg`;
};

export const renderCdnOpenIconMarkup = (
	svg: string,
	title: string | null | undefined,
	ariaLabel?: string | null | undefined
): string => {
	const accessibleLabel = title?.trim() || ariaLabel?.trim() || '';
	const accessibilityAttributes = accessibleLabel
		? ` role="img" aria-label="${escapeAttribute(accessibleLabel)}" title="${escapeAttribute(accessibleLabel)}"`
		: ' aria-hidden="true"';

	return `<style>:host{display:inline-flex;line-height:0;vertical-align:middle}svg{display:block;width:1em;height:1em}</style><span part="icon"${accessibilityAttributes}>${svg}</span>`;
};

export const loadCdnOpenIconSvg = async (
	name: string | null | undefined,
	options: CdnOpenIconRequestOptions = {}
): Promise<string | null> => {
	const url = getCdnOpenIconSvgUrl(name, options);
	if (!url) {
		return null;
	}

	const cachedResponse = OPEN_ICON_CDN_SVG_BY_URL.get(url);
	if (cachedResponse) {
		return cachedResponse;
	}

	const request = fetch(url)
		.then(async (response) => {
			if (!response.ok) {
				return '';
			}

			return response.text();
		})
		.catch(() => '')
		.then((svg) => {
			if (!svg) {
				OPEN_ICON_CDN_SVG_BY_URL.delete(url);
			}

			return svg;
		});

	OPEN_ICON_CDN_SVG_BY_URL.set(url, request);
	const svg = await request;
	return svg || null;
};

export const loadCdnOpenIconMarkup = async (
	name: string | null | undefined,
	title: string | null | undefined,
	ariaLabel?: string | null | undefined,
	options: CdnOpenIconRequestOptions = {}
): Promise<string> => {
	const svg = await loadCdnOpenIconSvg(name, options);
	if (!svg) {
		return '';
	}

	return renderCdnOpenIconMarkup(svg, title, ariaLabel);
};

export class CdnOpenIconElement extends BaseHTMLElement {
	static get observedAttributes(): string[] {
		return ['name', 'title', 'aria-label', 'api-base-url'];
	}

	static defaultApiBaseUrl = DEFAULT_OPEN_ICON_API_BASE_URL;

	readonly shadowRootRef: ShadowRoot;

	constructor() {
		super();
		this.shadowRootRef = this.attachShadow({ mode: 'open' });
	}

	connectedCallback(): void {
		this.render();
	}

	attributeChangedCallback(): void {
		this.render();
	}

	get name(): string {
		return this.getAttribute('name') ?? '';
	}

	set name(value: string) {
		this.setAttribute('name', value);
	}

	private render(): void {
		const name = this.getAttribute('name');
		const title = this.getAttribute('title');
		const ariaLabel = this.getAttribute('aria-label');
		const apiBaseUrl = this.getAttribute('api-base-url') ?? CdnOpenIconElement.defaultApiBaseUrl;

		void loadCdnOpenIconMarkup(name, title, ariaLabel, { apiBaseUrl }).then((markup) => {
			if (
				name !== this.getAttribute('name') ||
				title !== this.getAttribute('title') ||
				ariaLabel !== this.getAttribute('aria-label') ||
				apiBaseUrl !== (this.getAttribute('api-base-url') ?? CdnOpenIconElement.defaultApiBaseUrl)
			) {
				return;
			}

			this.shadowRootRef.innerHTML = markup;
		});
	}
}

export const defineCdnOpenIconElement = (options: CdnOpenIconDefinitionOptions = {}): void => {
	if (!globalThis.customElements) {
		return;
	}

	const tagName = options.tagName?.trim() || 'open-icon';
	CdnOpenIconElement.defaultApiBaseUrl = normalizeApiBaseUrl(options.apiBaseUrl);

	if (!globalThis.customElements.get(tagName)) {
		globalThis.customElements.define(tagName, CdnOpenIconElement);
	}
};

export type * from './cdn.model.js';
