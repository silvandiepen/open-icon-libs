import {
	Icons,
	loadIcon,
	resolveOpenIconName,
	type OpenIconKey,
	type OpenIconName,
} from 'open-icon/runtime';
import { renderShadowOpenIconMarkup } from './markup.js';

export const resolveWcOpenIconName = (value: string | null | undefined): OpenIconName | null => {
	if (typeof value !== 'string') {
		return null;
	}

	const normalized = value.trim();
	if (!normalized) {
		return null;
	}

	const keyMatch = Icons[normalized as OpenIconKey];
	if (keyMatch) {
		return keyMatch;
	}

	return resolveOpenIconName(normalized);
};

export const renderWcOpenIconMarkup = (
	svg: string,
	title: string | null | undefined,
	ariaLabel?: string | null | undefined
): string => renderShadowOpenIconMarkup(svg, title, ariaLabel);

export const loadWcOpenIconMarkup = async (
	name: string | null | undefined,
	title: string | null | undefined,
	ariaLabel?: string | null | undefined
): Promise<string> => {
	const iconName = resolveWcOpenIconName(name);
	if (!iconName) {
		return '';
	}

	const svg = await loadIcon(iconName);
	if (!svg) {
		return '';
	}

	return renderWcOpenIconMarkup(svg, title, ariaLabel);
};
