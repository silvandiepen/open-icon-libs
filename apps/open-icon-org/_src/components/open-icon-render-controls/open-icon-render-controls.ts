import {
	DEFAULT_ICON_RENDER_SETTINGS,
	readStoredIconRenderSettings,
	writeStoredIconRenderSettings,
} from '../../lib/icon-render-settings.js';
import type { OpenIconRenderControlsState } from './open-icon-render-controls.model.js';

export class OpenIconRenderControlsElement extends HTMLElement {
	private state: OpenIconRenderControlsState = {
		settings: DEFAULT_ICON_RENDER_SETTINGS,
	};

	connectedCallback(): void {
		if (this.dataset.connected === 'true') {
			return;
		}

		this.dataset.connected = 'true';
		this.state.settings = readStoredIconRenderSettings();
		this.render();
	}

	private render(): void {
		this.innerHTML = `
			<section class="oi-render-controls" aria-label="Icon render controls">
				<div class="oi-render-controls__heading">Render settings</div>
				<div class="oi-render-controls__grid">
					<label class="oi-render-controls__field">
						<span>Fill</span>
						<input class="oi-gallery__input" name="fill" type="text" value="${this.escapeAttribute(
							this.state.settings.fill
						)}" placeholder="original or #ed2024" />
					</label>
					<label class="oi-render-controls__field">
						<span>Line color</span>
						<input class="oi-gallery__input" name="stroke" type="text" value="${this.escapeAttribute(
							this.state.settings.stroke
						)}" placeholder="original or #231f20" />
					</label>
					<label class="oi-render-controls__field">
						<span>Opacity</span>
						<input class="oi-gallery__input" name="opacity" type="number" min="0" max="1" step="0.05" value="${this.escapeAttribute(
							this.state.settings.opacity
						)}" placeholder="original" />
					</label>
					<label class="oi-render-controls__field">
						<span>Line thickness</span>
						<input class="oi-gallery__input" name="strokeWidth" type="number" min="0" step="0.25" value="${this.escapeAttribute(
							this.state.settings.strokeWidth
						)}" placeholder="original" />
					</label>
				</div>
				<div class="oi-render-controls__actions">
					<p class="oi-render-controls__hint">Leave a field empty to keep the original icon styling.</p>
					<button class="oi-gallery__show-all" type="button" data-reset-render-settings>Reset</button>
				</div>
			</section>
		`;

		this.bindEvents();
	}

	private bindEvents(): void {
		this.querySelectorAll<HTMLInputElement>('input[name]').forEach((input) => {
			input.addEventListener('input', () => {
				const fieldName = input.name as keyof OpenIconRenderControlsState['settings'];
				this.state.settings = {
					...this.state.settings,
					[fieldName]: input.value,
				};
				writeStoredIconRenderSettings(this.state.settings);
			});
		});

		this.querySelector('[data-reset-render-settings]')?.addEventListener('click', () => {
			this.state.settings = DEFAULT_ICON_RENDER_SETTINGS;
			writeStoredIconRenderSettings(this.state.settings);
			this.render();
		});
	}

	private escapeAttribute(value: string): string {
		return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
	}
}
