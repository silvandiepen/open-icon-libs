import { loadIconCatalog, loadPackageCatalog } from '../../lib/site-data.js';
import type { SiteStatItem } from './open-icon-site-stats.model.js';

export const getPrimaryPackageVersion = (
	entries: readonly { name: string; version: string }[]
): string =>
	entries.find((entry) => entry.name === 'open-icon')?.version ?? entries[0]?.version ?? '';

export const buildStatItems = ({
	currentVersion,
	iconTotal,
	categoryTotal,
	packageTotal,
}: {
	currentVersion: string;
	iconTotal: number;
	categoryTotal: number;
	packageTotal: number;
}): SiteStatItem[] =>
	[
		currentVersion ? { label: 'Current version', value: `v${currentVersion}` } : null,
		{ label: 'SVG icons', value: iconTotal.toLocaleString() },
		{ label: 'Categories', value: categoryTotal.toString() },
		{ label: 'Packages', value: packageTotal.toString() },
	].filter((item): item is SiteStatItem => item !== null);

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
				currentVersion: getPrimaryPackageVersion(packages.entries),
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
