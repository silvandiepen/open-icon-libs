import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
	Icons,
	getIcon,
	resolveOpenIconName,
	type OpenIconKey,
} from 'open-icon/static';
import {
	DomSanitizer,
	type SafeHtml,
} from '@angular/platform-browser';
import {
	getAngularOpenIconLabel,
} from './icon.utils.js';
import type { AngularOpenIconName } from './icon.model.js';

const getStaticAngularOpenIconMarkup = (
	name: string | null | undefined
): string => {
	if (typeof name !== 'string') {
		return '';
	}

	const normalized = name.trim();
	if (!normalized) {
		return '';
	}

	const keyMatch = Icons[normalized as OpenIconKey];
	const iconName = keyMatch ?? resolveOpenIconName(normalized);
	if (!iconName) {
		return '';
	}

	return getIcon(iconName) ?? '';
};

@Component({
	selector: 'open-icon-static',
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
export class StaticIconComponent {
	private _name = '';
	private _title = '';
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
		this.accessibleLabel = getAngularOpenIconLabel(this._title, null);
		const svg = getStaticAngularOpenIconMarkup(this._name);
		this.svg = svg ? this.sanitizer.bypassSecurityTrustHtml(svg) : '';
	}
}
