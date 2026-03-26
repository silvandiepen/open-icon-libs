import {
	Icons,
	loadIcon,
	peekLoadedIcon,
	resolveOpenIconName,
	type OpenIconKey,
	type OpenIconName,
} from 'open-icon/runtime';
import {
	createElement,
	useEffect,
	useState,
} from 'react';
import type { HTMLAttributes, ReactElement } from 'react';
import type { ReactOpenIconName, ReactOpenIconProps } from './Icon.model.js';

const resolveIconNameInput = (value: ReactOpenIconName): OpenIconName | null => {
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

export const Icon = ({
	as = 'span',
	name,
	title,
	...props
}: ReactOpenIconProps & HTMLAttributes<HTMLElement>): ReactElement | null => {
	const iconName = resolveIconNameInput(name);
	const [svg, setSvg] = useState<string | null>(() => (iconName ? peekLoadedIcon(iconName) : null));

	useEffect(() => {
		let disposed = false;

		const syncIcon = async (): Promise<void> => {
			if (!iconName) {
				if (!disposed) {
					setSvg(null);
				}
				return;
			}

			const markup = await loadIcon(iconName);
			if (!disposed) {
				setSvg(markup ?? null);
			}
		};

		void syncIcon();

		return () => {
			disposed = true;
		};
	}, [iconName]);

	if (!iconName || !svg) {
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

export default Icon;
