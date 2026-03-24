import { loadIconCatalog } from '../../lib/site-data.js';
import { filterIcons, getIconDetailHref, normalizeSearchValue } from '../../lib/site-formatters.js';
import type { IconCategorySummary, SiteIconEntry } from '../../lib/site-data.model.js';
import type { OpenIconGalleryState } from './open-icon-gallery.model.js';

const PREVIEW_LIMIT = 18;

export const getGalleryIcons = (entries: readonly SiteIconEntry[], query: string, category: string): SiteIconEntry[] =>
	filterIcons(entries, query, category);

export const getGalleryMode = (value: string | null): 'full' | 'preview' =>
	value === 'preview' ? 'preview' : 'full';

export const shouldShowCategoryTiles = (query: string, category: string, mode: 'full' | 'preview'): boolean =>
	mode === 'full' && category === 'all' && !normalizeSearchValue(query);

export class OpenIconGalleryElement extends HTMLElement {
	private state: OpenIconGalleryState = {
		catalog: null,
		query: '',
		category: 'all',
		limit: null,
		mode: 'full',
	};

	connectedCallback(): void {
		if (this.dataset.connected === 'true') {
			return;
		}

		this.dataset.connected = 'true';
		this.state.mode = getGalleryMode(this.getAttribute('mode'));
		this.state.limit =
			this.state.mode === 'preview'
				? Number.parseInt(this.getAttribute('limit') ?? `${PREVIEW_LIMIT}`, 10) || PREVIEW_LIMIT
				: null;

		this.renderState('Loading icon catalog...');
		void this.load();
	}

	private async load(): Promise<void> {
		try {
			this.state.catalog = await loadIconCatalog();
			this.render();
		} catch (error) {
			this.renderState(error instanceof Error ? error.message : 'Failed to load icon catalog.');
		}
	}

	private renderState(message: string): void {
		this.innerHTML = `<div class="oi-gallery__state">${message}</div>`;
	}

	private render(): void {
		const catalog = this.state.catalog;
		if (!catalog) {
			return;
		}

		const showCategoryTiles = shouldShowCategoryTiles(this.state.query, this.state.category, this.state.mode);
		const filteredIcons = getGalleryIcons(catalog.entries, this.state.query, this.state.category);
		const visibleIcons = showCategoryTiles
			? []
			: this.state.limit === null
				? filteredIcons
				: filteredIcons.slice(0, Math.max(this.state.limit, 0));
		const showControls = this.state.mode === 'full';
		const activeCategory = this.state.category === 'all' ? null : catalog.categories.find((entry) => entry.name === this.state.category);
		const summaryTitle = showCategoryTiles
			? `Browse ${catalog.categories.length.toLocaleString()} categories`
			: `${filteredIcons.length.toLocaleString()} of ${catalog.total.toLocaleString()} icons`;
		const summaryDescription = showCategoryTiles
			? 'Choose a category to browse icons, or search the full catalog.'
			: this.state.query
				? `Search results${activeCategory ? ` in ${activeCategory.name}` : ''}.`
				: activeCategory
					? `${activeCategory.count.toLocaleString()} icons in ${activeCategory.name}.`
					: 'Browse the full icon catalog.';
		const canReset = Boolean(this.state.query) || this.state.category !== 'all';

		this.innerHTML = `
			<section class="oi-gallery" aria-label="Open Icon gallery">
				<div class="oi-gallery__panel">
					<div class="oi-gallery__summary">
						<div>
							<div class="oi-gallery__eyebrow">Catalog</div>
							<h3>${summaryTitle}</h3>
							<p class="oi-gallery__summary-copy">${summaryDescription}</p>
						</div>
						<div class="oi-gallery__summary-actions">
							${canReset ? '<button class="oi-gallery__show-all" type="button" data-reset-gallery>Reset filters</button>' : ''}
							${this.state.mode === 'preview' ? '<a class="oi-gallery__show-all" href="/icons/">Open full catalog</a>' : ''}
						</div>
					</div>
					${
						showControls
							? `
								<div class="oi-gallery__controls">
									<label class="oi-gallery__field">
										<span class="oi-gallery__label">Search</span>
										<input class="oi-gallery__input" name="query" type="search" placeholder="Search icons, aliases, or categories" value="${this.escapeAttribute(
											this.state.query
										)}" />
									</label>
									<label class="oi-gallery__field">
										<span class="oi-gallery__label">Category</span>
										<select class="oi-gallery__select" name="category">
											<option value="all">All categories</option>
											${catalog.categories
												.map(
													(category) => `
														<option value="${category.name}" ${
															category.name === this.state.category ? 'selected' : ''
														}>${category.name} (${category.count})</option>
													`
												)
												.join('')}
										</select>
									</label>
								</div>
							`
							: ''
					}
				</div>

				${
					showCategoryTiles
						? `
							<div class="oi-gallery__categories">
								${catalog.categories.map((category) => this.renderCategoryTile(category)).join('')}
							</div>
						`
						: visibleIcons.length
						? `
							<div class="oi-gallery__grid">
								${visibleIcons.map((icon) => this.renderCard(icon)).join('')}
							</div>
						`
						: '<div class="oi-gallery__empty">No icons matched the current filters.</div>'
				}
			</section>
		`;

		this.bindEvents();
	}

	private renderCategoryTile(category: IconCategorySummary): string {
		return `
			<button class="oi-gallery__category" type="button" data-category-name="${this.escapeAttribute(category.name)}">
				<span class="oi-gallery__category-title">${category.name}</span>
				<span class="oi-gallery__category-meta">${category.count.toLocaleString()} icons</span>
			</button>
		`;
	}

	private renderCard(icon: SiteIconEntry): string {
		return `
			<a class="oi-gallery__card" href="${getIconDetailHref(icon.name)}">
				<span class="oi-gallery__icon">
					<img loading="lazy" src="${icon.svgUrl || icon.url}" alt="${icon.label}" />
				</span>
				<span class="oi-gallery__card-title">${icon.label}</span>
				<span class="oi-gallery__meta">${icon.category}</span>
			</a>
		`;
	}

	private bindEvents(): void {
		const queryInput = this.querySelector<HTMLInputElement>('input[name="query"]');
		const categorySelect = this.querySelector<HTMLSelectElement>('select[name="category"]');

		queryInput?.addEventListener('input', () => {
			this.state.query = queryInput.value;
			this.render();
		});

		categorySelect?.addEventListener('change', () => {
			this.state.category = categorySelect.value;
			this.render();
		});

		this.querySelector('[data-reset-gallery]')?.addEventListener('click', () => {
			this.state.query = '';
			this.state.category = 'all';
			this.render();
		});

		this.querySelectorAll<HTMLElement>('[data-category-name]').forEach((tile) => {
			tile.addEventListener('click', () => {
				const categoryName = tile.dataset.categoryName;
				if (!categoryName) {
					return;
				}

				this.state.category = categoryName;
				this.render();
			});
		});
	}

	private escapeAttribute(value: string): string {
		return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
	}
}
