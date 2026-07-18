import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
	Icons,
	getIcon,
	resolveOpenIconName,
	type OpenIconKey,
	type OpenIconName,
} from 'open-icon/static';
import {
	DomSanitizer,
	type SafeHtml,
} from '@angular/platform-browser';
import {
	getAngularOpenIconLabel,
} from './icon.utils.js';
import type { AngularOpenIconName } from './icon.model.js';

/**
 * Resolves an icon name/key/alias to its canonical name for the static build.
 * Defined here (the leaf module) and re-exported from ./static so there is a
 * single implementation shared by the component and the public API.
 */
export const resolveStaticAngularOpenIconName = (
	value: string | null | undefined
): OpenIconName | null => {
	if (typeof value !== 'string') {
		return null;
	}

	const normalized = value.trim();
	if (!normalized) {
		return null;
	}

	const keyMatch = Icons[normalized as OpenIconKey];
	if (keyMatch) {
		return keyMatch;
	}

	return resolveOpenIconName(normalized);
};

export const getStaticAngularOpenIconMarkup = (
	name: string | null | undefined
): string => {
	const iconName = resolveStaticAngularOpenIconName(name);
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
	private _ariaLabel = '';
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

	@Input('aria-label')
	set ariaLabel(value: string | null | undefined) {
		this._ariaLabel = value ?? '';
		this.updateState();
	}

	private updateState(): void {
		this.accessibleLabel = getAngularOpenIconLabel(this._title, this._ariaLabel);
		const svg = getStaticAngularOpenIconMarkup(this._name);
		this.svg = svg ? this.sanitizer.bypassSecurityTrustHtml(svg) : '';
	}
}
