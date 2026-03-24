import test from 'node:test';
import assert from 'node:assert/strict';

import { getIconSnippets } from '../assets/scripts/lib/site-formatters.js';

globalThis.HTMLElement ??= class HTMLElement {};

const {
	getGalleryIcons,
	getGalleryMode,
	shouldShowCategoryTiles,
} = await import('../assets/scripts/components/open-icon-gallery/open-icon-gallery.js');

const icons = [
	{
		name: 'ui/search-m',
		category: 'ui',
		label: 'Search M',
		filePath: 'icons/ui/icon_search-m.svg',
		url: '/media/icons/ui/icon_search-m.svg',
		aliases: ['ui/search-m', 'search-m', 'icon-search-m'],
	},
	{
		name: 'media/camera',
		category: 'media',
		label: 'Camera',
		filePath: 'icons/media/icon_camera.svg',
		url: '/media/icons/media/icon_camera.svg',
		aliases: ['media/camera', 'camera'],
	},
];

test('getGalleryMode normalizes preview mode', () => {
	assert.equal(getGalleryMode('preview'), 'preview');
	assert.equal(getGalleryMode(null), 'full');
});

test('getGalleryIcons filters by query and category', () => {
	assert.deepEqual(
		getGalleryIcons(icons, 'search', 'ui').map((icon) => icon.name),
		['ui/search-m']
	);
	assert.deepEqual(
		getGalleryIcons(icons, 'camera', 'all').map((icon) => icon.name),
		['media/camera']
	);
});

test('shouldShowCategoryTiles only returns true for full mode without filters', () => {
	assert.equal(shouldShowCategoryTiles('', 'all', 'full'), true);
	assert.equal(shouldShowCategoryTiles('camera', 'all', 'full'), false);
	assert.equal(shouldShowCategoryTiles('', 'media', 'full'), false);
	assert.equal(shouldShowCategoryTiles('', 'all', 'preview'), false);
});

test('getIconSnippets returns import examples', () => {
	const snippets = getIconSnippets(icons[0]);

	assert.equal(snippets[0].value, 'ui/search-m');
	assert.match(snippets[1].value, /open-icon-svg\/icons\/ui\/icon_search-m\.svg/);
	assert.match(snippets[2].value, /\?open-icon/);
});
