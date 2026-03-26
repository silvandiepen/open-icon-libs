import { loadWcOpenIconMarkup } from './icon.utils.js';

const BaseHTMLElement = globalThis.HTMLElement ?? class {};

export class OpenIconElement extends BaseHTMLElement {
	static get observedAttributes(): string[] {
		return ['name', 'title', 'aria-label'];
	}

	readonly shadowRootRef: ShadowRoot;

	constructor() {
		super();
		this.shadowRootRef = this.attachShadow({ mode: 'open' });
	}

	connectedCallback(): void {
		this.render();
	}

	attributeChangedCallback(): void {
		this.render();
	}

	get name(): string {
		return this.getAttribute('name') ?? '';
	}

	set name(value: string) {
		this.setAttribute('name', value);
	}

	private render(): void {
		const name = this.getAttribute('name');
		const title = this.getAttribute('title');
		const ariaLabel = this.getAttribute('aria-label');

		void loadWcOpenIconMarkup(name, title, ariaLabel).then((markup) => {
			if (
				name !== this.getAttribute('name') ||
				title !== this.getAttribute('title') ||
				ariaLabel !== this.getAttribute('aria-label')
			) {
				return;
			}

			this.shadowRootRef.innerHTML = markup;
		});
	}
}

export const defineOpenIconElement = (tagName = 'open-icon'): void => {
	if (!globalThis.customElements) {
		return;
	}

	if (!globalThis.customElements.get(tagName)) {
		globalThis.customElements.define(tagName, OpenIconElement);
	}
};
