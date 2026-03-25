import type { IconRenderSettings } from './icon-render-settings.model.js';

export const ICON_RENDER_SETTINGS_STORAGE_KEY = 'open-icon-render-settings';
export const OPEN_ICON_RENDER_SETTINGS_EVENT = 'open-icon-render-settings-change';

export const DEFAULT_ICON_RENDER_SETTINGS: IconRenderSettings = {
	fill: '#ed2024',
	fillSecondary: '',
	stroke: '',
	strokeSecondary: '',
	opacity: '',
	strokeOpacity: '',
	strokeWidth: '',
	strokeWidthSecondary: '',
	strokeLinecap: '',
};

const DOCUMENT_STYLE_MAPPINGS: Record<keyof IconRenderSettings, string[]> = {
	fill: ['--icon-fill'],
	fillSecondary: ['--icon-fill-secondary'],
	stroke: ['--icon-stroke-color', '--icon-line-color'],
	strokeSecondary: ['--icon-stroke-color-secondary'],
	opacity: ['--icon-fill-opacity'],
	strokeOpacity: ['--icon-stroke-opacity'],
	strokeWidth: ['--icon-stroke-width'],
	strokeWidthSecondary: ['--icon-stroke-width-secondary'],
	strokeLinecap: ['--icon-stroke-linecap'],
};

const normalizeColorValue = (value: string | null | undefined): string => {
	if (!value) {
		return '';
	}

	const normalized = value.trim();
	return /^[#a-z0-9(),.%\s-]+$/i.test(normalized) ? normalized : '';
};

const normalizeStrokeWidth = (value: string | null | undefined): string => {
	if (!value) {
		return '';
	}

	const normalized = value.trim();
	return /^\d+(\.\d+)?$/.test(normalized) ? normalized : '';
};

const normalizeOpacity = (value: string | null | undefined): string => {
	if (!value) {
		return '';
	}

	const normalized = value.trim();
	if (!/^\d+(\.\d+)?$/.test(normalized)) {
		return '';
	}

	const numericValue = Number.parseFloat(normalized);
	if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue > 1) {
		return '';
	}

	return normalized;
};

const normalizeStrokeLinecap = (value: string | null | undefined): string => {
	if (!value) {
		return '';
	}

	const normalized = value.trim().toLowerCase();
	return normalized === 'round' || normalized === 'square' ? normalized : '';
};

export const normalizeIconRenderSettings = (
	value: Partial<IconRenderSettings> | null | undefined
): IconRenderSettings => ({
	fill: normalizeColorValue(value?.fill),
	fillSecondary: normalizeColorValue(value?.fillSecondary),
	stroke: normalizeColorValue(value?.stroke),
	strokeSecondary: normalizeColorValue(value?.strokeSecondary),
	opacity: normalizeOpacity(value?.opacity),
	strokeOpacity: normalizeOpacity(value?.strokeOpacity),
	strokeWidth: normalizeStrokeWidth(value?.strokeWidth),
	strokeWidthSecondary: normalizeStrokeWidth(value?.strokeWidthSecondary),
	strokeLinecap: normalizeStrokeLinecap(value?.strokeLinecap),
});

export const readStoredIconRenderSettings = (): IconRenderSettings => {
	if (typeof window === 'undefined') {
		return DEFAULT_ICON_RENDER_SETTINGS;
	}

	try {
		const rawValue = window.localStorage.getItem(ICON_RENDER_SETTINGS_STORAGE_KEY);
		if (!rawValue) {
			return DEFAULT_ICON_RENDER_SETTINGS;
		}

		return normalizeIconRenderSettings(JSON.parse(rawValue) as Partial<IconRenderSettings>);
	} catch {
		return DEFAULT_ICON_RENDER_SETTINGS;
	}
};

export const applyIconRenderSettingsToDocument = (value: IconRenderSettings): void => {
	if (typeof document === 'undefined') {
		return;
	}

	const settings = normalizeIconRenderSettings(value);
	const target = document.body;
	if (!target) {
		return;
	}

	let hasCustomValue = false;

	for (const [key, cssVariables] of Object.entries(DOCUMENT_STYLE_MAPPINGS) as [
		keyof IconRenderSettings,
		string[],
	][]) {
		const settingValue = settings[key];
		if (settingValue) {
			cssVariables.forEach((cssVariable) => {
				target.style.setProperty(cssVariable, settingValue);
			});
			hasCustomValue = true;
			continue;
		}

		cssVariables.forEach((cssVariable) => {
			target.style.removeProperty(cssVariable);
		});
	}

	target.dataset.openIconRenderActive = hasCustomValue ? 'true' : 'false';
};

export const writeStoredIconRenderSettings = (value: IconRenderSettings): void => {
	if (typeof window === 'undefined') {
		return;
	}

	const normalizedValue = normalizeIconRenderSettings(value);
	window.localStorage.setItem(ICON_RENDER_SETTINGS_STORAGE_KEY, JSON.stringify(normalizedValue));
	applyIconRenderSettingsToDocument(normalizedValue);
	window.dispatchEvent(
		new CustomEvent<IconRenderSettings>(OPEN_ICON_RENDER_SETTINGS_EVENT, {
			detail: normalizedValue,
		})
	);
};

export const buildIconRenderSearchParams = (value: IconRenderSettings): URLSearchParams => {
	const searchParams = new URLSearchParams();
	const settings = normalizeIconRenderSettings(value);

	if (settings.fill) {
		searchParams.set('fill', settings.fill);
	}

	if (settings.fillSecondary) {
		searchParams.set('fillSecondary', settings.fillSecondary);
	}

	if (settings.stroke) {
		searchParams.set('stroke', settings.stroke);
	}

	if (settings.strokeSecondary) {
		searchParams.set('strokeSecondary', settings.strokeSecondary);
	}

	if (settings.opacity) {
		searchParams.set('opacity', settings.opacity);
	}

	if (settings.strokeWidth) {
		searchParams.set('strokeWidth', settings.strokeWidth);
	}

	return searchParams;
};

export const appendSearchParams = (url: string, searchParams: URLSearchParams): string => {
	const query = searchParams.toString();
	if (!query) {
		return url;
	}

	return `${url}${url.includes('?') ? '&' : '?'}${query}`;
};
