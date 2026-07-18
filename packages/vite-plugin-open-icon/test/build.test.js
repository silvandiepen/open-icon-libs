import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { build } from 'vite';
import { openIconSvgLoaderPlugin } from '../dist/index.js';

/**
 * End-to-end build test for the central promise of the plugin: importing a
 * single icon through `?open-icon` runs the transform at build time and does
 * NOT drag other icons into the bundle. This is what makes "don't include all
 * icons" real rather than just a claim verified by calling load() in isolation.
 */
test('a real Vite build transforms the imported icon and excludes unused ones', async () => {
	const dir = await mkdtemp(path.join(os.tmpdir(), 'vite-plugin-open-icon-build-'));

	// Two distinguishable icons; only alpha is imported.
	await writeFile(
		path.join(dir, 'icon_alpha.svg'),
		'<svg viewBox="0 0 10 10"><path style="fill:red;" d="M1 2 UNIQUE_ALPHA"/></svg>',
		'utf8'
	);
	await writeFile(
		path.join(dir, 'icon_beta.svg'),
		'<svg viewBox="0 0 10 10"><path style="fill:red;" d="M9 8 UNIQUE_BETA"/></svg>',
		'utf8'
	);
	await writeFile(
		path.join(dir, 'main.js'),
		[
			"import alpha from './icon_alpha.svg?open-icon';",
			'export const icon = alpha;',
		].join('\n'),
		'utf8'
	);

	const result = await build({
		root: dir,
		logLevel: 'silent',
		plugins: [openIconSvgLoaderPlugin()],
		build: {
			write: false,
			minify: false,
			lib: {
				entry: path.join(dir, 'main.js'),
				formats: ['es'],
				fileName: 'bundle',
			},
		},
	});

	const output = Array.isArray(result) ? result[0].output : result.output;
	const code = output.map((chunk) => chunk.code ?? '').join('\n');

	// The imported icon was transformed at build time (paint mapped to a CSS var).
	assert.match(code, /UNIQUE_ALPHA/);
	assert.match(code, /var\(--icon-fill/);
	// The raw authored paint literal is gone (transform ran, not a raw asset copy).
	assert.doesNotMatch(code, /fill:red;/);
	// The icon that was never imported is not in the bundle.
	assert.doesNotMatch(code, /UNIQUE_BETA/);
});
