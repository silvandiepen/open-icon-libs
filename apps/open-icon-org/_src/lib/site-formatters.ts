import type { SiteIconEntry } from './site-data.model.js';

export interface IconSnippet {
	label: string;
	value: string;
}

export const normalizeSearchValue = (value: string): string =>
	value
		.toLowerCase()
		.trim()
		.replace(/\s+/g, ' ');

const tokenizeIconValue = (value: string): string[] =>
	normalizeSearchValue(value)
		.replaceAll('/', ' ')
		.split(/[\s-]+/)
		.filter(Boolean);

export const filterIcons = (
	icons: readonly SiteIconEntry[],
	query: string,
	category: string
): SiteIconEntry[] => {
	const normalizedQuery = normalizeSearchValue(query);

	return icons.filter((icon) => {
		if (category !== 'all' && icon.category !== category) {
			return false;
		}

		if (!normalizedQuery) {
			return true;
		}

		const haystack = [icon.name, icon.label, ...icon.aliases].join(' ').toLowerCase();
		return haystack.includes(normalizedQuery);
	});
};

export const getIconDetailHref = (iconName: string): string =>
	`/icons/${iconName
		.split('/')
		.map((segment) => encodeURIComponent(segment))
		.join('/')}/`;

export const getRelatedIcons = (
	icons: readonly SiteIconEntry[],
	currentIcon: SiteIconEntry,
	limit = 8
): SiteIconEntry[] => {
	const currentTokens = new Set(tokenizeIconValue(currentIcon.name));

	return icons
		.filter((icon) => icon.name !== currentIcon.name && icon.category === currentIcon.category)
		.map((icon) => {
			const tokenScore = tokenizeIconValue(icon.name).reduce(
				(score, token) => score + (currentTokens.has(token) ? 1 : 0),
				0
			);

			return { icon, tokenScore };
		})
		.sort((left, right) => right.tokenScore - left.tokenScore || left.icon.label.localeCompare(right.icon.label))
		.slice(0, limit)
		.map((entry) => entry.icon);
};

export const getIconSnippets = (icon: SiteIconEntry): IconSnippet[] => [
	{
		label: 'Canonical name',
		value: icon.name,
	},
	{
		label: 'Package import',
		value: `import icon from 'open-icon-svg/${icon.filePath}';`,
	},
	{
		label: 'Vite loader import',
		value: `import icon from 'open-icon-svg/${icon.filePath}?open-icon';`,
	},
];
