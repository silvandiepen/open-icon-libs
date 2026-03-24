import { loadIconCatalog, loadPackageCatalog } from '../../lib/site-data.js';
import type { SiteStatItem } from './open-icon-site-stats.model.js';

export const buildStatItems = ({
	iconTotal,
	categoryTotal,
	packageTotal,
}: {
	iconTotal: number;
	categoryTotal: number;
	packageTotal: number;
}): SiteStatItem[] => [
	{ label: 'SVG icons', value: iconTotal.toLocaleString() },
	{ label: 'Categories', value: categoryTotal.toString() },
	{ label: 'Packages', value: packageTotal.toString() },
];

export class OpenIconSiteStatsElement extends HTMLElement {
	connectedCallback(): void {
		if (this.dataset.connected === 'true') {
			return;
		}

		this.dataset.connected = 'true';
		this.renderState('Loading site stats...');
		void this.load();
	}

	private async load(): Promise<void> {
		try {
			const [icons, packages] = await Promise.all([loadIconCatalog(), loadPackageCatalog()]);
			const items = buildStatItems({
				iconTotal: icons.total,
				categoryTotal: icons.categories.length,
				packageTotal: packages.total,
			});

			this.innerHTML = `
				<section class="oi-stats" aria-label="Open Icon site stats">
					<div class="oi-stats__grid">
						${items
							.map(
								(item) => `
									<article class="oi-stat">
										<div class="oi-stat__label">${item.label}</div>
										<div class="oi-stat__value">${item.value}</div>
									</article>
								`
							)
							.join('')}
					</div>
				</section>
			`;
		} catch (error) {
			this.renderState(error instanceof Error ? error.message : 'Failed to load site stats.');
		}
	}

	private renderState(message: string): void {
		this.innerHTML = `<div class="oi-gallery__state">${message}</div>`;
	}
}
