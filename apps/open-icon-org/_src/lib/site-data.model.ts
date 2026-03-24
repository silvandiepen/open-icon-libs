export interface IconCategorySummary {
	name: string;
	count: number;
}

export interface SiteIconEntry {
	name: string;
	category: string;
	label: string;
	filePath: string;
	relativeFilePath: string;
	url: string;
	apiUrl: string;
	svgUrl: string;
	pngUrl: string;
	aliases: string[];
}

export interface SiteIconCatalog {
	total: number;
	categories: IconCategorySummary[];
	entries: SiteIconEntry[];
}

export interface SitePackageEntry {
	name: string;
	title: string;
	description: string;
	version: string;
	install: string;
	href: string;
	bestFor: string;
	highlights: string[];
}

export interface SitePackageCatalog {
	total: number;
	entries: SitePackageEntry[];
}
