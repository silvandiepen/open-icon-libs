import {
	Icons,
	loadIcon,
	resolveOpenIconName,
	type OpenIconKey,
	type OpenIconName,
} from 'open-icon/runtime';

export const resolveAngularOpenIconName = (
	value: string | null | undefined
): OpenIconName | null => {
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

export const loadAngularOpenIconMarkup = async (
	name: string | null | undefined
): Promise<string> => {
	const iconName = resolveAngularOpenIconName(name);
	if (!iconName) {
		return '';
	}

	return (await loadIcon(iconName)) ?? '';
};

export const getAngularOpenIconLabel = (
	title: string | null | undefined,
	ariaLabel: string | null | undefined
): string | null => {
	const titleValue = title?.trim();
	if (titleValue) {
		return titleValue;
	}

	const ariaValue = ariaLabel?.trim();
	return ariaValue || null;
};
