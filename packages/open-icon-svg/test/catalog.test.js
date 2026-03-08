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
	assert.equal(getOpenIconFilePath('ui/settings-3'), 'icons/ui/icon_settings 3.svg');
	assert.equal(
		getOpenIconImportPath('ui/settings-3'),
		'open-icon-svg/icons/ui/icon_settings%203.svg'
	);
});

test('isOpenIconName guards unknown values', () => {
	assert.equal(isOpenIconName('ui/search-m'), true);
	assert.equal(isOpenIconName('ui/does-not-exist'), false);
});
