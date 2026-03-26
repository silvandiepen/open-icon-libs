export * from './runtime.js';

import { OPEN_ICON_SVG_BY_NAME } from './generated/openIconIcons.generated.js';
import { resolveOpenIconName } from './runtime.js';

export const getIcon = (value: string): string | null => {
	const iconName = resolveOpenIconName(value);
	if (!iconName) {
		return null;
	}

	return OPEN_ICON_SVG_BY_NAME[iconName] ?? null;
};
