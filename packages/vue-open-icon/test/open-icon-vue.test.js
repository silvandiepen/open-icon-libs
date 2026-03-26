import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';

import {
	default as Icon,
	Icons,
} from '../dist/index.js';
import {
	StaticIcon,
	getIcon,
} from '../dist/static.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Icon renders a wrapped inline svg for a canonical icon name', async () => {
	const html = await renderToString(createSSRApp(() => h(Icon, { name: Icons.UI_SEARCH_M })));

	assert.match(html, /^<span\b/i);
	assert.match(html, /aria-hidden="true"/);
	assert.match(html, /<svg\b/i);
	assert.match(html, /search-m/i);
});

test('Icon resolves Icons keys passed as plain strings', async () => {
	const html = await renderToString(createSSRApp(() => h(Icon, { name: 'UI_SEARCH_M' })));

	assert.match(html, /<svg\b/i);
	assert.match(html, /search-m/i);
});

test('Icon forwards accessibility props and wrapper attrs', async () => {
	const html = await renderToString(
		createSSRApp(() =>
			h(Icon, {
				name: Icons.UI_ADD_M,
				tag: 'i',
				title: 'Add',
				class: 'app-icon',
				id: 'icon-add',
			})
		)
	);

	assert.match(html, /^<i\b/i);
	assert.match(html, /class="app-icon"/);
	assert.match(html, /id="icon-add"/);
	assert.match(html, /role="img"/);
	assert.match(html, /aria-label="Add"/);
});

test('StaticIcon renders synchronously from the static entrypoint', async () => {
	const html = await renderToString(createSSRApp(() => h(StaticIcon, { name: Icons.UI_SEARCH_M })));

	assert.match(html, /<svg\b/i);
	assert.match(html, /search-m/i);
});

test('static entry exposes shared icon helpers', () => {
	assert.equal(typeof Icons.UI_SEARCH_M, 'string');
	assert.equal(getIcon(Icons.UI_SEARCH_M)?.startsWith('<svg'), true);
});

test('built entrypoints keep runtime and static icon loading separate', async () => {
	const runtimeSource = await readFile(path.join(__dirname, '../dist/index.js'), 'utf8');
	const staticSource = await readFile(path.join(__dirname, '../dist/static.js'), 'utf8');

	assert.match(runtimeSource, /open-icon\/runtime/);
	assert.doesNotMatch(runtimeSource, /open-icon\/static/);
	assert.match(staticSource, /open-icon\/static/);
});
