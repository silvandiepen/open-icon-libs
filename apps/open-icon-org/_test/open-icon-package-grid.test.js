import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.HTMLElement ??= class HTMLElement {};

const { sortPackagesByName } = await import('../assets/scripts/components/open-icon-package-grid/open-icon-package-grid.js');
const {
	buildStatItems,
	getPrimaryPackageVersion,
} = await import('../assets/scripts/components/open-icon-site-stats/open-icon-site-stats.js');

test('sortPackagesByName orders entries alphabetically', () => {
	const sorted = sortPackagesByName([
		{ name: 'vite-plugin-open-icon' },
		{ name: 'open-icon-svg' },
		{ name: 'open-icon-transform' },
	]);

	assert.deepEqual(sorted.map((entry) => entry.name), [
		'open-icon-svg',
		'open-icon-transform',
		'vite-plugin-open-icon',
	]);
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
