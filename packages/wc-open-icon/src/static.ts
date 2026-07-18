import {
	Icons,
	getIcon,
	resolveOpenIconName,
	type OpenIconKey,
	type OpenIconName,
} from 'open-icon/static';
import { renderLightOpenIconMarkup } from './markup.js';

export const resolveStaticWcOpenIconName = (value: string | null | undefined): OpenIconName | null => {
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

export const renderStaticOpenIconMarkup = (
	name: string | null | undefined,
	title: string | null | undefined,
	ariaLabel?: string | null | undefined
): string => {
	const iconName = resolveStaticWcOpenIconName(name);
	if (!iconName) {
		return '';
	}

	const svg = getIcon(iconName);
	if (!svg) {
		return '';
	}

	return renderLightOpenIconMarkup(svg, title, ariaLabel);
};

export * from 'open-icon/static';
