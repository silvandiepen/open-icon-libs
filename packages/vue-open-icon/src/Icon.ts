import {
	Icons,
	loadIcon,
	resolveOpenIconName,
	type OpenIconKey,
	type OpenIconName,
} from 'open-icon/runtime';
import {
	defineComponent,
	h,
	onServerPrefetch,
	ref,
	watch,
} from 'vue';
import type {
	PropType,
	RendererElement,
	RendererNode,
	SetupContext,
	VNode,
} from 'vue';
import type { OpenIconProps, OpenIconVueName } from './Icon.model.js';

const resolveIconNameInput = (value: OpenIconVueName): OpenIconName | null => {
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

export const Icon = defineComponent<OpenIconProps>({
	name: 'OpenIcon',
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
		const svg = ref('');
		let requestId = 0;

		const syncIcon = async (): Promise<void> => {
			const currentRequestId = ++requestId;
			const iconName = resolveIconNameInput(props.name);
			if (!iconName) {
				svg.value = '';
				return;
			}

			const markup = await loadIcon(iconName);
			if (currentRequestId !== requestId) {
				return;
			}

			svg.value = markup ?? '';
		};

		watch(() => props.name, () => {
			void syncIcon();
		}, { immediate: true });
		onServerPrefetch(syncIcon);

		return (): VNode<RendererNode, RendererElement> | null => {
			if (!svg.value) {
				return null;
			}

			const accessibleLabel = getAccessibleLabel(props.title ?? '', attrs as Record<string, unknown>);
			const wrapperAttrs: Record<string, unknown> = {
				...attrs,
				innerHTML: svg.value,
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

export default Icon;
