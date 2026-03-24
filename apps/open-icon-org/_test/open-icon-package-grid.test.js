import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.HTMLElement ??= class HTMLElement {};

const { sortPackagesByName } = await import('../assets/scripts/components/open-icon-package-grid/open-icon-package-grid.js');
const { buildStatItems } = await import('../assets/scripts/components/open-icon-site-stats/open-icon-site-stats.js');

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
		iconTotal: 1131,
		categoryTotal: 12,
		packageTotal: 3,
	});

	assert.equal(stats[0].value, '1,131');
	assert.equal(stats[1].label, 'Categories');
	assert.equal(stats[2].value, '3');
});
