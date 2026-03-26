import { loadPackageCatalog } from '../../lib/site-data.js';
import type { SitePackageEntry } from '../../lib/site-data.model.js';

export const sortPackagesByOrder = (entries: readonly SitePackageEntry[]): SitePackageEntry[] =>
	entries.slice().sort((left, right) => left.order - right.order || left.name.localeCompare(right.name));

export const groupPackages = (entries: readonly SitePackageEntry[]) => {
	const orderedEntries = sortPackagesByOrder(entries);

	return {
		core: orderedEntries.filter((entry) => entry.group === 'core'),
		framework: orderedEntries.filter((entry) => entry.group === 'framework'),
	};
};

const renderPackageCard = (entry: SitePackageEntry): string => `
	<article class="oi-package">
		<div class="oi-package__header">
			<div>
				<div class="oi-package__eyebrow">${entry.groupLabel}</div>
				<h3 class="oi-package__title"><a href="${entry.href}">${entry.title}</a></h3>
			</div>
			<div class="oi-package__version">v${entry.version}</div>
		</div>
		<p>${entry.description}</p>
		<p class="oi-package__best-for">${entry.bestFor}</p>
		<ul class="oi-package__highlights">
			${entry.highlights.map((highlight) => `<li>${highlight}</li>`).join('')}
		</ul>
		<code class="oi-package__code">${entry.install}</code>
		<p class="oi-package__actions"><a href="${entry.href}">Open package details</a></p>
	</article>
`;

export class OpenIconPackageGridElement extends HTMLElement {
	connectedCallback(): void {
		if (this.dataset.connected === 'true') {
			return;
		}

		this.dataset.connected = 'true';
		this.renderState('Loading packages...');
		void this.load();
	}

	private async load(): Promise<void> {
		try {
			const catalog = await loadPackageCatalog();
			const groups = groupPackages(catalog.entries);

			this.innerHTML = `
				<section class="oi-packages" aria-label="Open Icon packages">
					<div class="oi-packages__section">
						<div class="oi-packages__section-copy">
							<h2>Core packages</h2>
							<p>The catalog, asset, transform, and tooling packages that the rest of the ecosystem builds on.</p>
						</div>
						<div class="oi-packages__grid">
							${groups.core.map(renderPackageCard).join('')}
						</div>
					</div>
					<div class="oi-packages__section">
						<div class="oi-packages__section-copy">
							<h2>Framework packages</h2>
							<p>Framework-specific wrappers that sit on top of <code>open-icon</code> and expose runtime and static rendering APIs.</p>
						</div>
						<div class="oi-packages__grid">
							${groups.framework.map(renderPackageCard).join('')}
						</div>
					</div>
				</section>
			`;
		} catch (error) {
			this.renderState(error instanceof Error ? error.message : 'Failed to load packages.');
		}
	}

	private renderState(message: string): void {
		this.innerHTML = `<div class="oi-gallery__state">${message}</div>`;
	}
}
