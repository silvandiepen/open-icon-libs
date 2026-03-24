import type { SiteIconCatalog, SiteIconEntry } from '../../lib/site-data.model.js';
import type { IconRenderSettings } from '../../lib/icon-render-settings.model.js';

export interface IconDownloadLink {
	label: string;
	href: string;
}

export interface OpenIconIconDetailState {
	catalog: SiteIconCatalog | null;
	iconName: string;
	settings: IconRenderSettings;
}

export interface OpenIconIconDetailPayload {
	icon: SiteIconEntry;
	downloads: IconDownloadLink[];
	relatedIcons: SiteIconEntry[];
}
