import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, writeFile } from 'node:fs/promises';
import {
	openIconSvgLoaderDefaults,
	openIconSvgLoaderPlugin,
	transformOpenIconSvg,
} from '../dist/index.js';

const createTempSvg = async (content, fileName = 'icon_demo.svg') => {
	const dir = await mkdtemp(path.join(os.tmpdir(), 'vite-plugin-open-icon-'));
	const svgPath = path.join(dir, fileName);
	await writeFile(svgPath, content, 'utf8');
	return { dir, svgPath };
};

test('plugin transforms svg with default query', async () => {
	const { svgPath } = await createTempSvg(
		'<svg id="Layer_1"><path style="fill:red; stroke-width:4;"/></svg>'
	);

	const plugin = openIconSvgLoaderPlugin();
	const result = await plugin.load?.call({}, `${svgPath}?open-icon`);

	assert.equal(typeof result, 'string');
	assert.equal(result.includes('export default'), true);
	assert.equal(result.includes('var(--icon-fill'), true);
	assert.equal(result.includes('icon-stroke-width-m'), true);
});

test('plugin ignores imports without configured query', async () => {
	const plugin = openIconSvgLoaderPlugin();
	const result = await plugin.load?.call({}, '/tmp/icon_demo.svg');
	assert.equal(result, null);
});

test('plugin ignores non-svg modules even when query is present', async () => {
	const plugin = openIconSvgLoaderPlugin();
	const result = await plugin.load?.call({}, '/tmp/module.ts?open-icon');
	assert.equal(result, null);
});

test('plugin supports custom query name', async () => {
	const { svgPath } = await createTempSvg('<svg><path style="fill:red;"/></svg>');
	const plugin = openIconSvgLoaderPlugin({ query: 'iconify' });

	const miss = await plugin.load?.call({}, `${svgPath}?open-icon`);
	const hit = await plugin.load?.call({}, `${svgPath}?iconify`);

	assert.equal(miss, null);
	assert.equal(typeof hit, 'string');
	assert.equal(hit.includes('export default'), true);
});

test('plugin handles encoded file paths (spaces)', async () => {
	const { svgPath } = await createTempSvg('<svg><path style="fill:red;"/></svg>', 'icon with space.svg');
	const plugin = openIconSvgLoaderPlugin();

	const result = await plugin.load?.call({}, `${encodeURI(svgPath)}?open-icon`);
	assert.equal(typeof result, 'string');
	assert.equal(result.includes('export default'), true);
});

test('plugin applies custom transform settings end-to-end', async () => {
	const { svgPath } = await createTempSvg('<svg><path style="fill:red;"/></svg>');
	const plugin = openIconSvgLoaderPlugin({
		replaceData: [['fill:red;', 'fill: {{brand.primary}};']],
		removeData: [],
		simplifyColors: false,
		configData: {
			brand: { primary: '#123456' },
		},
	});

	const result = await plugin.load?.call({}, `${svgPath}?open-icon`);
	assert.equal(result.includes('#123456'), true);
});

test('plugin output matches direct transform function behavior', async () => {
	const svg = '<svg id="Layer_1"><path style="fill:red;"/></svg>';
	const { svgPath } = await createTempSvg(svg);
	const plugin = openIconSvgLoaderPlugin();

	const pluginResult = await plugin.load?.call({}, `${svgPath}?open-icon`);
	const transformed = transformOpenIconSvg(svg, svgPath);
	const expectedModule = `export default ${JSON.stringify(transformed)};`;

	assert.equal(pluginResult, expectedModule);
});

test('re-exported defaults are available from plugin package', () => {
	assert.equal(openIconSvgLoaderDefaults.query, 'open-icon');
});
