import { loadPackageCatalog } from '../../lib/site-data.js';
import type { SitePackageEntry } from '../../lib/site-data.model.js';

export const sortPackagesByName = (entries: readonly SitePackageEntry[]): SitePackageEntry[] =>
	entries.slice().sort((left, right) => left.name.localeCompare(right.name));

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
			const entries = sortPackagesByName(catalog.entries);

			this.innerHTML = `
				<section class="oi-packages" aria-label="Open Icon packages">
					<div class="oi-packages__grid">
						${entries
							.map(
								(entry) => `
									<article class="oi-package">
										<div class="oi-package__header">
											<div>
												<div class="oi-package__eyebrow">Package</div>
												<h3 class="oi-package__title">${entry.title}</h3>
											</div>
											<div class="oi-package__version">v${entry.version}</div>
										</div>
										<p>${entry.description}</p>
										<p class="oi-package__best-for">${entry.bestFor}</p>
										<ul class="oi-package__highlights">
											${entry.highlights.map((highlight) => `<li>${highlight}</li>`).join('')}
										</ul>
										<code class="oi-package__code">${entry.install}</code>
										<p><a href="${entry.href}">Read package guide</a></p>
									</article>
								`
							)
							.join('')}
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
