import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

class HTMLElementStub {
	constructor() {
		this.attributes = new Map();
		this.shadowRoot = null;
	}

	attachShadow() {
		this.shadowRoot = { innerHTML: '' };
		return this.shadowRoot;
	}

	getAttribute(name) {
		return this.attributes.get(name) ?? null;
	}

	setAttribute(name, value) {
		this.attributes.set(name, String(value));
	}
}

globalThis.HTMLElement ??= HTMLElementStub;

const registry = new Map();
globalThis.customElements ??= {
	define(name, ctor) {
		registry.set(name, ctor);
	},
	get(name) {
		return registry.get(name);
	},
};

const {
	Icons,
	defineOpenIconElement,
	loadWcOpenIconMarkup,
	OpenIconElement,
	resolveWcOpenIconName,
} = await import('../dist/index.js');
const {
	renderStaticOpenIconMarkup,
} = await import('../dist/static.js');
const {
	CdnOpenIconElement,
	defineCdnOpenIconElement,
	getCdnOpenIconSvgUrl,
	loadCdnOpenIconMarkup,
	resolveCdnOpenIconName,
} = await import('../dist/cdn/index.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('resolveWcOpenIconName resolves root icon keys and names', () => {
	assert.equal(resolveWcOpenIconName('UI_SEARCH_M'), 'ui/search-m');
	assert.equal(resolveWcOpenIconName(Icons.UI_SEARCH_M), 'ui/search-m');
});

test('resolveCdnOpenIconName normalizes canonical icon paths', () => {
	assert.equal(resolveCdnOpenIconName(' open-icon-svg/icons/ui/icon_search-m.svg '), 'ui/search-m');
});

test('loadWcOpenIconMarkup returns inline svg markup', async () => {
	const markup = await loadWcOpenIconMarkup(Icons.UI_SEARCH_M, null);

	assert.match(markup, /<style>/);
	assert.match(markup, /aria-hidden="true"/);
	assert.match(markup, /<svg\b/i);
});

test('renderStaticOpenIconMarkup returns static inline svg markup', () => {
	const markup = renderStaticOpenIconMarkup(Icons.UI_SEARCH_M, 'Search');

	assert.match(markup, /role="img"/);
	assert.match(markup, /aria-label="Search"/);
	assert.match(markup, /<svg\b/i);
});

test('getCdnOpenIconSvgUrl returns the API svg route', () => {
	assert.equal(
		getCdnOpenIconSvgUrl('ui/search-m'),
		'https://api.open-icon.org/v1/icons/ui%2Fsearch-m.svg'
	);
	assert.equal(
		getCdnOpenIconSvgUrl('ui/search-m', { apiBaseUrl: 'https://cdn.example.com/base/' }),
		'https://cdn.example.com/base/v1/icons/ui%2Fsearch-m.svg'
	);
});

test('defineOpenIconElement registers the element only once', () => {
	defineOpenIconElement();
	defineOpenIconElement();

	assert.equal(typeof globalThis.customElements.get('open-icon'), 'function');
});

test('OpenIconElement loads icon markup into its shadow root', async () => {
	const element = new OpenIconElement();

	element.setAttribute('name', Icons.UI_SEARCH_M);
	element.connectedCallback();
	await new Promise((resolve) => setTimeout(resolve, 0));

	assert.match(element.shadowRootRef.innerHTML, /<svg\b/i);
	assert.match(element.shadowRootRef.innerHTML, /aria-hidden="true"/);
});

test('loadCdnOpenIconMarkup fetches svg markup from the API route', async () => {
	const originalFetch = globalThis.fetch;
	const calls = [];

	globalThis.fetch = async (url) => {
		calls.push(String(url));
		return new Response('<svg viewBox="0 0 24 24"></svg>', {
			status: 200,
			headers: {
				'content-type': 'image/svg+xml; charset=utf-8',
			},
		});
	};

	try {
		const markup = await loadCdnOpenIconMarkup('ui/search-m', 'Search');

		assert.equal(calls[0], 'https://api.open-icon.org/v1/icons/ui%2Fsearch-m.svg');
		assert.match(markup, /role="img"/);
		assert.match(markup, /<svg\b/i);
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test('defineCdnOpenIconElement registers the browser CDN element only once', () => {
	defineCdnOpenIconElement();
	defineCdnOpenIconElement({ apiBaseUrl: 'https://api.open-icon.org/' });

	assert.equal(typeof globalThis.customElements.get('open-icon'), 'function');
});

test('CdnOpenIconElement loads icon markup into its shadow root', async () => {
	const originalFetch = globalThis.fetch;

	globalThis.fetch = async () =>
		new Response('<svg viewBox="0 0 24 24"></svg>', {
			status: 200,
			headers: {
				'content-type': 'image/svg+xml; charset=utf-8',
			},
		});

	try {
		const element = new CdnOpenIconElement();

		element.setAttribute('name', 'ui/search-m');
		element.connectedCallback();
		await new Promise((resolve) => setTimeout(resolve, 0));

		assert.match(element.shadowRootRef.innerHTML, /<svg\b/i);
		assert.match(element.shadowRootRef.innerHTML, /aria-hidden="true"/);
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test('built entrypoints keep runtime and static icon loading separate', async () => {
	const runtimeSource = await readFile(path.join(__dirname, '../dist/index.js'), 'utf8');
	const staticSource = await readFile(path.join(__dirname, '../dist/static.js'), 'utf8');
	const cdnSource = await readFile(path.join(__dirname, '../dist/cdn/index.js'), 'utf8');

	assert.match(runtimeSource, /open-icon\/runtime/);
	assert.doesNotMatch(runtimeSource, /open-icon\/static/);
	assert.match(staticSource, /open-icon\/static/);
	assert.doesNotMatch(cdnSource, /open-icon\/runtime/);
	assert.doesNotMatch(cdnSource, /open-icon\/static/);
});
