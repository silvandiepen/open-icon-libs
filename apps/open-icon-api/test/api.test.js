import test from 'node:test';
import assert from 'node:assert/strict';

import worker from '../dist/index.js';
import {
	applySvgMutations,
	createIconDetail,
	getRasterSizeOptions,
	paginate,
	resolveIconName,
	searchIcons,
} from '../dist/api.js';

test('resolveIconName resolves canonical and alias values', () => {
	assert.equal(resolveIconName('ui/search-m'), 'ui/search-m');
	assert.equal(resolveIconName('search-m'), 'ui/search-m');
	assert.equal(resolveIconName('icon_search-m'), 'ui/search-m');
});

test('searchIcons filters by query and category', () => {
	const matches = searchIcons('camera', 'media');
	assert.ok(matches.length > 0);
	assert.equal(matches[0].category, 'media');
});

test('paginate returns the correct page slice', () => {
	assert.deepEqual(paginate([1, 2, 3, 4, 5], 2, 2), [3, 4]);
});

test('applySvgMutations updates grouped paint values and title', () => {
	const input =
		'<svg><path fill="#ed2024" stroke="#231f20" /><path fill="#fff" stroke="#ed1c24" style="fill: #fff; stroke: #ed1c24;" /></svg>';
	const url = new URL(
		'https://api.open-icon.org/v1/icons/ui/search-m.svg?title=Demo&fill=%23fff&fillSecondary=%2300ff00&stroke=%23000000&strokeSecondary=%23ff00ff'
	);
	const output = applySvgMutations(input, url.searchParams);

	assert.match(output, /<title>Demo<\/title>/);
	assert.match(output, /fill="#fff"/);
	assert.match(output, /stroke="#000000"/);
	assert.match(output, /fill="#00ff00"/);
	assert.match(output, /stroke="#ff00ff"/);
});

test('applySvgMutations applies root opacity and stroke width updates', () => {
	const input =
		'<svg><path fill="#000" stroke="#111" stroke-width="2" style="stroke-width: 2;" /></svg>';
	const url = new URL(
		'https://api.open-icon.org/v1/icons/ui/search-m.svg?opacity=0.5&strokeWidth=3.5'
	);
	const output = applySvgMutations(input, url.searchParams);

	assert.match(output, /<svg[^>]* opacity="0.5"/);
	assert.match(output, /stroke-width="3.5"/);
	assert.match(output, /stroke-width: 3.5/);
});

test('createIconDetail returns API URLs for a known icon', () => {
	const detail = createIconDetail('ui/search-m', 'https://api.open-icon.org');

	assert.ok(detail);
	assert.equal(detail.name, 'ui/search-m');
	assert.match(detail.svgUrl, /\.svg$/);
	assert.match(detail.pngUrl, /\.png$/);
});

test('getRasterSizeOptions supports size shorthand and explicit dimensions', () => {
	const shorthand = new URL('https://api.open-icon.org/v1/icons/ui/search-m.png?size=1024');
	const explicit = new URL('https://api.open-icon.org/v1/icons/ui/search-m.png?width=256&height=512');

	assert.deepEqual(getRasterSizeOptions(shorthand), { width: 1024, height: 1024 });
	assert.deepEqual(getRasterSizeOptions(explicit), { width: 256, height: 512 });
});

test('worker supports POST search payloads', async () => {
	const response = await worker.fetch(
		new Request('https://api.open-icon.org/v1/icons/search', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				query: 'camera',
				category: 'media',
				page: 1,
				perPage: 5,
			}),
		}),
		{
			ASSETS: {
				fetch() {
					throw new Error('ASSETS should not be called for search endpoints');
				},
			},
		}
	);

	assert.equal(response.status, 200);
	const payload = await response.json();
	assert.equal(payload.page, 1);
	assert.ok(payload.items.length > 0);
	assert.equal(payload.items[0].category, 'media');
});

test('worker renders PNG assets in-process', async () => {
	const response = await worker.fetch(
		new Request(
			'https://api.open-icon.org/v1/icons/ui%2Fsearch-m.png?size=64&fill=%23ed2024&stroke=%23000000&opacity=0.8&strokeWidth=2'
		),
		{
			ASSETS: {
				async fetch() {
					return new Response(
						'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" fill="#ed2024" fill-opacity="0.35"/><path d="M12 7v10" fill="none" stroke="#231f20" stroke-width="1.75" stroke-linecap="round"/></svg>',
						{
							headers: {
								'content-type': 'image/svg+xml; charset=utf-8',
							},
						}
					);
				},
			},
		}
	);

	assert.equal(response.status, 200);
	assert.equal(response.headers.get('content-type'), 'image/png');

	const buffer = new Uint8Array(await response.arrayBuffer());
	assert.deepEqual(Array.from(buffer.slice(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
	assert.ok(buffer.length > 100);
});
