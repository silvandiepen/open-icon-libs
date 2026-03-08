import test from 'node:test';
import assert from 'node:assert/strict';
import {
	OPEN_ICON_CATEGORIES,
	OPEN_ICON_KEY_TO_NAME,
	OPEN_ICON_NAMES,
	getOpenIconFilePath,
	getOpenIconImportPath,
	isOpenIconName,
	resolveOpenIconName,
} from '../dist/index.js';

test('catalog exports categories and names', () => {
	assert.equal(Array.isArray(OPEN_ICON_CATEGORIES), true);
	assert.equal(Array.isArray(OPEN_ICON_NAMES), true);
	assert.equal(OPEN_ICON_CATEGORIES.length > 0, true);
	assert.equal(OPEN_ICON_NAMES.length > 0, true);
});

test('contains expected key mappings', () => {
	assert.equal(OPEN_ICON_KEY_TO_NAME.UI_SEARCH_M, 'ui/search-m');
	assert.equal(OPEN_ICON_KEY_TO_NAME.ARROWS_CHEVRON_DOWN, 'arrows/chevron-down');
});

test('resolveOpenIconName supports canonical and prefixed names', () => {
	assert.equal(resolveOpenIconName('ui/search-m'), 'ui/search-m');
	assert.equal(resolveOpenIconName('ui/icon_search-m.svg'), 'ui/search-m');
	assert.equal(resolveOpenIconName('icon_chevron-down'), 'arrows/chevron-down');
});

test('resolves file path and import path with URI-safe encoding', () => {
	assert.equal(getOpenIconFilePath('wayfinding/check-in'), 'icons/wayfinding/icon_check in.svg');
	assert.equal(
		getOpenIconImportPath('wayfinding/check-in'),
		'open-icon-svg/icons/wayfinding/icon_check%20in.svg'
	);
});

test('isOpenIconName guards unknown values', () => {
	assert.equal(isOpenIconName('ui/search-m'), true);
	assert.equal(isOpenIconName('ui/does-not-exist'), false);
});
