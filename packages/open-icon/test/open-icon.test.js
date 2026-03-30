import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
	Icons,
	getIcon,
	getOpenIconImportPath,
	resolveOpenIconName,
} from '../dist/index.js';
import {
	loadIcon,
	peekLoadedIcon,
} from '../dist/runtime.js';
import {
	IconAddM,
	IconUiKey,
	IconUiSearchM,
} from '../dist/icons.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Icons exposes ergonomic root lookup keys', () => {
	assert.equal(Icons.UI_ADD_M, 'ui/add-m');
	assert.equal(Icons.UI_KEY, 'ui/key');
	assert.equal(Icons.MISC_KEY, 'misc/key');
});

test('resolveOpenIconName and getOpenIconImportPath use the shared catalog rules', () => {
	assert.equal(resolveOpenIconName('icon_search-m.svg'), 'ui/search-m');
	assert.equal(
		getOpenIconImportPath('wayfinding/check-in'),
		'open-icon-svg/icons/wayfinding/icon_check%20in.svg'
	);
});

test('custom semantic aliases resolve to canonical icon names', () => {
	assert.equal(resolveOpenIconName('plus'), 'ui/add-m');
	assert.equal(resolveOpenIconName('x'), 'ui/multiply-m');
	assert.equal(resolveOpenIconName('check'), 'ui/check-m');
	assert.equal(resolveOpenIconName('code'), 'ui/code-chevrons');
	assert.equal(resolveOpenIconName('edit'), 'ui/edit-line');
	assert.equal(resolveOpenIconName('archive'), 'ui/file-archive');
});

test('getIcon returns the raw svg string for a known icon', () => {
	const svg = getIcon(Icons.UI_ADD_M);

	assert.ok(svg);
	assert.match(svg, /^<svg\b/i);
});

test('loadIcon lazily loads a single known icon', async () => {
	const svg = await loadIcon(Icons.UI_ADD_M);

	assert.ok(svg);
	assert.match(svg, /^<svg\b/i);
	assert.equal(peekLoadedIcon(Icons.UI_ADD_M), svg);
});

test('icons subpath exports named svg constants', () => {
	assert.equal(IconUiSearchM, getIcon('ui/search-m'));
	assert.equal(IconAddM, getIcon(Icons.UI_ADD_M));
	assert.equal(typeof IconUiKey, 'string');
});

test('runtime and static entrypoints stay split in the built package', async () => {
	const runtimeSource = await readFile(path.join(__dirname, '../dist/runtime.js'), 'utf8');
	const staticSource = await readFile(path.join(__dirname, '../dist/static.js'), 'utf8');

	assert.match(runtimeSource, /openIconLoaders\.generated/);
	assert.doesNotMatch(runtimeSource, /openIconIcons\.generated/);
	assert.match(staticSource, /openIconIcons\.generated/);
});
