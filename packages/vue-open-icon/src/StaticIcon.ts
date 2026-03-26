import {
	Icons,
	getIcon,
	resolveOpenIconName,
	type OpenIconKey,
	type OpenIconName,
} from 'open-icon/static';
import { defineComponent, h } from 'vue';
import type {
	PropType,
	RendererElement,
	RendererNode,
	SetupContext,
	VNode,
} from 'vue';
import type { OpenIconProps, OpenIconVueName } from './Icon.model.js';

const resolveStaticIconNameInput = (value: OpenIconVueName): OpenIconName | null => {
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
	title: string,
	attrs: Record<string, unknown>
): string | null => {
	const titleLabel = title.trim();
	if (titleLabel) {
		return titleLabel;
	}

	const ariaLabel = attrs['aria-label'];
	return typeof ariaLabel === 'string' && ariaLabel.trim() ? ariaLabel.trim() : null;
};

export const StaticIcon = defineComponent<OpenIconProps>({
	name: 'OpenIconStatic',
	inheritAttrs: false,
	props: {
		name: {
			type: String as PropType<OpenIconVueName>,
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
	setup(props: Readonly<OpenIconProps>, { attrs }: SetupContext) {
		return (): VNode<RendererNode, RendererElement> | null => {
			const iconName = resolveStaticIconNameInput(props.name);
			if (!iconName) {
				return null;
			}

			const svg = getIcon(iconName);
			if (!svg) {
				return null;
			}

			const accessibleLabel = getAccessibleLabel(props.title ?? '', attrs as Record<string, unknown>);
			const wrapperAttrs: Record<string, unknown> = {
				...attrs,
				innerHTML: svg,
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

export default StaticIcon;
