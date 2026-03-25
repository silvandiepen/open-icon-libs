import test from 'node:test';
import assert from 'node:assert/strict';

import {
	Icons,
	getIcon,
	getOpenIconImportPath,
	resolveOpenIconName,
} from '../dist/index.js';
import {
	IconAddM,
	IconUiKey,
	IconUiSearchM,
} from '../dist/icons.js';

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

test('getIcon returns the raw svg string for a known icon', () => {
	const svg = getIcon(Icons.UI_ADD_M);

	assert.ok(svg);
	assert.match(svg, /^<svg\b/i);
});

test('icons subpath exports named svg constants', () => {
	assert.equal(IconUiSearchM, getIcon('ui/search-m'));
	assert.equal(IconAddM, getIcon(Icons.UI_ADD_M));
	assert.equal(typeof IconUiKey, 'string');
});
