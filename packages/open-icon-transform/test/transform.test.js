import test from 'node:test';
import assert from 'node:assert/strict';
import {
	openIconSvgLoaderDefaults,
	transformOpenIconSvg,
} from '../dist/index.js';

test('removes xml declaration and comments', () => {
	const input = `
<?xml version="1.0"?>
<svg><!-- test-comment --><path style="fill:red;"/></svg>`;
	const output = transformOpenIconSvg(input, '/tmp/icon_simple.svg');

	assert.equal(output.includes('<?xml'), false);
	assert.equal(output.includes('<!-- test-comment -->'), false);
});

test('maps Layer id/data-name to componentName using replaceName + filename normalization', () => {
	const input = `<svg id="Layer_1" data-name="Layer_1"><path style="fill:red;"/></svg>`;
	const output = transformOpenIconSvg(input, '/tmp/icon_loader-dots 2.svg');

	assert.equal(output.includes('id="LoaderDots2"'), true);
	assert.equal(output.includes('data-name="LoaderDots2"'), true);
});

test('default replaceData maps fill and stroke variants', () => {
	const input = `<svg><path style="fill:white;stroke:black;"/><path style="fill:none;stroke:red;stroke-width:4;"/></svg>`;
	const output = transformOpenIconSvg(input, '/tmp/icon_combo.svg');

	assert.equal(output.includes('var(--icon-fill-secondary, white)'), true);
	assert.equal(output.includes('var(--icon-stroke-color, currentColor)'), true);
	assert.equal(output.includes('var(--icon-stroke-color-secondary'), true);
	assert.equal(
		output.includes(
			'var(--icon-stroke-width-secondary-m, var(--icon-stroke-width-m, calc(var(--icon-stroke-width, 5) * 1)))'
		),
		true
	);
});

test('removeData supports regex and literal cleanup in same run', () => {
	const input = `<svg><path data-junk="foo123" style="fill:red;"/>junk-literal</svg>`;
	const output = transformOpenIconSvg(input, '/tmp/icon_cleanup.svg', {
		removeData: ['/foo\\d+/', 'junk-literal'],
		replaceData: [],
		simplifyColors: false,
	});

	assert.equal(output.includes('foo123'), false);
	assert.equal(output.includes('junk-literal'), false);
});

test('removeTags and removeAttributes can be combined', () => {
	const input = `<svg><metadata>x</metadata><path id="node-1" data-name="n" style="fill:red;"/></svg>`;
	const output = transformOpenIconSvg(input, '/tmp/icon_attrs.svg', {
		removeData: [],
		replaceData: [],
		removeTags: ['metadata'],
		removeAttributes: ['id', 'data-name'],
		simplifyColors: false,
	});

	assert.equal(output.includes('<metadata>'), false);
	assert.equal(output.includes('id="node-1"'), false);
	assert.equal(output.includes('data-name="n"'), false);
});

test('simplifyColors can be disabled', () => {
	const input = `<svg><path style="fill:#ff0000;"/></svg>`;
	const output = transformOpenIconSvg(input, '/tmp/icon_color.svg', {
		replaceData: [],
		removeData: [],
		simplifyColors: false,
	});

	assert.equal(output.includes('#ff0000'), true);
});

test('simplifyColors enabled integrates with replaceData defaults', () => {
	const input = `<svg><path style="fill:#ff0000;"/></svg>`;
	const output = transformOpenIconSvg(input, '/tmp/icon_color-defaults.svg');

	assert.equal(output.includes('var(--icon-fill, rgba(0, 0, 0, 0))'), true);
});

test('fill: red with space is replaced with fill variable', () => {
	const input = `<svg><path style="fill: red;"/></svg>`;
	const output = transformOpenIconSvg(input, '/tmp/icon_red-space.svg', {
		removeData: [],
		simplifyColors: false,
	});

	assert.equal(output.includes('var(--icon-fill, rgba(0, 0, 0, 0))'), true);
});

test('fill: red in css style block is replaced with fill variable', () => {
	const input = `<svg><defs><style>.cls { fill: red; opacity: .5; }</style></defs><path class="cls" d="M0 0"/></svg>`;
	const output = transformOpenIconSvg(input, '/tmp/icon_css-class.svg', {
		removeData: [],
		simplifyColors: false,
	});

	assert.equal(output.includes('var(--icon-fill, rgba(0, 0, 0, 0))'), true);
	assert.equal(output.includes('fill: red;'), false);
});

test('ungroupElements flattens opacity from group to children', () => {
	const input = `<svg><g style="opacity: .5;"><path style="fill:red;"/></g></svg>`;
	const output = transformOpenIconSvg(input, '/tmp/icon_group.svg', {
		replaceData: [],
		removeData: [],
		simplifyColors: false,
	});

	assert.equal(output.includes('<g style='), false);
	assert.equal(output.includes('opacity: .5;'), true);
});

test('custom configData variables are interpolated in replaceData values', () => {
	const input = `<svg><path style="fill:red;"/></svg>`;
	const output = transformOpenIconSvg(input, '/tmp/icon_brand.svg', {
		replaceData: [['fill:red;', 'fill: {{brand.primary}};']],
		removeData: [],
		simplifyColors: false,
		configData: {
			brand: {
				primary: '#123456',
			},
		},
	});

	assert.equal(output.includes('fill: #123456;'), true);
});

test('stroke linecap and linejoin map to dedicated runtime variables', () => {
	const input = `<svg><path style="stroke:black;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;"/></svg>`;
	const output = transformOpenIconSvg(input, '/tmp/icon_line-style.svg');

	assert.equal(output.includes('stroke-linecap: var(--icon-stroke-linecap, round);'), true);
	assert.equal(output.includes('stroke-linejoin: var(--icon-stroke-linejoin, round);'), true);
});

test('full pipeline combination remains stable', () => {
	const input = `
<?xml version="1.0"?>
<svg id="Layer_1" data-name="Layer_1"><!--c-->
	<g style="opacity: .5;"><path style="fill:#ff0000;stroke:red;stroke-width:4;"/></g>
</svg>`;

	const output = transformOpenIconSvg(input, '/tmp/icon_multi-step 12.svg');

	assert.equal(output.includes('<?xml'), false);
	assert.equal(output.includes('<!--c-->'), false);
	assert.equal(output.includes('id="MultiStep12"'), true);
	assert.equal(output.includes('var(--icon-fill'), true);
	assert.equal(output.includes('var(--icon-stroke-color-secondary'), true);
	assert.equal(output.includes('icon-stroke-width-secondary-m'), true);
	assert.equal(output.includes('opacity: .5;'), true);
});

test('default settings object exposes expected query and defaults', () => {
	assert.equal(openIconSvgLoaderDefaults.query, 'open-icon');
	assert.equal(openIconSvgLoaderDefaults.default.iconStrokeWidth, '5');
	assert.equal(Array.isArray(openIconSvgLoaderDefaults.replaceData), true);
});
