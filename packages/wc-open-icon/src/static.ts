import {
	Icons,
	getIcon,
	resolveOpenIconName,
	type OpenIconKey,
	type OpenIconName,
} from 'open-icon/static';

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

const escapeAttribute = (value: string): string =>
	value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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

	const accessibleLabel = title?.trim() || ariaLabel?.trim() || '';
	const accessibilityAttributes = accessibleLabel
		? ` role="img" aria-label="${escapeAttribute(accessibleLabel)}" title="${escapeAttribute(accessibleLabel)}"`
		: ' aria-hidden="true"';

	return `<span${accessibilityAttributes}>${svg}</span>`;
};

export * from 'open-icon/static';
