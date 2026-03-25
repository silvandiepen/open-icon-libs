import test from 'node:test';
import assert from 'node:assert/strict';

import {
	createPackageCatalog,
	createSiteIconCatalog,
} from '../../../packages/open-icon-svg/scripts/openIconSiteData.mjs';

test('createSiteIconCatalog maps icon entries to media URLs and labels', () => {
	const catalog = createSiteIconCatalog({
		categories: ['ui'],
		categoryToNames: { ui: ['ui/search-m'] },
		entries: [
			{
				key: 'UI_SEARCH_M',
				iconName: 'ui/search-m',
				category: 'ui',
				filePath: 'icons/ui/icon_search-m.svg',
				aliases: ['ui/search-m', 'search-m', 'icon-search-m'],
			},
		],
	}, {
		apiBaseUrl: 'https://api.open-icon.org',
	});

	assert.equal(catalog.total, 1);
	assert.deepEqual(catalog.categories, [{ name: 'ui', count: 1 }]);
	assert.equal(catalog.entries[0].label, 'Search M');
	assert.equal(catalog.entries[0].constName, 'UI_SEARCH_M');
	assert.equal(catalog.entries[0].url, '/media/icons/ui/icon_search-m.svg');
	assert.equal(catalog.entries[0].apiUrl, 'https://api.open-icon.org/v1/icons/ui%2Fsearch-m');
});

test('createPackageCatalog adds install commands and routes', () => {
	const catalog = createPackageCatalog({
		packages: [
			{
				name: 'open-icon-svg',
				description: 'Catalog package',
				version: '0.1.1',
			},
		],
		totalIcons: 1131,
		totalCategories: 12,
	});

	assert.equal(catalog.total, 1);
	assert.equal(catalog.entries[0].install, 'npm install open-icon-svg');
	assert.equal(catalog.entries[0].href, '/packages/open-icon-svg/');
	assert.match(catalog.entries[0].highlights[0], /1131 icons across 12 categories/);
});
