import {
	DEFAULT_ICON_RENDER_SETTINGS,
	OPEN_ICON_RENDER_SETTINGS_EVENT,
	appendSearchParams,
	buildIconRenderSearchParams,
	normalizeIconRenderSettings,
	readStoredIconRenderSettings,
} from '../../lib/icon-render-settings.js';
import { loadIconCatalog } from '../../lib/site-data.js';
import { getIconDetailHref, getIconSnippets, getRelatedIcons } from '../../lib/site-formatters.js';
import type { SiteIconEntry } from '../../lib/site-data.model.js';
import type { IconDownloadLink, OpenIconIconDetailPayload, OpenIconIconDetailState } from './open-icon-icon-detail.model.js';

export const findIconByName = (entries: readonly SiteIconEntry[], iconName: string): SiteIconEntry | null =>
	entries.find((entry) => entry.name === iconName) ?? null;

export const buildIconDownloadLinks = (icon: SiteIconEntry): IconDownloadLink[] => {
	return [
		{
			label: 'SVG',
			href: icon.svgUrl || icon.url,
		},
		{
			label: 'PNG 128',
			href: `${icon.pngUrl}?size=128`,
		},
		{
			label: 'PNG 512',
			href: `${icon.pngUrl}?size=512`,
		},
		{
			label: 'PNG 1024',
			href: `${icon.pngUrl}?size=1024`,
		},
	];
};

export class OpenIconIconDetailElement extends HTMLElement {
	private state: OpenIconIconDetailState = {
		catalog: null,
		iconName: '',
		settings: DEFAULT_ICON_RENDER_SETTINGS,
	};

	private readonly handleRenderSettingsChange = (event: Event): void => {
		if (!(event instanceof CustomEvent)) {
			return;
		}

		this.state.settings = normalizeIconRenderSettings(event.detail as OpenIconIconDetailState['settings']);
		this.render();
	};

	connectedCallback(): void {
		if (this.dataset.connected === 'true') {
			return;
		}

		this.dataset.connected = 'true';
		this.state.iconName = this.getAttribute('icon') ?? '';
		this.state.settings = readStoredIconRenderSettings();
		window.addEventListener(OPEN_ICON_RENDER_SETTINGS_EVENT, this.handleRenderSettingsChange);
		if (!this.state.iconName) {
			this.renderState('Missing icon name.');
			return;
		}

		this.renderState('Loading icon details...');
		void this.load();
	}

	disconnectedCallback(): void {
		window.removeEventListener(OPEN_ICON_RENDER_SETTINGS_EVENT, this.handleRenderSettingsChange);
	}

	private async load(): Promise<void> {
		try {
			this.state.catalog = await loadIconCatalog();
			this.render();
		} catch (error) {
			this.renderState(error instanceof Error ? error.message : 'Failed to load icon details.');
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

		const icon = findIconByName(catalog.entries, this.state.iconName);
		if (!icon) {
			this.renderState(`Icon not found: ${this.escapeHtml(this.state.iconName)}`);
			return;
		}

		const payload: OpenIconIconDetailPayload = {
			icon,
			downloads: buildIconDownloadLinks(icon),
			relatedIcons: getRelatedIcons(catalog.entries, icon, 12),
		};
		const snippets = getIconSnippets(icon);
		const aliases = icon.aliases.filter((alias) => alias !== icon.name);
		const renderSearchParams = buildIconRenderSearchParams(this.state.settings);
		const previewUrl = appendSearchParams(icon.svgUrl || icon.url, renderSearchParams);
		const downloadLinks = payload.downloads.map((download) => ({
			...download,
			href: appendSearchParams(download.href, renderSearchParams),
		}));

		this.innerHTML = `
			<section class="oi-icon-detail" aria-label="${this.escapeAttribute(icon.label)} icon details">
				<div class="oi-icon-detail__hero">
					<div class="oi-icon-detail__preview">
						<img src="${previewUrl}" alt="${this.escapeAttribute(icon.label)}" />
					</div>
					<div class="oi-icon-detail__intro">
						<div class="oi-gallery__eyebrow">${icon.category}</div>
						<h1 class="oi-icon-detail__title">${icon.label}</h1>
						<p class="oi-icon-detail__lede">${icon.name}</p>
					</div>
				</div>

				<section class="oi-icon-detail__section">
					<open-icon-render-controls></open-icon-render-controls>
				</section>

				<section class="oi-icon-detail__section">
					<h2>Downloads</h2>
					<div class="oi-icon-detail__downloads">
						${downloadLinks
							.map(
								(download) => `
									<a class="oi-gallery__show-all" href="${download.href}" target="_blank" rel="noreferrer">${download.label}</a>
								`
							)
							.join('')}
					</div>
				</section>

				<section class="oi-icon-detail__section">
					<h2>Details</h2>
					<dl class="oi-icon-detail__meta">
						<dt>Canonical name</dt><dd><code>${icon.name}</code></dd>
						<dt>Category</dt><dd>${icon.category}</dd>
						<dt>Package path</dt><dd><code>${icon.filePath}</code></dd>
						<dt>Relative file</dt><dd><code>${icon.relativeFilePath}</code></dd>
					</dl>
				</section>

				<section class="oi-icon-detail__section">
					<h2>Aliases</h2>
					<div class="oi-icon-detail__aliases">
						${
							aliases.length
								? aliases.map((alias) => `<span class="oi-gallery__chip">${alias}</span>`).join('')
								: '<span class="oi-icon-detail__muted">No alternate aliases</span>'
						}
					</div>
				</section>

				<section class="oi-icon-detail__section">
					<h2>Use this icon</h2>
					<div class="oi-icon-detail__snippets">
						${snippets
							.map(
								(snippet) => `
									<div class="oi-icon-detail__snippet">
										<div>
											<div class="oi-gallery__snippet-label">${snippet.label}</div>
											<code>${snippet.value}</code>
										</div>
										<button class="oi-gallery__copy" type="button" data-copy="${this.escapeAttribute(snippet.value)}">Copy</button>
									</div>
								`
							)
							.join('')}
					</div>
				</section>

				<section class="oi-icon-detail__section oi-icon-detail__related">
					<h2>Related icons</h2>
					<div class="oi-gallery__grid">
						${payload.relatedIcons.map((relatedIcon) => this.renderRelatedIcon(relatedIcon)).join('')}
					</div>
				</section>
			</section>
		`;

		this.bindEvents();
	}

	private renderRelatedIcon(icon: SiteIconEntry): string {
		const previewUrl = appendSearchParams(icon.svgUrl || icon.url, buildIconRenderSearchParams(this.state.settings));

		return `
			<a class="oi-gallery__card" href="${getIconDetailHref(icon.name)}">
				<span class="oi-gallery__icon">
					<img loading="lazy" src="${previewUrl}" alt="${this.escapeAttribute(icon.label)}" />
				</span>
				<span class="oi-gallery__card-title">${icon.label}</span>
				<span class="oi-gallery__meta">${icon.category}</span>
			</a>
		`;
	}

	private bindEvents(): void {
		this.querySelectorAll<HTMLElement>('[data-copy]').forEach((button) => {
			button.addEventListener('click', async () => {
				const value = button.dataset.copy;
				if (!value) {
					return;
				}

				try {
					await navigator.clipboard.writeText(value);
					button.textContent = 'Copied';
					window.setTimeout(() => {
						button.textContent = 'Copy';
					}, 1400);
				} catch {
					button.textContent = 'Copy failed';
				}
			});
		});
	}

	private escapeAttribute(value: string): string {
		return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
	}

	private escapeHtml(value: string): string {
		return this.escapeAttribute(value).replaceAll('<', '&lt;').replaceAll('>', '&gt;');
	}
}
