import { readFile } from 'node:fs/promises';
import type { Plugin } from 'vite';
import { openIconSvgLoaderDefaults } from './openIconSvgLoader.config';
import type { OpenIconSvgLoaderSettings } from './openIconSvgLoader.model';
import { transformOpenIconSvg } from './openIconSvgTransformer';

const parseId = (id: string): { filePath: string; searchParams: URLSearchParams } => {
	const [filePath, queryString = ''] = id.split('?', 2);
	return {
		filePath,
		searchParams: new URLSearchParams(queryString),
	};
};

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

export const openIconSvgLoaderPlugin = (
	settings: Partial<OpenIconSvgLoaderSettings> = {}
): Plugin => {
	const normalizedSettings = normalizeSettings(settings);

	return {
		name: 'open-icon-svg-loader',
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
