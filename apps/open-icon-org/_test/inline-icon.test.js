import test from 'node:test';
import assert from 'node:assert/strict';

const {
	clearInlineIconMarkupCache,
	loadInlineIconMarkup,
	normalizeInlineIconMarkup,
} = await import('../assets/scripts/lib/inline-icon.js');

test('normalizeInlineIconMarkup removes xml declarations and trims whitespace', () => {
	assert.equal(
		normalizeInlineIconMarkup(`\n<?xml version="1.0"?>\n<svg><path /></svg>\n`),
		'<svg><path /></svg>'
	);
});

test('loadInlineIconMarkup caches normalized inline svg fetches by url', async () => {
	let fetchCalls = 0;
	globalThis.fetch = async () => {
		fetchCalls += 1;
		return {
			ok: true,
			text: async () => `<?xml version="1.0"?><svg><path /></svg>`,
		};
	};

	clearInlineIconMarkupCache();

	const firstMarkup = await loadInlineIconMarkup('/media/icons/ui/search-m.svg');
	const secondMarkup = await loadInlineIconMarkup('/media/icons/ui/search-m.svg');

	assert.equal(firstMarkup, '<svg><path /></svg>');
	assert.equal(secondMarkup, '<svg><path /></svg>');
	assert.equal(fetchCalls, 1);
});
