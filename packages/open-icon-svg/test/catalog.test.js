import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');

test('package exports only svg asset entrypoints', async () => {
	const packageJson = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));

	assert.deepEqual(packageJson.exports, {
		'./icons/*': './icons/*',
		'./package.json': './package.json',
	});
});

test('known svg assets are present in the package', async () => {
	const svg = await readFile(
		path.join(packageRoot, 'icons', 'wayfinding', 'icon_check in.svg'),
		'utf8'
	);

	assert.match(svg, /<svg\b/i);
	assert.match(svg, /viewBox=/);
	assert.match(svg, /var\(--icon-fill/);
	assert.match(svg, /var\(--icon-stroke-color/);
});
