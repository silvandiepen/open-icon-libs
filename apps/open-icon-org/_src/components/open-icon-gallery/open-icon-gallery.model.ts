import type { IconRenderSettings } from '../../lib/icon-render-settings.model.js';
import type { SiteIconCatalog } from '../../lib/site-data.model.js';

export interface OpenIconGalleryState {
	catalog: SiteIconCatalog | null;
	query: string;
	category: string;
	limit: number | null;
	mode: 'full' | 'preview';
	settings: IconRenderSettings;
}
