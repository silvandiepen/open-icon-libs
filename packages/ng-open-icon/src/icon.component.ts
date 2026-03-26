import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
	DomSanitizer,
	type SafeHtml,
} from '@angular/platform-browser';
import {
	getAngularOpenIconLabel,
	loadAngularOpenIconMarkup,
} from './icon.utils.js';
import type { AngularOpenIconName } from './icon.model.js';

@Component({
	selector: 'open-icon',
	standalone: true,
	template: `
		<span
			[attr.role]="accessibleLabel ? 'img' : null"
			[attr.aria-label]="accessibleLabel"
			[attr.aria-hidden]="accessibleLabel ? null : 'true'"
			[attr.title]="accessibleLabel"
			[innerHTML]="svg"
		></span>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
	private _name = '';
	private _title = '';
	private _requestId = 0;
	protected svg: SafeHtml | '' = '';
	protected accessibleLabel: string | null = null;

	constructor(private readonly sanitizer: DomSanitizer) {}

	@Input()
	set name(value: AngularOpenIconName) {
		this._name = typeof value === 'string' ? value : '';
		this.updateState();
	}

	@Input()
	set title(value: string | null | undefined) {
		this._title = value ?? '';
		this.updateState();
	}

	private updateState(): void {
		const requestId = ++this._requestId;
		this.accessibleLabel = getAngularOpenIconLabel(this._title, null);
		void loadAngularOpenIconMarkup(this._name).then((svg) => {
			if (requestId !== this._requestId) {
				return;
			}

			this.svg = svg ? this.sanitizer.bypassSecurityTrustHtml(svg) : '';
		});
	}
}
