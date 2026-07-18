import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
	DomSanitizer,
	type SafeHtml,
} from '@angular/platform-browser';

/**
 * Fully tree-shakeable inline icon component.
 *
 * Bind `icon` to a raw SVG string you import statically — typically a per-icon
 * export from `open-icon/icons` (e.g. `IconUiSearchM`). Because the icon is a
 * value you import rather than a runtime name, only the icons you actually use
 * are bundled: this component pulls in nothing from `open-icon/runtime` (no
 * catalog metadata, no loader map, no per-icon chunks).
 */
@Component({
	selector: 'open-icon-inline',
	standalone: true,
	template: `
		<span
			[attr.role]="accessibleLabel ? 'img' : null"
			[attr.aria-label]="accessibleLabel"
			[attr.aria-hidden]="accessibleLabel ? null : 'true'"
			[attr.title]="accessibleLabel"
			[innerHTML]="safeIcon"
		></span>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineIconComponent {
	private _title = '';
	private _ariaLabel = '';
	protected safeIcon: SafeHtml | '' = '';
	protected accessibleLabel: string | null = null;

	constructor(private readonly sanitizer: DomSanitizer) {}

	@Input()
	set icon(value: string | null | undefined) {
		this.safeIcon = value ? this.sanitizer.bypassSecurityTrustHtml(value) : '';
	}

	@Input()
	set title(value: string | null | undefined) {
		this._title = value ?? '';
		this.updateLabel();
	}

	@Input('aria-label')
	set ariaLabel(value: string | null | undefined) {
		this._ariaLabel = value ?? '';
		this.updateLabel();
	}

	private updateLabel(): void {
		this.accessibleLabel = this._title.trim() || this._ariaLabel.trim() || null;
	}
}
