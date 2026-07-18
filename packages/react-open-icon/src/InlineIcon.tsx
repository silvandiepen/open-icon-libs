import { createElement } from 'react';
import type { HTMLAttributes, ReactElement } from 'react';

/**
 * Props for the fully tree-shakeable inline icon component.
 *
 * `icon` is a raw SVG string that you import statically — typically a per-icon
 * export from `open-icon/icons` (e.g. `IconUiSearchM`). Because the icon is a
 * value you import rather than a runtime name, only the icons you actually use
 * are included in your bundle: this component pulls in nothing from
 * `open-icon/runtime` (no catalog metadata, no loader map, no per-icon chunks).
 */
export interface InlineIconProps {
	/** SVG markup, e.g. a per-icon export from `open-icon/icons`. */
	icon: string;
	/** Element to render. Defaults to `span`. */
	as?: keyof React.JSX.IntrinsicElements;
	/** Accessible label; when set the element gets role="img". */
	title?: string;
}

const getAccessibleLabel = (
	title: string | undefined,
	ariaLabel: string | undefined
): string | null => title?.trim() || ariaLabel?.trim() || null;

export const InlineIcon = ({
	as = 'span',
	icon,
	title,
	...props
}: InlineIconProps & HTMLAttributes<HTMLElement>): ReactElement | null => {
	if (!icon) {
		return null;
	}

	const accessibleLabel = getAccessibleLabel(title, props['aria-label'] as string | undefined);
	const tagProps: Record<string, unknown> = {
		...props,
		dangerouslySetInnerHTML: { __html: icon },
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

export default InlineIcon;
