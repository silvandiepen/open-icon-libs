import test from 'node:test';
import assert from 'node:assert/strict';

import { getIconDetailHref, getRelatedIcons } from '../assets/scripts/lib/site-formatters.js';

globalThis.HTMLElement ??= class HTMLElement {};

const {
	buildIconDownloadLinks,
	findIconByName,
} = await import('../assets/scripts/components/open-icon-icon-detail/open-icon-icon-detail.js');

const icons = [
	{
		name: 'ui/search-m',
		category: 'ui',
		label: 'Search M',
		filePath: 'icons/ui/icon_search-m.svg',
		relativeFilePath: 'ui/icon_search-m.svg',
		url: '/media/icons/ui/icon_search-m.svg',
		apiUrl: 'https://api.open-icon.org/v1/icons/ui%2Fsearch-m',
		svgUrl: 'https://api.open-icon.org/v1/icons/ui%2Fsearch-m.svg',
		pngUrl: 'https://api.open-icon.org/v1/icons/ui%2Fsearch-m.png',
		aliases: ['ui/search-m', 'search-m', 'icon-search-m'],
	},
	{
		name: 'ui/search-s',
		category: 'ui',
		label: 'Search S',
		filePath: 'icons/ui/icon_search-s.svg',
		relativeFilePath: 'ui/icon_search-s.svg',
		url: '/media/icons/ui/icon_search-s.svg',
		apiUrl: 'https://api.open-icon.org/v1/icons/ui%2Fsearch-s',
		svgUrl: 'https://api.open-icon.org/v1/icons/ui%2Fsearch-s.svg',
		pngUrl: 'https://api.open-icon.org/v1/icons/ui%2Fsearch-s.png',
		aliases: ['ui/search-s', 'search-s'],
	},
	{
		name: 'media/camera',
		category: 'media',
		label: 'Camera',
		filePath: 'icons/media/icon_camera.svg',
		relativeFilePath: 'media/icon_camera.svg',
		url: '/media/icons/media/icon_camera.svg',
		apiUrl: 'https://api.open-icon.org/v1/icons/media%2Fcamera',
		svgUrl: 'https://api.open-icon.org/v1/icons/media%2Fcamera.svg',
		pngUrl: 'https://api.open-icon.org/v1/icons/media%2Fcamera.png',
		aliases: ['media/camera', 'camera'],
	},
];

test('findIconByName resolves the current icon entry', () => {
	assert.equal(findIconByName(icons, 'ui/search-m')?.label, 'Search M');
	assert.equal(findIconByName(icons, 'missing/icon'), null);
});

test('buildIconDownloadLinks includes API and raster variants when available', () => {
	const downloads = buildIconDownloadLinks(icons[0]);

	assert.equal(downloads[0].label, 'SVG');
	assert.match(downloads[1].href, /size=128/);
	assert.match(downloads[2].href, /size=512/);
	assert.match(downloads[3].href, /size=1024/);
});

test('getIconDetailHref creates nested icon routes', () => {
	assert.equal(getIconDetailHref('ui/search-m'), '/icons/ui/search-m/');
});

test('getRelatedIcons prefers icons from the same category', () => {
	assert.deepEqual(
		getRelatedIcons(icons, icons[0], 4).map((icon) => icon.name),
		['ui/search-s']
	);
});
