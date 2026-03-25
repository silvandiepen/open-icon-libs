import test from 'node:test';
import assert from 'node:assert/strict';

import { getIconSnippets } from '../assets/scripts/lib/site-formatters.js';

globalThis.HTMLElement ??= class HTMLElement {};

const {
	getCategoryPreviewIcons,
	getGalleryIconPreviewUrl,
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
		name: 'ui/search-l',
		category: 'ui',
		label: 'Search L',
		filePath: 'icons/ui/icon_search-l.svg',
		url: '/media/icons/ui/icon_search-l.svg',
		aliases: ['ui/search-l', 'search-l'],
	},
	{
		name: 'ui/search-xl',
		category: 'ui',
		label: 'Search XL',
		filePath: 'icons/ui/icon_search-xl.svg',
		url: '/media/icons/ui/icon_search-xl.svg',
		aliases: ['ui/search-xl', 'search-xl'],
	},
	{
		name: 'ui/search-xxl',
		category: 'ui',
		label: 'Search XXL',
		filePath: 'icons/ui/icon_search-xxl.svg',
		url: '/media/icons/ui/icon_search-xxl.svg',
		aliases: ['ui/search-xxl', 'search-xxl'],
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
		getGalleryIcons(icons, 'search m', 'ui').map((icon) => icon.name),
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

test('getCategoryPreviewIcons returns up to four icons for the category', () => {
	assert.deepEqual(
		getCategoryPreviewIcons(icons, 'ui').map((icon) => icon.name),
		['ui/search-m', 'ui/search-l', 'ui/search-xl', 'ui/search-xxl']
	);
});

test('getIconSnippets returns import examples', () => {
	const snippets = getIconSnippets(icons[0]);

	assert.equal(snippets[0].value, 'ui/search-m');
	assert.match(snippets[1].value, /open-icon-svg\/icons\/ui\/icon_search-m\.svg/);
	assert.match(snippets[2].value, /\?open-icon/);
});

test('getGalleryIconPreviewUrl resolves the transformed package icon url', () => {
	assert.equal(
		getGalleryIconPreviewUrl(icons[0], {
			fill: '#ed2024',
			fillSecondary: '',
			stroke: '#231f20',
			strokeSecondary: '',
			opacity: '0.9',
			strokeWidth: '2',
		}),
		'/media/icons/ui/icon_search-m.svg'
	);
});
