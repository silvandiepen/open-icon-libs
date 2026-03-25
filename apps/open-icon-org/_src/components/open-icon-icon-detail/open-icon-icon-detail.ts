import {
	DEFAULT_ICON_RENDER_SETTINGS,
	OPEN_ICON_RENDER_SETTINGS_EVENT,
	appendSearchParams,
	buildIconRenderSearchParams,
	normalizeIconRenderSettings,
	readStoredIconRenderSettings,
} from '../../lib/icon-render-settings.js';
import { hydrateInlineIcons } from '../../lib/inline-icon.js';
import { loadIconCatalog } from '../../lib/site-data.js';
import { getIconDetailHref, getIconSnippets, getRelatedIcons, parseIconDetailHash } from '../../lib/site-formatters.js';
import type { SiteIconEntry } from '../../lib/site-data.model.js';
import type { IconDownloadLink, OpenIconIconDetailPayload, OpenIconIconDetailState } from './open-icon-icon-detail.model.js';

export const findIconByName = (entries: readonly SiteIconEntry[], iconName: string): SiteIconEntry | null =>
	entries.find((entry) => entry.name === iconName) ?? null;

export const getActiveIconName = (iconName: string | null, hash: string): string =>
	iconName || parseIconDetailHash(hash);

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

	private readonly handleHashChange = (): void => {
		if (this.getAttribute('icon')) {
			return;
		}

		this.state.iconName = getActiveIconName(this.getAttribute('icon'), window.location.hash);
		this.render();
	};

	private readonly handleDialogClose = (): void => {
		if (this.getAttribute('icon') || typeof window === 'undefined' || !window.location.hash) {
			return;
		}

		window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
		this.state.iconName = '';
		this.render();
	};

	connectedCallback(): void {
		if (this.dataset.connected === 'true') {
			return;
		}

		this.dataset.connected = 'true';
		this.state.iconName = getActiveIconName(this.getAttribute('icon'), window.location.hash);
		this.state.settings = readStoredIconRenderSettings();
		window.addEventListener(OPEN_ICON_RENDER_SETTINGS_EVENT, this.handleRenderSettingsChange);
		window.addEventListener('hashchange', this.handleHashChange);
		if (!this.getAttribute('icon') && !this.state.iconName) {
			this.render();
			void this.load();
			return;
		}

		if (!this.state.iconName) {
			this.renderState('Missing icon name.');
		} else {
			this.renderState('Loading icon details...');
		}

		void this.load();
	}

	disconnectedCallback(): void {
		window.removeEventListener(OPEN_ICON_RENDER_SETTINGS_EVENT, this.handleRenderSettingsChange);
		window.removeEventListener('hashchange', this.handleHashChange);
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
		if (!this.getAttribute('icon')) {
			this.innerHTML = `
				<dialog class="oi-gallery__dialog" aria-label="Icon details">
					<div class="oi-gallery__dialog-surface">
						<div class="oi-gallery__state">${message}</div>
					</div>
				</dialog>
			`;
			this.syncDialogState();
			return;
		}

		this.innerHTML = `<div class="oi-gallery__state">${message}</div>`;
	}

	private render(): void {
		const catalog = this.state.catalog;
		const fixedIconName = this.getAttribute('icon');
		const iconName = getActiveIconName(fixedIconName, typeof window === 'undefined' ? '' : window.location.hash);
		this.state.iconName = iconName;

		if (!catalog) {
			if (!fixedIconName && !iconName) {
				this.innerHTML = `<dialog class="oi-gallery__dialog" aria-label="Icon details"></dialog>`;
			}
			return;
		}

		if (!iconName) {
			if (!fixedIconName) {
				this.innerHTML = `<dialog class="oi-gallery__dialog" aria-label="Icon details"></dialog>`;
			}
			return;
		}

		const icon = findIconByName(catalog.entries, iconName);
		if (!icon) {
			if (!fixedIconName && typeof window !== 'undefined' && window.location.hash) {
				window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
				this.state.iconName = '';
				this.innerHTML = `<dialog class="oi-gallery__dialog" aria-label="Icon details"></dialog>`;
				return;
			}

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
		const downloadLinks = payload.downloads.map((download) => ({
			...download,
			href: appendSearchParams(download.href, renderSearchParams),
		}));

		const detailMarkup = `
			<section class="oi-icon-detail" aria-label="${this.escapeAttribute(icon.label)} icon details">
				<div class="oi-icon-detail__hero">
					<div class="oi-icon-detail__preview">
						<div class="oi-icon-detail__preview-icon" data-inline-icon-url="${this.escapeAttribute(icon.url)}" aria-hidden="true"></div>
					</div>
					<div class="oi-icon-detail__intro">
						<div class="oi-gallery__eyebrow">${icon.category}</div>
						<h1 class="oi-icon-detail__title">${icon.label}</h1>
						<p class="oi-icon-detail__lede">${icon.name}</p>
					</div>
				</div>

				<section class="oi-icon-detail__section">
					<h2>Downloads</h2>
					<div class="oi-icon-detail__downloads">
						${downloadLinks
							.map(
								(download) => `
									<a href="${download.href}" target="_blank" rel="noreferrer">${download.label}</a>
								`
							)
							.join('')}
					</div>
				</section>

				<section class="oi-icon-detail__section">
					<h2>Details</h2>
					<dl class="oi-icon-detail__meta">
						<dt>Canonical name</dt><dd><code>${icon.name}</code></dd>
						<dt>Open Icon const</dt><dd><code>Icons.${icon.constName}</code></dd>
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
										<button type="button" data-copy="${this.escapeAttribute(snippet.value)}">Copy</button>
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

		this.innerHTML = fixedIconName
			? detailMarkup
			: `
				<dialog class="oi-gallery__dialog" aria-label="${this.escapeAttribute(icon.label)} icon details">
					<div class="oi-gallery__dialog-surface">
						<div class="oi-gallery__dialog-header">
							<div class="oi-gallery__dialog-icon" data-inline-icon-url="${this.escapeAttribute(icon.url)}" aria-hidden="true"></div>
							<div class="oi-gallery__dialog-copy">
								<div class="oi-render-controls__heading">${icon.label}</div>
								<div class="oi-gallery__eyebrow">${icon.name}</div>
							</div>
							<button type="button" data-close-icon-detail>Close</button>
						</div>
						<div class="oi-gallery__dialog-content">
							${detailMarkup}
						</div>
					</div>
				</dialog>
			`;

		this.bindEvents();
		this.syncDialogState();
		void hydrateInlineIcons(this);
	}

	private renderRelatedIcon(icon: SiteIconEntry): string {
		return `
			<article class="oi-gallery__card">
				<a class="oi-gallery__card-link" href="${getIconDetailHref(icon.name)}">
					<span class="oi-gallery__icon" data-inline-icon-url="${this.escapeAttribute(icon.url)}" aria-hidden="true">
					</span>
					<span class="oi-gallery__card-copy">
						<span class="oi-gallery__card-title">${icon.label}</span>
						<span class="oi-gallery__meta">${icon.category}</span>
					</span>
				</a>
			</article>
		`;
	}

	private bindEvents(): void {
		this.querySelector<HTMLDialogElement>('dialog')?.addEventListener('close', this.handleDialogClose);
		this.querySelector<HTMLDialogElement>('dialog')?.addEventListener('click', (event) => {
			if (event.target === event.currentTarget) {
				this.querySelector<HTMLDialogElement>('dialog')?.close();
			}
		});
		this.querySelector('[data-close-icon-detail]')?.addEventListener('click', () => {
			this.querySelector<HTMLDialogElement>('dialog')?.close();
		});

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

	private syncDialogState(): void {
		const dialog = this.querySelector<HTMLDialogElement>('dialog');
		if (!dialog) {
			return;
		}

		if (this.state.iconName) {
			if (!dialog.open) {
				dialog.showModal();
			}
			return;
		}

		if (dialog.open) {
			dialog.close();
		}
	}
}
