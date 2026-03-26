import {
	Icons,
	loadIcon,
	resolveOpenIconName,
	type OpenIconKey,
	type OpenIconName,
} from 'open-icon/runtime';

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
): string => {
	const accessibleLabel = title?.trim() || ariaLabel?.trim() || '';
	const accessibilityAttributes = accessibleLabel
		? ` role="img" aria-label="${escapeAttribute(accessibleLabel)}" title="${escapeAttribute(accessibleLabel)}"`
		: ' aria-hidden="true"';

	return `<style>:host{display:inline-flex;line-height:0;vertical-align:middle}svg{display:block;width:1em;height:1em}</style><span part="icon"${accessibilityAttributes}>${svg}</span>`;
};

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

const escapeAttribute = (value: string): string =>
	value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
