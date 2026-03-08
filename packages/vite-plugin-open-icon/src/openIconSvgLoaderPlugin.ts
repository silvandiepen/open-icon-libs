import { readFile } from 'node:fs/promises';
import type { Plugin } from 'vite';
import {
	openIconSvgLoaderDefaults,
	transformOpenIconSvg,
	type OpenIconSvgLoaderSettings,
} from 'open-icon-transform';

/** Parses Vite module id into file path and URL query params. */
const parseId = (id: string): { filePath: string; searchParams: URLSearchParams } => {
	const [filePath, queryString = ''] = id.split('?', 2);
	return {
		filePath,
		searchParams: new URLSearchParams(queryString),
	};
};

/** Merges user settings with shared open-icon defaults. */
const normalizeSettings = (
	settings: Partial<OpenIconSvgLoaderSettings>
): OpenIconSvgLoaderSettings => {
	return {
		...openIconSvgLoaderDefaults,
		...settings,
		default: {
			...openIconSvgLoaderDefaults.default,
			...(settings.default ?? {}),
		},
		configData: {
			...(openIconSvgLoaderDefaults.configData ?? {}),
			...(settings.configData ?? {}),
		},
	};
};

/**
 * Vite plugin that transforms `.svg` modules when the configured query is present.
 *
 * Default query: `?open-icon`
 */
export const openIconSvgLoaderPlugin = (
	settings: Partial<OpenIconSvgLoaderSettings> = {}
): Plugin => {
	const normalizedSettings = normalizeSettings(settings);

	return {
		name: 'vite-plugin-open-icon',
		enforce: 'pre',
		async load(id) {
			const { filePath, searchParams } = parseId(id);

			if (!filePath.endsWith('.svg')) {
				return null;
			}

			if (!searchParams.has(normalizedSettings.query)) {
				return null;
			}

			const svgContent = await readFile(decodeURI(filePath), 'utf-8');
			const transformedSvg = transformOpenIconSvg(
				svgContent,
				filePath,
				normalizedSettings
			);

			return `export default ${JSON.stringify(transformedSvg)};`;
		},
	};
};
