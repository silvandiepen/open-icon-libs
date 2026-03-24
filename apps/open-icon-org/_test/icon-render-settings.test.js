import test from 'node:test';
import assert from 'node:assert/strict';

class MemoryStorage {
	#values = new Map();

	getItem(key) {
		return this.#values.get(key) ?? null;
	}

	setItem(key, value) {
		this.#values.set(key, String(value));
	}
}

const windowTarget = new EventTarget();
windowTarget.localStorage = new MemoryStorage();
globalThis.window = windowTarget;

const {
	DEFAULT_ICON_RENDER_SETTINGS,
	OPEN_ICON_RENDER_SETTINGS_EVENT,
	buildIconRenderSearchParams,
	normalizeIconRenderSettings,
	readStoredIconRenderSettings,
	writeStoredIconRenderSettings,
} = await import('../assets/scripts/lib/icon-render-settings.js');

test('normalizeIconRenderSettings keeps only supported render values', () => {
	assert.deepEqual(
		normalizeIconRenderSettings({
			fill: '#ed2024',
			stroke: 'rgb(35, 31, 32)',
			opacity: '0.35',
			strokeWidth: '1.75',
		}),
		{
			fill: '#ed2024',
			stroke: 'rgb(35, 31, 32)',
			opacity: '0.35',
			strokeWidth: '1.75',
		}
	);

	assert.deepEqual(
		normalizeIconRenderSettings({
			fill: 'javascript:alert(1)',
			stroke: '',
			opacity: '1.7',
			strokeWidth: '-2',
		}),
		DEFAULT_ICON_RENDER_SETTINGS
	);
});

test('writeStoredIconRenderSettings persists normalized settings and emits an event', async () => {
	const eventPromise = new Promise((resolve) => {
		window.addEventListener(
			OPEN_ICON_RENDER_SETTINGS_EVENT,
			(event) => resolve(event.detail),
			{ once: true }
		);
	});

	writeStoredIconRenderSettings({
		fill: '#ed2024',
		stroke: '#231f20',
		opacity: '0.5',
		strokeWidth: '2.5',
	});

	assert.deepEqual(readStoredIconRenderSettings(), {
		fill: '#ed2024',
		stroke: '#231f20',
		opacity: '0.5',
		strokeWidth: '2.5',
	});

	assert.deepEqual(await eventPromise, {
		fill: '#ed2024',
		stroke: '#231f20',
		opacity: '0.5',
		strokeWidth: '2.5',
	});
});

test('buildIconRenderSearchParams only includes non-empty settings', () => {
	const params = buildIconRenderSearchParams({
		fill: '#ed2024',
		stroke: '',
		opacity: '0.35',
		strokeWidth: '1.75',
	});

	assert.equal(params.get('fill'), '#ed2024');
	assert.equal(params.get('stroke'), null);
	assert.equal(params.get('opacity'), '0.35');
	assert.equal(params.get('strokeWidth'), '1.75');
});
