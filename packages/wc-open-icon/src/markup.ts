/**
 * Shared markup helpers for the web-component wrappers.
 *
 * Both the runtime element and the CDN element render into a shadow root, so
 * their sizing `<style>` is encapsulated and can size the `<svg>` via a plain
 * `svg { … }` rule. The static (SSR / light-DOM) renderer has no shadow root,
 * so it sizes the `<svg>` inline instead of emitting a global `<style>` that
 * would leak onto the whole page. Keeping all three paths here removes the
 * previously triplicated `escapeAttribute` / accessibility-attribute logic and
 * guarantees the runtime and static output stay visually consistent.
 */

export const escapeAttribute = (value: string): string =>
	value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

export const buildAccessibilityAttributes = (
	title: string | null | undefined,
	ariaLabel?: string | null | undefined
): string => {
	const accessibleLabel = title?.trim() || ariaLabel?.trim() || '';
	return accessibleLabel
		? ` role="img" aria-label="${escapeAttribute(accessibleLabel)}" title="${escapeAttribute(accessibleLabel)}"`
		: ' aria-hidden="true"';
};

const SHADOW_SIZING_STYLE =
	'<style>:host{display:inline-flex;line-height:0;vertical-align:middle}svg{display:block;width:1em;height:1em}</style>';

/** Markup for shadow-DOM elements (runtime + CDN). */
export const renderShadowOpenIconMarkup = (
	svg: string,
	title: string | null | undefined,
	ariaLabel?: string | null | undefined
): string =>
	`${SHADOW_SIZING_STYLE}<span part="icon"${buildAccessibilityAttributes(title, ariaLabel)}>${svg}</span>`;

/** Adds width/height to a root `<svg>` that only carries a viewBox. */
const sizeSvgInline = (svg: string): string =>
	/<svg\b[^>]*\s(?:width|height)=/i.test(svg)
		? svg
		: svg.replace(/<svg\b/i, '<svg width="1em" height="1em"');

/**
 * Markup for light-DOM / SSR output. Mirrors the shadow-DOM element's rendered
 * size (1em) without a global stylesheet by sizing the svg inline, and keeps
 * the same `part="icon"` hook and accessibility attributes.
 */
export const renderLightOpenIconMarkup = (
	svg: string,
	title: string | null | undefined,
	ariaLabel?: string | null | undefined
): string =>
	`<span part="icon" style="display:inline-flex;line-height:0;vertical-align:middle"${buildAccessibilityAttributes(
		title,
		ariaLabel
	)}>${sizeSvgInline(svg)}</span>`;
