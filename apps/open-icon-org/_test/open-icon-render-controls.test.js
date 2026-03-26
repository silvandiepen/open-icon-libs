import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.HTMLElement ??= class HTMLElement {};

const {
	getInitialCollapsedState,
	getRenderControlsAccentColor,
	renderCollapsedRenderControls,
	renderExpandedRenderControls,
} = await import('../assets/scripts/components/open-icon-render-controls/open-icon-render-controls.js');

const createState = (settings = {}) => ({
	collapsed: false,
	settings: {
		fill: '',
		fillSecondary: '',
		stroke: '',
		strokeSecondary: '',
		opacity: '',
		strokeOpacity: '',
		strokeWidth: '',
		strokeWidthSecondary: '',
		strokeLinecap: '',
		...settings,
	},
});

test('getRenderControlsAccentColor prefers the primary fill and falls back to the default brand color', () => {
	assert.equal(
		getRenderControlsAccentColor(
			createState({
				fill: '#0f766e',
			}).settings
		),
		'#0f766e'
	);
	assert.equal(getRenderControlsAccentColor(createState().settings), '#ed2024');
});

test('getInitialCollapsedState defaults to collapsed on mobile and respects stored preferences', () => {
	assert.equal(getInitialCollapsedState({ storedValue: null, isMobile: true }), true);
	assert.equal(getInitialCollapsedState({ storedValue: null, isMobile: false }), false);
	assert.equal(getInitialCollapsedState({ storedValue: 'true', isMobile: false }), true);
	assert.equal(getInitialCollapsedState({ storedValue: 'false', isMobile: true }), false);
});

test('renderExpandedRenderControls uses the primary fill as accent and renders concise control copy', () => {
	const markup = renderExpandedRenderControls(
		createState({
			fill: '#0f766e',
			stroke: '#231f20',
			opacity: '0.75',
		})
	);

	assert.match(markup, /--oi-render-controls-accent: #0f766e;/);
	assert.match(markup, />\s*Close\s*</);
	assert.match(markup, />\s*Fill\s*</);
	assert.match(markup, />\s*Lines\s*</);
	assert.match(markup, /Primary fill/);
	assert.match(markup, /Accent line/);
	assert.match(markup, /Fill opacity/);
	assert.match(markup, /Line opacity/);
	assert.match(markup, /Primary thickness/);
	assert.match(markup, /Accent thickness/);
	assert.match(markup, /Line cap/);
	assert.match(markup, /data-render-value="fill"/);
	assert.match(markup, /data-render-value="opacity"/);
	assert.match(markup, />\s*Original\s*</);
});

test('renderCollapsedRenderControls keeps the shared accent styling when minimized', () => {
	const markup = renderCollapsedRenderControls(
		createState({
			fill: '#2563eb',
		}).settings
	);

	assert.match(markup, /oi-render-controls--collapsed/);
	assert.match(markup, /--oi-render-controls-accent: #2563eb;/);
	assert.match(markup, /aria-expanded="false"/);
});
