import path from 'node:path';
import { openIconSvgLoaderDefaults } from './openIconSvgLoader.config';
import type { OpenIconSvgLoaderSettings, OpenIconSvgMeta } from './openIconSvgLoader.model';

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

const toArray = <T>(value: T | T[]): T[] => (Array.isArray(value) ? value : [value]);

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

const removeTags = (content: string, tags: string | string[]): string => {
	let output = content;

	toArray(tags).forEach((tag) => {
		output = output.replace(new RegExp(`<${tag}.*?>|<\\/${tag}>`, 'g'), '');
	});

	return output;
};

const removeAttributes = (content: string, attributes: string | string[]): string => {
	let output = content;

	toArray(attributes).forEach((attribute) => {
		output = output.replace(new RegExp(`${attribute}=".*?"`, 'g'), '');
	});

	return output;
};

const toHexSix = (hex: string): string => {
	if (hex.length === 4) {
		return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
	}
	return hex;
};

const hexToRgb = (hex: string): [number, number, number] => {
	const normalized = toHexSix(hex).replace('#', '');
	const red = Number.parseInt(normalized.slice(0, 2), 16);
	const green = Number.parseInt(normalized.slice(2, 4), 16);
	const blue = Number.parseInt(normalized.slice(4, 6), 16);
	return [red, green, blue];
};

const colorDistance = (
	[leftRed, leftGreen, leftBlue]: [number, number, number],
	[rightRed, rightGreen, rightBlue]: [number, number, number]
): number => {
	const red = leftRed - rightRed;
	const green = leftGreen - rightGreen;
	const blue = leftBlue - rightBlue;
	return red * red + green * green + blue * blue;
};

const simplifyColors = (content: string): string =>
	content.replace(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g, (match) => {
		const currentColor = hexToRgb(match);
		const closest = Object.entries(baseColors).reduce(
			(accumulator, [name, hex]) => {
				const distance = colorDistance(currentColor, hexToRgb(hex));
				return distance < accumulator.distance
					? { distance, name }
					: accumulator;
			},
			{ distance: Number.POSITIVE_INFINITY, name: 'black' }
		);
		return closest.name;
	});

const removeUnnecessarySpaces = (content: string): string =>
	content
		.replace(/\s{2,}/g, ' ')
		.replace(/\s*<(\w+)\s+\/>/g, '<$1/>')
		.replace(/\s*<(\w+)\s([^>]*)\s+>/g, '<$1 $2>')
		.replace(/>\s+</g, '><')
		.replace(/\s*(<\/?\w+>)\s*/g, '$1');

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

const getNestedProperty = (value: Record<string, unknown>, propertyPath: string): unknown => {
	return propertyPath
		.split('.')
		.reduce<unknown>((accumulator: unknown, key: string) => {
			if (!accumulator || typeof accumulator !== 'object') {
				return null;
			}

			return (accumulator as Record<string, unknown>)[key] ?? null;
		}, value);
};

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

const toSlugCase = (value: string): string => {
	const slug = value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return slug || 'icon';
};

const toComponentName = (fileName: string): string => {
	const pascal = fileName
		.split('-')
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');
	return /^\d/.test(pascal) ? `_${pascal}` : pascal || 'Icon';
};

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

	if (toArray(normalizedSettings.removeTags).length) {
		output = removeTags(output, normalizedSettings.removeTags);
	}

	if (toArray(normalizedSettings.removeAttributes).length) {
		output = removeAttributes(output, normalizedSettings.removeAttributes);
	}

	return replaceVariables(output, normalizedSettings, meta);
};
