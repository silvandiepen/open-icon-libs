export interface AssetsBinding {
	fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

export interface Env {
	ASSETS: AssetsBinding;
}

export interface ApiIconEntry {
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

export interface ApiPackageEntry {
	name: string;
	title: string;
	description: string;
	version: string;
	install: string;
	href: string;
	bestFor: string;
	highlights: string[];
}

export interface ApiIconDetail extends ApiIconEntry {
	aliases: string[];
}

export interface IconQueryResult {
	total: number;
	page: number;
	perPage: number;
	items: readonly unknown[];
}

export interface CloudflareImageOptions {
	format?: 'png' | 'avif' | 'webp' | 'json';
	width?: number;
	height?: number;
}

export interface CloudflareRequestInit extends RequestInit {
	cf?: {
		image?: CloudflareImageOptions;
	};
}
