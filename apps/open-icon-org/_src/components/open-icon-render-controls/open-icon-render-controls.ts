import {
	DEFAULT_ICON_RENDER_SETTINGS,
	readStoredIconRenderSettings,
	writeStoredIconRenderSettings,
} from '../../lib/icon-render-settings.js';
import type { IconRenderSettings } from '../../lib/icon-render-settings.model.js';
import type { OpenIconRenderControlsState } from './open-icon-render-controls.model.js';

const RENDER_CONTROL_PANEL_STORAGE_KEY = 'open-icon-render-controls-collapsed';

const readCollapsedState = (): boolean => {
	if (typeof window === 'undefined') {
		return false;
	}

	return window.localStorage.getItem(RENDER_CONTROL_PANEL_STORAGE_KEY) === 'true';
};

const writeCollapsedState = (collapsed: boolean): void => {
	if (typeof window === 'undefined') {
		return;
	}

	window.localStorage.setItem(RENDER_CONTROL_PANEL_STORAGE_KEY, collapsed ? 'true' : 'false');
};

const COLOR_FALLBACKS = {
	fill: '#ed2024',
	fillSecondary: '#ffffff',
	stroke: '#231f20',
	strokeSecondary: '#ed1c24',
} as const;

type RenderControlColorFieldName = keyof Pick<
	IconRenderSettings,
	'fill' | 'fillSecondary' | 'stroke' | 'strokeSecondary'
>;

interface RenderControlColorFieldDefinition {
	fieldName: RenderControlColorFieldName;
	label: string;
}

const COLOR_FIELD_DEFINITIONS: RenderControlColorFieldDefinition[] = [
	{
		fieldName: 'fill',
		label: 'Primary fill',
	},
	{
		fieldName: 'fillSecondary',
		label: 'Secondary fill',
	},
	{
		fieldName: 'stroke',
		label: 'Primary line',
	},
	{
		fieldName: 'strokeSecondary',
		label: 'Accent line',
	},
];

const escapeAttribute = (value: string): string =>
	value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

const getRenderControlValueLabel = (value: string): string => value || 'Original';
const getLineCapValueLabel = (value: string): string =>
	value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : 'Original';

export const getRenderControlsAccentColor = (settings: IconRenderSettings): string =>
	settings.fill || COLOR_FALLBACKS.fill;

const renderColorField = (
	settings: IconRenderSettings,
	fieldName: RenderControlColorFieldName,
	label: string
): string => {
	const currentValue = settings[fieldName];
	const inputValue = currentValue || COLOR_FALLBACKS[fieldName];

	return `
		<label class="oi-render-controls__field oi-render-controls__field--compact">
			<span>${label}</span>
			<input
				aria-label="${escapeAttribute(label)}"
				name="${fieldName}"
				type="color"
				value="${escapeAttribute(inputValue)}"
			/>
			<output data-render-value="${fieldName}">
				${getRenderControlValueLabel(currentValue)}
			</output>
		</label>
	`;
};

const renderRangeField = (
	id: string,
	name: keyof Pick<IconRenderSettings, 'opacity' | 'strokeOpacity'>,
	label: string,
	value: string,
	defaultValue: string
): string => `
	<label class="oi-render-controls__field oi-render-controls__field--compact">
		<span>${label}</span>
		<input
			id="${id}"
			name="${name}"
			type="range"
			min="0"
			max="1"
			step="0.05"
			value="${escapeAttribute(value || defaultValue)}"
		/>
		<output data-render-value="${name}">
			${getRenderControlValueLabel(value)}
		</output>
	</label>
`;

const renderStrokeWidthField = (
	id: string,
	name: 'strokeWidth' | 'strokeWidthSecondary',
	label: string,
	value: string
): string => `
	<label class="oi-render-controls__field oi-render-controls__field--compact">
		<span>${label}</span>
		<input
			id="${id}"
			name="${name}"
			type="range"
			min="0"
			max="8"
			step="0.25"
			value="${escapeAttribute(value || '1.75')}"
		/>
		<output data-render-value="${name}">
			${getRenderControlValueLabel(value)}
		</output>
	</label>
`;

const renderLineCapField = (value: string): string => `
	<label class="oi-render-controls__field oi-render-controls__field--compact" for="oi-render-controls-stroke-linecap">
		<span>Line cap</span>
		<select id="oi-render-controls-stroke-linecap" name="strokeLinecap">
			<option value="" ${value ? '' : 'selected'}>Original</option>
			<option value="round" ${value === 'round' ? 'selected' : ''}>Round</option>
			<option value="square" ${value === 'square' ? 'selected' : ''}>Square</option>
		</select>
		<output data-render-value="strokeLinecap">
			${getLineCapValueLabel(value)}
		</output>
	</label>
`;

export const renderCollapsedRenderControls = (settings: IconRenderSettings): string => `
	<div
		class="oi-render-controls oi-render-controls--collapsed"
		style="--oi-render-controls-accent: ${escapeAttribute(getRenderControlsAccentColor(settings))};"
	>
		<button type="button" data-toggle-render-controls aria-expanded="false">
			Icon style
		</button>
	</div>
`;

export const renderExpandedRenderControls = (state: OpenIconRenderControlsState): string => `
	<form
		class="oi-render-controls"
		aria-label="Icon render controls"
		style="--oi-render-controls-accent: ${escapeAttribute(getRenderControlsAccentColor(state.settings))};"
	>
		<div class="oi-render-controls__header">
			<div class="oi-render-controls__heading">Icon style</div>
			<button type="button" data-toggle-render-controls aria-expanded="true">
				Close
			</button>
		</div>
		<details open>
			<summary>Fill</summary>
			<div class="oi-render-controls__section-content">
				${COLOR_FIELD_DEFINITIONS.slice(0, 2)
					.map((fieldDefinition) =>
						renderColorField(state.settings, fieldDefinition.fieldName, fieldDefinition.label)
					)
					.join('')}
				${renderRangeField('oi-render-controls-opacity', 'opacity', 'Fill opacity', state.settings.opacity, '1')}
			</div>
		</details>
		<details open>
			<summary>Lines</summary>
			<div class="oi-render-controls__section-content">
				${COLOR_FIELD_DEFINITIONS.slice(2)
					.map((fieldDefinition) =>
						renderColorField(state.settings, fieldDefinition.fieldName, fieldDefinition.label)
					)
					.join('')}
				${renderRangeField('oi-render-controls-stroke-opacity', 'strokeOpacity', 'Line opacity', state.settings.strokeOpacity, '1')}
				${renderStrokeWidthField('oi-render-controls-stroke-width', 'strokeWidth', 'Primary thickness', state.settings.strokeWidth)}
				${renderStrokeWidthField(
					'oi-render-controls-stroke-width-secondary',
					'strokeWidthSecondary',
					'Accent thickness',
					state.settings.strokeWidthSecondary
				)}
				${renderLineCapField(state.settings.strokeLinecap)}
			</div>
		</details>
		<div class="oi-render-controls__footer">
			<button type="button" data-reset-render-settings>Reset</button>
		</div>
	</form>
`;

export class OpenIconRenderControlsElement extends HTMLElement {
	private state: OpenIconRenderControlsState = {
		collapsed: false,
		settings: DEFAULT_ICON_RENDER_SETTINGS,
	};

	connectedCallback(): void {
		if (this.dataset.connected === 'true') {
			return;
		}

		this.dataset.connected = 'true';
		this.state.collapsed = readCollapsedState();
		this.state.settings = readStoredIconRenderSettings();
		this.render();
	}

	private render(): void {
		if (this.state.collapsed) {
			this.innerHTML = renderCollapsedRenderControls(this.state.settings);
			this.bindEvents();
			return;
		}

		this.innerHTML = renderExpandedRenderControls(this.state);

		this.bindEvents();
	}

	private bindEvents(): void {
		this.querySelector('[data-toggle-render-controls]')?.addEventListener('click', () => {
			this.state.collapsed = !this.state.collapsed;
			writeCollapsedState(this.state.collapsed);
			this.render();
		});

		this.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input[name], select[name]').forEach((input) => {
			const eventName = input instanceof HTMLSelectElement ? 'change' : 'input';
			input.addEventListener(eventName, () => {
				const fieldName = input.name as keyof OpenIconRenderControlsState['settings'];
				this.state.settings = {
					...this.state.settings,
					[fieldName]: input.value,
				};
				writeStoredIconRenderSettings(this.state.settings);
				this.syncRenderedState();
			});
		});

		this.querySelector('[data-reset-render-settings]')?.addEventListener('click', () => {
			this.state.settings = DEFAULT_ICON_RENDER_SETTINGS;
			writeStoredIconRenderSettings(this.state.settings);
			this.render();
		});
	}

	private syncRenderedState(): void {
		const panel = this.querySelector<HTMLElement>('.oi-render-controls');
		panel?.style.setProperty('--oi-render-controls-accent', getRenderControlsAccentColor(this.state.settings));

		this.querySelectorAll<HTMLOutputElement>('[data-render-value]').forEach((output) => {
			const fieldName = output.dataset.renderValue as keyof IconRenderSettings | undefined;
			if (!fieldName) {
				return;
			}

			const value = this.state.settings[fieldName];
			const label =
				fieldName === 'strokeLinecap'
					? getLineCapValueLabel(value)
					: getRenderControlValueLabel(value);
			output.value = label;
			output.textContent = label;
		});
	}
}
