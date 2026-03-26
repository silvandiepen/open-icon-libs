import {
	Icons,
	getIcon,
	resolveOpenIconName,
	type OpenIconKey,
	type OpenIconName,
} from 'open-icon/static';
import { createElement } from 'react';
import type { HTMLAttributes, ReactElement } from 'react';
import type { ReactOpenIconName, ReactOpenIconProps } from './Icon.model.js';

const resolveStaticIconNameInput = (value: ReactOpenIconName): OpenIconName | null => {
	if (typeof value !== 'string') {
		return null;
	}

	const keyMatch = Icons[value as OpenIconKey];
	if (keyMatch) {
		return keyMatch;
	}

	return resolveOpenIconName(value);
};

const getAccessibleLabel = (
	title: string | undefined,
	ariaLabel: string | undefined
): string | null => {
	const titleLabel = title?.trim();
	if (titleLabel) {
		return titleLabel;
	}

	const aria = ariaLabel?.trim();
	return aria || null;
};

export const StaticIcon = ({
	as = 'span',
	name,
	title,
	...props
}: ReactOpenIconProps & HTMLAttributes<HTMLElement>): ReactElement | null => {
	const iconName = resolveStaticIconNameInput(name);
	if (!iconName) {
		return null;
	}

	const svg = getIcon(iconName);
	if (!svg) {
		return null;
	}

	const accessibleLabel = getAccessibleLabel(title, props['aria-label'] as string | undefined);
	const tagProps: Record<string, unknown> = {
		...props,
		dangerouslySetInnerHTML: { __html: svg },
	};

	if (accessibleLabel) {
		tagProps['aria-label'] = accessibleLabel;
		tagProps.role ??= 'img';
		tagProps.title ??= accessibleLabel;
	} else if (tagProps['aria-hidden'] === undefined) {
		tagProps['aria-hidden'] = 'true';
	}

	return createElement(as, tagProps);
};

export default StaticIcon;
