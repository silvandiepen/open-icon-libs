import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.HTMLElement ??= class HTMLElement {};

const {
	groupPackages,
	sortPackagesByOrder,
} = await import('../assets/scripts/components/open-icon-package-grid/open-icon-package-grid.js');
const {
	buildStatItems,
	getPrimaryPackageVersion,
} = await import('../assets/scripts/components/open-icon-site-stats/open-icon-site-stats.js');

test('sortPackagesByOrder respects package order metadata', () => {
	const sorted = sortPackagesByOrder([
		{ name: 'vite-plugin-open-icon', order: 8 },
		{ name: 'open-icon-svg', order: 6 },
		{ name: 'open-icon-transform', order: 7 },
	]);

	assert.deepEqual(sorted.map((entry) => entry.name), [
		'open-icon-svg',
		'open-icon-transform',
		'vite-plugin-open-icon',
	]);
});

test('groupPackages separates core and framework entries', () => {
	const grouped = groupPackages([
		{ name: 'react-open-icon', order: 3, group: 'framework' },
		{ name: 'open-icon', order: 1, group: 'core' },
		{ name: 'open-icon-svg', order: 6, group: 'core' },
		{ name: 'vue-open-icon', order: 2, group: 'framework' },
	]);

	assert.deepEqual(grouped.core.map((entry) => entry.name), ['open-icon', 'open-icon-svg']);
	assert.deepEqual(grouped.framework.map((entry) => entry.name), ['vue-open-icon', 'react-open-icon']);
});

test('buildStatItems formats the site stats payload', () => {
	const stats = buildStatItems({
		currentVersion: '0.1.2',
		iconTotal: 1131,
		categoryTotal: 12,
		packageTotal: 3,
	});

	assert.equal(stats[0].label, 'Current version');
	assert.equal(stats[0].value, 'v0.1.2');
	assert.equal(stats[1].value, '1,131');
	assert.equal(stats[2].label, 'Categories');
	assert.equal(stats[3].value, '3');
});

test('getPrimaryPackageVersion prefers open-icon', () => {
	const version = getPrimaryPackageVersion([
		{ name: 'open-icon-svg', version: '0.1.1' },
		{ name: 'open-icon', version: '0.1.2' },
		{ name: 'vite-plugin-open-icon', version: '0.1.0' },
	]);

	assert.equal(version, '0.1.2');
});
