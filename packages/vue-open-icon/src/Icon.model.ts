import type { OpenIconKey, OpenIconName } from 'open-icon';

export type OpenIconVueName = OpenIconName | OpenIconKey | string;

export interface OpenIconProps {
	name: OpenIconVueName;
	tag?: string;
	title?: string;
}
