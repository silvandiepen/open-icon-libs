import { defineComponent, h } from 'vue';
import type {
	PropType,
	RendererElement,
	RendererNode,
	SetupContext,
	VNode,
} from 'vue';

/**
 * Props for the fully tree-shakeable inline icon component.
 *
 * `icon` is a raw SVG string that you import statically — typically a per-icon
 * export from `open-icon/icons` (e.g. `IconUiSearchM`). Because the icon is a
 * value you import rather than a runtime name, only the icons you actually use
 * are bundled: this component pulls in nothing from `open-icon/runtime` (no
 * catalog metadata, no loader map, no per-icon chunks).
 */
export interface InlineIconProps {
	/** SVG markup, e.g. a per-icon export from `open-icon/icons`. */
	icon: string;
	/** Element to render. Defaults to `span`. */
	tag?: string;
	/** Accessible label; when set the element gets role="img". */
	title?: string;
}

const getAccessibleLabel = (title: string, attrs: Record<string, unknown>): string | null => {
	const titleLabel = title.trim();
	if (titleLabel) {
		return titleLabel;
	}

	const ariaLabel = attrs['aria-label'];
	return typeof ariaLabel === 'string' && ariaLabel.trim() ? ariaLabel.trim() : null;
};

export const InlineIcon = defineComponent<InlineIconProps>({
	name: 'OpenInlineIcon',
	inheritAttrs: false,
	props: {
		icon: {
			type: String as PropType<string>,
			required: true,
		},
		tag: {
			type: String,
			default: 'span',
		},
		title: {
			type: String,
			default: '',
		},
	},
	setup(props: Readonly<InlineIconProps>, { attrs }: SetupContext) {
		return (): VNode<RendererNode, RendererElement> | null => {
			if (!props.icon) {
				return null;
			}

			const accessibleLabel = getAccessibleLabel(
				props.title ?? '',
				attrs as Record<string, unknown>
			);
			const wrapperAttrs: Record<string, unknown> = {
				...attrs,
				innerHTML: props.icon,
			};

			if (accessibleLabel) {
				wrapperAttrs['aria-label'] = accessibleLabel;
				wrapperAttrs.role ??= 'img';
				wrapperAttrs.title ??= accessibleLabel;
			} else if (wrapperAttrs['aria-hidden'] === undefined) {
				wrapperAttrs['aria-hidden'] = 'true';
			}

			return h(props.tag ?? 'span', wrapperAttrs);
		};
	},
});

export default InlineIcon;
