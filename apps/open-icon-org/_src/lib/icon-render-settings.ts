import type { IconRenderSettings } from './icon-render-settings.model.js';

export const ICON_RENDER_SETTINGS_STORAGE_KEY = 'open-icon-render-settings';
export const OPEN_ICON_RENDER_SETTINGS_EVENT = 'open-icon-render-settings-change';

export const DEFAULT_ICON_RENDER_SETTINGS: IconRenderSettings = {
	fill: '',
	stroke: '',
	opacity: '',
	strokeWidth: '',
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

export const normalizeIconRenderSettings = (
	value: Partial<IconRenderSettings> | null | undefined
): IconRenderSettings => ({
	fill: normalizeColorValue(value?.fill),
	stroke: normalizeColorValue(value?.stroke),
	opacity: normalizeOpacity(value?.opacity),
	strokeWidth: normalizeStrokeWidth(value?.strokeWidth),
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

export const writeStoredIconRenderSettings = (value: IconRenderSettings): void => {
	if (typeof window === 'undefined') {
		return;
	}

	const normalizedValue = normalizeIconRenderSettings(value);
	window.localStorage.setItem(ICON_RENDER_SETTINGS_STORAGE_KEY, JSON.stringify(normalizedValue));
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

	if (settings.stroke) {
		searchParams.set('stroke', settings.stroke);
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
