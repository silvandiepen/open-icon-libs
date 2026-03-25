import path from 'node:path';
import { openIconSvgLoaderDefaults } from './openIconSvgLoader.config.js';
import type { OpenIconSvgLoaderSettings, OpenIconSvgMeta } from './openIconSvgLoader.model.js';

const baseColors: Record<string, string> = {
	red: '#ff0000',
	blue: '#0000ff',
	green: '#00ff00',
	yellow: '#ffff00',
	cyan: '#00ffff',
	magenta: '#ff00ff',
	black: '#000000',
	white: '#ffffff',
	gray: '#808080',
	orange: '#ffa500',
	pink: '#ffc0cb',
	purple: '#800080',
	brown: '#a52a2a',
	lime: '#00ff00',
	navy: '#000080',
	olive: '#808000',
	teal: '#008080',
	maroon: '#800000',
	silver: '#c0c0c0',
	gold: '#ffd700',
};

/** Converts scalar/array values to array form. */
const toArray = <T>(value: T | T[]): T[] => (Array.isArray(value) ? value : [value]);

/** Trims leading/trailing blank lines from serialized SVG content. */
const trimLines = (content: string): string => {
	const lines = content.split('\n');

	while (lines.length > 0 && lines[0].trim() === '') {
		lines.shift();
	}

	while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
		lines.pop();
	}

	return lines.join('\n');
};

/** Returns true when a remove-data pattern should be interpreted as regex. */
const isRegex = (value: string): boolean => {
	try {
		const regexString =
			value.startsWith('/') && value.endsWith('/') ? value.slice(1, -1) : value;
		void new RegExp(regexString);
		return true;
	} catch {
		return false;
	}
};

/** Removes configured literal/regex fragments from SVG content. */
const removeData = (content: string, patterns: string | string[]): string => {
	let output = content;

	toArray(patterns).forEach((pattern) => {
		if (isRegex(pattern)) {
			const regexString =
				pattern.startsWith('/') && pattern.endsWith('/')
					? pattern.slice(1, -1)
					: pattern;
			output = output.replace(new RegExp(regexString, 'g'), '');
			return;
		}

		const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		output = output.replace(new RegExp(escaped, 'g'), '');
	});

	return trimLines(output);
};

/** Applies configured literal replacement rules in sequence. */
const replaceData = (
	content: string,
	replacements: OpenIconSvgLoaderSettings['replaceData']
): string => {
	let output = content;

	replacements.forEach(([search, replacement]) => {
		if (!search || !replacement) {
			return;
		}

		toArray(search)
			.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
			.forEach((value) => {
				output = output.replace(new RegExp(value, 'g'), replacement);
			});
	});

	return trimLines(output);
};

/** Rewrites secondary stroke width variables to use dedicated secondary width hooks with primary fallback. */
const applySecondaryStrokeWidthVariables = (content: string): string =>
	content.replace(/style="([^"]*var\(--icon-stroke-color-secondary[^"]*)"/g, (_, styleValue: string) => {
		const nextStyleValue = styleValue.replace(
			/stroke-width:var\(--icon-stroke-width-(xs|s|m|l|xl),\s*([^;]+)\);/g,
			(_: string, size: string, fallback: string) =>
				`stroke-width:var(--icon-stroke-width-secondary-${size}, var(--icon-stroke-width-${size}, ${fallback}));`
		);

		return `style="${nextStyleValue}"`;
	});

/** Removes matching tags from SVG source. */
const removeTags = (content: string, tags: string | string[]): string => {
	let output = content;

	toArray(tags).forEach((tag) => {
		output = output.replace(new RegExp(`<${tag}.*?>|<\\/${tag}>`, 'g'), '');
	});

	return output;
};

/** Removes matching attributes from SVG source. */
const removeAttributes = (content: string, attributes: string | string[]): string => {
	let output = content;

	toArray(attributes).forEach((attribute) => {
		output = output.replace(new RegExp(`${attribute}=".*?"`, 'g'), '');
	});

	return output;
};

/** Expands shorthand hex values to 6-digit form. */
const toHexSix = (hex: string): string => {
	if (hex.length === 4) {
		return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
	}
	return hex;
};

/** Converts a hex color string to RGB tuple. */
const hexToRgb = (hex: string): [number, number, number] => {
	const normalized = toHexSix(hex).replace('#', '');
	const red = Number.parseInt(normalized.slice(0, 2), 16);
	const green = Number.parseInt(normalized.slice(2, 4), 16);
	const blue = Number.parseInt(normalized.slice(4, 6), 16);
	return [red, green, blue];
};

/** Computes squared Euclidean distance in RGB space. */
const colorDistance = (
	[leftRed, leftGreen, leftBlue]: [number, number, number],
	[rightRed, rightGreen, rightBlue]: [number, number, number]
): number => {
	const red = leftRed - rightRed;
	const green = leftGreen - rightGreen;
	const blue = leftBlue - rightBlue;
	return red * red + green * green + blue * blue;
};

/** Converts all hex colors in source to nearest named base color. */
const simplifyColors = (content: string): string =>
	content.replace(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g, (match) => {
		const currentColor = hexToRgb(match);
		const closest = Object.entries(baseColors).reduce(
			(accumulator, [name, hex]) => {
				const distance = colorDistance(currentColor, hexToRgb(hex));
				return distance < accumulator.distance ? { distance, name } : accumulator;
			},
			{ distance: Number.POSITIVE_INFINITY, name: 'black' }
		);
		return closest.name;
	});

/** Normalizes excess whitespace generated during transformations. */
const removeUnnecessarySpaces = (content: string): string =>
	content
		.replace(/\s{2,}/g, ' ')
		.replace(/\s*<(\w+)\s+\/>/g, '<$1/>')
		.replace(/\s*<(\w+)\s([^>]*)\s+>/g, '<$1 $2>')
		.replace(/>\s+</g, '><')
		.replace(/\s*(<\/?\w+>)\s*/g, '$1');

/**
 * Moves opacity from `<g style="opacity: ...">` onto child elements.
 * Keeps semantic output while avoiding nested group opacity reliance.
 */
const ungroupElements = (content: string): string => {
	const regex =
		/<g([^>]*)style=["'][^"']*opacity\s*:\s*([^;"']+)[^"']*["']([^>]*)>([\s\S]*?)<\/g>/g;

	return removeUnnecessarySpaces(
		content.replace(regex, (_, beforeStyle, opacityValue, afterStyle, children) => {
			const childRegex = /<([^\/>\s]+)([^>]*)\/?>/g;
			const updatedChildren = children.replace(
				childRegex,
				(_: string, tagName: string, rest: string) => {
					let attributes = rest.trim();
					const selfClosing = attributes.endsWith('/');

					if (selfClosing) {
						attributes = attributes.slice(0, -1).trim();
					}

					if (/style=["']([^"']*)["']/.test(attributes)) {
						attributes = attributes.replace(/style=["']([^"']*)["']/, (_, style) => {
							return `style="${String(style).trim()} opacity: ${opacityValue};"`;
						});
					} else {
						attributes = `${attributes} style="opacity: ${opacityValue};"`.trim();
					}

					if (selfClosing) {
						return `<${tagName} ${attributes} />`;
					}

					return `<${tagName} ${attributes}></${tagName}>`;
				}
			);

			return `<g${beforeStyle}${afterStyle}>${updatedChildren}</g>`;
		})
	);
};

/** Safely resolves dotted-path values from an object graph. */
const getNestedProperty = (value: Record<string, unknown>, propertyPath: string): unknown => {
	return propertyPath.split('.').reduce<unknown>((accumulator: unknown, key: string) => {
		if (!accumulator || typeof accumulator !== 'object') {
			return null;
		}

		return (accumulator as Record<string, unknown>)[key] ?? null;
	}, value);
};

/** Replaces `{{...}}` placeholders in content using settings/meta values. */
const replaceVariables = (
	content: string,
	settings: OpenIconSvgLoaderSettings,
	meta: OpenIconSvgMeta
): string => {
	let output = content;
	const variables = {
		...settings.configData,
		...settings,
		...meta,
	};

	const matches = output.match(/{{(.*?)}}/g);
	if (!matches) {
		return trimLines(output);
	}

	matches.forEach((match) => {
		const variablePath = match.replace('{{', '').replace('}}', '');
		const value = getNestedProperty(variables, variablePath);
		if (value !== null && value !== undefined) {
			output = output.replace(match, String(value));
		}
	});

	return trimLines(output);
};

/** Converts a filename to slug-case. */
const toSlugCase = (value: string): string => {
	const slug = value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return slug || 'icon';
};

/** Converts a slug to PascalCase component-like name. */
const toComponentName = (fileName: string): string => {
	const pascal = fileName
		.split('-')
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');
	return /^\d/.test(pascal) ? `_${pascal}` : pascal || 'Icon';
};

/** Merges user settings with defaults. */
const normalizeSettings = (
	settings?: Partial<OpenIconSvgLoaderSettings>
): OpenIconSvgLoaderSettings => {
	return {
		...openIconSvgLoaderDefaults,
		...settings,
		default: {
			...openIconSvgLoaderDefaults.default,
			...(settings?.default ?? {}),
		},
		configData: {
			...(openIconSvgLoaderDefaults.configData ?? {}),
			...(settings?.configData ?? {}),
		},
	};
};

/** Builds metadata used in variable replacement from file path/settings. */
const buildMeta = (
	filePath: string,
	settings: OpenIconSvgLoaderSettings
): OpenIconSvgMeta => {
	const originalFileName = path.basename(filePath, path.extname(filePath));
	const cleanedFileName = toArray(settings.replaceName).reduce(
		(accumulator, value) => accumulator.split(value).join(''),
		originalFileName
	);
	const fileName = toSlugCase(cleanedFileName);

	return {
		fileName,
		componentName: toComponentName(fileName),
	};
};

/**
 * Applies the full open-icon transformation pipeline to raw SVG content.
 *
 * @param svgContent Raw SVG source.
 * @param filePath File path used to derive icon metadata.
 * @param settings Optional partial settings override.
 * @returns Transformed SVG source.
 */
export const transformOpenIconSvg = (
	svgContent: string,
	filePath: string,
	settings?: Partial<OpenIconSvgLoaderSettings>
): string => {
	const normalizedSettings = normalizeSettings(settings);
	const meta = buildMeta(filePath, normalizedSettings);
	let output = svgContent;

	if (normalizedSettings.simplifyColors) {
		output = simplifyColors(output);
	}

	output = ungroupElements(output);

	if (toArray(normalizedSettings.removeData).length) {
		output = removeData(output, normalizedSettings.removeData);
	}

	if (normalizedSettings.replaceData.length) {
		output = replaceData(output, normalizedSettings.replaceData);
	}

	output = applySecondaryStrokeWidthVariables(output);

	if (toArray(normalizedSettings.removeTags).length) {
		output = removeTags(output, normalizedSettings.removeTags);
	}

	if (toArray(normalizedSettings.removeAttributes).length) {
		output = removeAttributes(output, normalizedSettings.removeAttributes);
	}

	return replaceVariables(output, normalizedSettings, meta);
};
