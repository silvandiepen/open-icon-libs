import {
	Icons,
	getIcon,
	resolveOpenIconName,
	type OpenIconKey,
	type OpenIconName,
} from 'open-icon/static';
import { StaticIconComponent } from './static-icon.component.js';
import { getAngularOpenIconLabel } from './icon.utils.js';

export const resolveStaticAngularOpenIconName = (
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

export const getStaticAngularOpenIconMarkup = (
	name: string | null | undefined
): string => {
	const iconName = resolveStaticAngularOpenIconName(name);
	if (!iconName) {
		return '';
	}

	return getIcon(iconName) ?? '';
};

export {
	getAngularOpenIconLabel,
	StaticIconComponent,
};

export * from 'open-icon/static';
