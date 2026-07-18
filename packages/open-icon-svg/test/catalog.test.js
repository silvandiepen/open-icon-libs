import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	OPEN_ICON_CATEGORIES,
	OPEN_ICON_CATEGORY_TO_NAMES,
	OPEN_ICON_NAMES,
	getOpenIconFilePath,
	getOpenIconImportPath,
	isOpenIconName,
	resolveOpenIconName,
} from '../dist/index.js';
import { OPEN_ICON_CUSTOM_ALIASES } from '../scripts/openIconCustomAliases.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');

test('package exposes the catalog entrypoints alongside the raw svg assets', async () => {
	const packageJson = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));

	assert.deepEqual(packageJson.exports, {
		'.': {
			types: './dist/index.d.ts',
			import: './dist/index.js',
		},
		'./catalog': {
			types: './dist/generated/openIconCatalog.generated.d.ts',
			import: './dist/generated/openIconCatalog.generated.js',
		},
		'./icons/*': './icons/*',
		'./package.json': './package.json',
	});
});

test('known svg assets are present in the package', async () => {
	const svg = await readFile(
		path.join(packageRoot, 'icons', 'wayfinding', 'icon_check in.svg'),
		'utf8'
	);

	assert.match(svg, /<svg\b/i);
	assert.match(svg, /viewBox=/);
	assert.match(svg, /var\(--icon-fill/);
	assert.match(svg, /var\(--icon-stroke-color/);
});

test('catalog metadata is internally consistent', () => {
	assert.ok(OPEN_ICON_NAMES.length > 1000);
	// Every category listed maps to at least one name, and every categorised name
	// is a real catalog name.
	for (const category of OPEN_ICON_CATEGORIES) {
		const names = OPEN_ICON_CATEGORY_TO_NAMES[category];
		assert.ok(Array.isArray(names) && names.length > 0, `empty category: ${category}`);
		for (const name of names) {
			assert.ok(OPEN_ICON_NAMES.includes(name), `unknown name in ${category}: ${name}`);
		}
	}
});

test('resolveOpenIconName resolves canonical names, prefixes, file paths and .svg forms', () => {
	assert.equal(resolveOpenIconName('ui/search-m'), 'ui/search-m');
	assert.equal(resolveOpenIconName('UI / Search M'), 'ui/search-m');
	assert.equal(resolveOpenIconName('icon_search-m'), 'ui/search-m');
	assert.equal(resolveOpenIconName('open-icon-svg/icons/ui/icon_search-m.svg'), 'ui/search-m');
	assert.equal(resolveOpenIconName('definitely-not-an-icon'), null);
});

test('isOpenIconName narrows to catalog names', () => {
	assert.equal(isOpenIconName('ui/search-m'), true);
	assert.equal(isOpenIconName('search'), false);
});

test('getOpenIconFilePath and getOpenIconImportPath return usable single-icon paths', () => {
	const filePath = getOpenIconFilePath('search');
	assert.match(filePath, /^icons\/ui\/search-m\.svg$/);

	const importPath = getOpenIconImportPath('search');
	assert.equal(importPath, encodeURI(`open-icon-svg/${filePath}`));
	assert.equal(getOpenIconImportPath('definitely-not-an-icon'), null);
});

test('every custom semantic alias resolves to a real icon', () => {
	for (const [alias, target] of Object.entries(OPEN_ICON_CUSTOM_ALIASES)) {
		assert.ok(
			OPEN_ICON_NAMES.includes(target),
			`custom alias "${alias}" targets missing icon "${target}"`
		);
		assert.equal(
			resolveOpenIconName(alias),
			target,
			`custom alias "${alias}" did not resolve to "${target}"`
		);
	}
});
