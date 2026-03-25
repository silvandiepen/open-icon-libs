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
	applyIconRenderSettingsToDocument,
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
			fillSecondary: '#ffffff',
			stroke: 'rgb(35, 31, 32)',
			strokeSecondary: '#ed1c24',
			opacity: '0.35',
			strokeOpacity: '0.6',
			strokeWidth: '1.75',
			strokeWidthSecondary: '2.25',
			strokeLinecap: 'square',
		}),
		{
			fill: '#ed2024',
			fillSecondary: '#ffffff',
			stroke: 'rgb(35, 31, 32)',
			strokeSecondary: '#ed1c24',
			opacity: '0.35',
			strokeOpacity: '0.6',
			strokeWidth: '1.75',
			strokeWidthSecondary: '2.25',
			strokeLinecap: 'square',
		}
	);

	assert.deepEqual(
		normalizeIconRenderSettings({
			fill: 'javascript:alert(1)',
			fillSecondary: 'url(javascript:evil)',
			stroke: '',
			strokeSecondary: 'initial;',
			opacity: '1.7',
			strokeOpacity: '-1',
			strokeWidth: '-2',
			strokeWidthSecondary: '-1',
			strokeLinecap: 'butt',
		}),
		{
			...DEFAULT_ICON_RENDER_SETTINGS,
			fill: '',
		}
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
		fillSecondary: '#ffffff',
		stroke: '#231f20',
		strokeSecondary: '#ed1c24',
		opacity: '0.5',
		strokeOpacity: '0.35',
		strokeWidth: '2.5',
		strokeWidthSecondary: '1.5',
		strokeLinecap: 'round',
	});

	assert.deepEqual(readStoredIconRenderSettings(), {
		fill: '#ed2024',
		fillSecondary: '#ffffff',
		stroke: '#231f20',
		strokeSecondary: '#ed1c24',
		opacity: '0.5',
		strokeOpacity: '0.35',
		strokeWidth: '2.5',
		strokeWidthSecondary: '1.5',
		strokeLinecap: 'round',
	});

	assert.deepEqual(await eventPromise, {
		fill: '#ed2024',
		fillSecondary: '#ffffff',
		stroke: '#231f20',
		strokeSecondary: '#ed1c24',
		opacity: '0.5',
		strokeOpacity: '0.35',
		strokeWidth: '2.5',
		strokeWidthSecondary: '1.5',
		strokeLinecap: 'round',
	});
});

test('buildIconRenderSearchParams only includes non-empty settings', () => {
	const params = buildIconRenderSearchParams({
		fill: '#ed2024',
		fillSecondary: '#ffffff',
		stroke: '',
		strokeSecondary: '#ed1c24',
		opacity: '0.35',
		strokeOpacity: '0.4',
		strokeWidth: '1.75',
		strokeWidthSecondary: '2.25',
		strokeLinecap: 'square',
	});

	assert.equal(params.get('fill'), '#ed2024');
	assert.equal(params.get('fillSecondary'), '#ffffff');
	assert.equal(params.get('stroke'), null);
	assert.equal(params.get('strokeSecondary'), '#ed1c24');
	assert.equal(params.get('opacity'), '0.35');
	assert.equal(params.get('strokeOpacity'), null);
	assert.equal(params.get('strokeWidth'), '1.75');
	assert.equal(params.get('strokeWidthSecondary'), null);
	assert.equal(params.get('strokeLinecap'), null);
});

test('applyIconRenderSettingsToDocument mirrors settings to body css variables', () => {
	globalThis.document = {
		body: {
			dataset: {},
			style: {
				values: new Map(),
				setProperty(name, value) {
					this.values.set(name, value);
				},
				removeProperty(name) {
					this.values.delete(name);
				},
				getPropertyValue(name) {
					return this.values.get(name) ?? '';
				},
			},
		},
	};

	applyIconRenderSettingsToDocument({
		fill: '#ed2024',
		fillSecondary: '',
		stroke: '#231f20',
		strokeSecondary: '#ed1c24',
		opacity: '0.8',
		strokeOpacity: '0.65',
		strokeWidth: '2',
		strokeWidthSecondary: '1.25',
		strokeLinecap: 'square',
	});

	assert.equal(document.body.style.getPropertyValue('--icon-fill'), '#ed2024');
	assert.equal(document.body.style.getPropertyValue('--icon-stroke-color'), '#231f20');
	assert.equal(document.body.style.getPropertyValue('--icon-line-color'), '#231f20');
	assert.equal(document.body.style.getPropertyValue('--icon-stroke-color-secondary'), '#ed1c24');
	assert.equal(document.body.style.getPropertyValue('--icon-fill-opacity'), '0.8');
	assert.equal(document.body.style.getPropertyValue('--icon-stroke-opacity'), '0.65');
	assert.equal(document.body.style.getPropertyValue('--icon-stroke-width-secondary'), '1.25');
	assert.equal(document.body.style.getPropertyValue('--icon-stroke-linecap'), 'square');
	assert.equal(document.body.dataset.openIconRenderActive, 'true');
});
