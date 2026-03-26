import type { OpenIconKey, OpenIconName } from 'open-icon';

export type ReactOpenIconName = OpenIconName | OpenIconKey | string;

export interface ReactOpenIconProps {
	as?: keyof React.JSX.IntrinsicElements;
	name: ReactOpenIconName;
	title?: string;
}
