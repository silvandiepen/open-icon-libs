#!/usr/bin/env node

import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { transformOpenIconSvg } from './openIconSvgTransformer.js';
import type { OpenIconSvgLoaderSettings } from './openIconSvgLoader.model.js';

const USAGE = `Usage:
  open-icon-transform <input.svg> [--output <file>] [options]
  open-icon-transform <input-directory> --output <output-directory> [options]
  open-icon-transformer <input.svg> [--output <file>] [options]
  open-icon-transformer <input-directory> --output <output-directory> [options]

Examples:
  npx open-icon-transform@latest src/my-icon.svg --output dist/my-icon-transformed.svg
  npx open-icon-transform@latest src/icons --output dist/icons
  npx open-icon-transform@latest src/my-icon.svg --config open-icon-transform.config.json
  npx open-icon-transform@latest src/my-icon.svg --simplify-colors --remove-data '/<!--.*?-->/'
  npx open-icon-transform@latest src/my-icon.svg --default-icon-fill '#123456'
  npx open-icon-transform@latest src/my-icon.svg --settings '{"default":{"iconFill":"#123456"}}'
  npx --package open-icon-transform open-icon-transformer src/my-icon.svg --output dist/my-icon-transformed.svg

Options:
  -o, --output <path>                   Write transformed output to a file or directory
  --config <file>                       Load transform settings from a JSON or JS config file
  --settings <json>                     Inline JSON settings for advanced cases
  --simplify-colors                     Enable hex-to-base-color simplification
  --no-simplify-colors                  Disable color simplification
  --replace-name <value>                Remove a filename prefix/fragment before metadata derivation
  --remove-data <value>                 Remove literal or /regex/ fragments from SVG source
  --remove-tag <tag>                    Remove matching tags from the output
  --remove-attribute <attribute>        Remove matching attributes from the output
  --default-icon-fill <value>           Override default.iconFill
  --default-icon-fill-opacity <value>   Override default.iconFillOpacity
  --default-icon-stroke-width <value>   Override default.iconStrokeWidth
  --default-icon-stroke-linecap <value> Override default.iconStrokeLinecap
  --default-icon-stroke-linejoin <value> Override default.iconStrokeLinejoin`;

interface CliArguments {
	inputPath: string;
	outputPath: string;
	configPath: string;
	inlineSettings: string;
	simplifyColors?: boolean;
	replaceNameValues: string[];
	removeDataValues: string[];
	removeTagValues: string[];
	removeAttributeValues: string[];
	defaultIconFill: string;
	defaultIconFillOpacity: string;
	defaultIconStrokeWidth: string;
	defaultIconStrokeLinecap: string;
	defaultIconStrokeLinejoin: string;
}

type CliSettings = Partial<Omit<OpenIconSvgLoaderSettings, 'default'>> & {
	default?: Partial<OpenIconSvgLoaderSettings['default']>;
};

const ensureTrailingNewline = (value: string): string =>
	value.endsWith('\n') ? value : `${value}\n`;

const toScalarOrArray = (values: string[]): string | string[] | undefined => {
	if (!values.length) {
		return undefined;
	}

	return values.length === 1 ? values[0] : values;
};

const mergeSettings = (
	baseSettings: CliSettings,
	overrideSettings: CliSettings
): CliSettings => ({
	...baseSettings,
	...overrideSettings,
	default: {
		...(baseSettings.default ?? {}),
		...(overrideSettings.default ?? {}),
	},
	configData: {
		...(baseSettings.configData ?? {}),
		...(overrideSettings.configData ?? {}),
	},
});

const parseJsonSettings = (value: string, label: string): CliSettings => {
	try {
		const parsedValue = JSON.parse(value) as unknown;
		if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
			throw new Error(`${label} must resolve to a JSON object`);
		}

		return parsedValue as CliSettings;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to parse ${label}: ${message}`);
	}
};

const loadConfigFile = async (
	configPath: string
): Promise<CliSettings> => {
	const extension = path.extname(configPath).toLowerCase();

	if (extension === '.json') {
		const fileContent = await readFile(configPath, 'utf8');
		return parseJsonSettings(fileContent, `config file ${configPath}`);
	}

	if (extension === '.js' || extension === '.mjs' || extension === '.cjs') {
		const configModule = (await import(pathToFileURL(path.resolve(configPath)).href)) as {
			default?: unknown;
		};
		const exportedValue = (configModule.default ?? configModule) as unknown;
		if (!exportedValue || typeof exportedValue !== 'object' || Array.isArray(exportedValue)) {
			throw new Error(`Config file ${configPath} must export an object`);
		}

		return exportedValue as CliSettings;
	}

	throw new Error(`Unsupported config file extension for ${configPath}`);
};

const resolveCliSettings = async ({
	configPath,
	inlineSettings,
}: Pick<CliArguments, 'configPath' | 'inlineSettings'>): Promise<CliSettings> => {
	const fileSettings = configPath ? await loadConfigFile(configPath) : {};
	const jsonSettings = inlineSettings
		? parseJsonSettings(inlineSettings, 'inline settings')
		: {};

	return mergeSettings(fileSettings, jsonSettings);
};

const resolveFlagSettings = (arguments_: CliArguments): CliSettings => {
	const defaultSettings: CliSettings['default'] = {};

	if (arguments_.defaultIconFill) {
		defaultSettings.iconFill = arguments_.defaultIconFill;
	}

	if (arguments_.defaultIconFillOpacity) {
		defaultSettings.iconFillOpacity = arguments_.defaultIconFillOpacity;
	}

	if (arguments_.defaultIconStrokeWidth) {
		defaultSettings.iconStrokeWidth = arguments_.defaultIconStrokeWidth;
	}

	if (arguments_.defaultIconStrokeLinecap) {
		defaultSettings.iconStrokeLinecap = arguments_.defaultIconStrokeLinecap;
	}

	if (arguments_.defaultIconStrokeLinejoin) {
		defaultSettings.iconStrokeLinejoin = arguments_.defaultIconStrokeLinejoin;
	}

	return {
		...(arguments_.simplifyColors === undefined
			? {}
			: { simplifyColors: arguments_.simplifyColors }),
		...(arguments_.replaceNameValues.length
			? { replaceName: toScalarOrArray(arguments_.replaceNameValues) }
			: {}),
		...(arguments_.removeDataValues.length
			? { removeData: toScalarOrArray(arguments_.removeDataValues) }
			: {}),
		...(arguments_.removeTagValues.length
			? { removeTags: toScalarOrArray(arguments_.removeTagValues) }
			: {}),
		...(arguments_.removeAttributeValues.length
			? { removeAttributes: toScalarOrArray(arguments_.removeAttributeValues) }
			: {}),
		...(Object.keys(defaultSettings).length ? { default: defaultSettings } : {}),
	};
};

const toTransformerSettings = (
	settings: CliSettings
): Partial<OpenIconSvgLoaderSettings> =>
	settings as unknown as Partial<OpenIconSvgLoaderSettings>;

const transformSvgContent = (
	svgContent: string,
	filePath: string,
	settings: CliSettings
): string =>
	ensureTrailingNewline(
		transformOpenIconSvg(svgContent, filePath, toTransformerSettings(settings)).trim()
	);

const transformSvgFile = async (
	inputPath: string,
	outputPath: string,
	settings: CliSettings
): Promise<void> => {
	const sourceSvg = await readFile(inputPath, 'utf8');
	const transformedSvg = transformSvgContent(sourceSvg, inputPath, settings);

	await mkdir(path.dirname(outputPath), { recursive: true });
	await writeFile(outputPath, transformedSvg, 'utf8');
};

const collectSvgFiles = async (directoryPath: string): Promise<string[]> => {
	const entries = await readdir(directoryPath, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const fullPath = path.join(directoryPath, entry.name);

			if (entry.isDirectory()) {
				return collectSvgFiles(fullPath);
			}

			return entry.isFile() && entry.name.toLowerCase().endsWith('.svg') ? [fullPath] : [];
		})
	);

	return files.flat();
};

const parseArguments = (rawArguments: string[]): CliArguments | null => {
	let inputPath = '';
	let outputPath = '';
	let configPath = '';
	let inlineSettings = '';
	let simplifyColors: boolean | undefined;
	const replaceNameValues: string[] = [];
	const removeDataValues: string[] = [];
	const removeTagValues: string[] = [];
	const removeAttributeValues: string[] = [];
	let defaultIconFill = '';
	let defaultIconFillOpacity = '';
	let defaultIconStrokeWidth = '';
	let defaultIconStrokeLinecap = '';
	let defaultIconStrokeLinejoin = '';

	for (let index = 0; index < rawArguments.length; index += 1) {
		const argument = rawArguments[index];

		if (argument === '--help' || argument === '-h') {
			return null;
		}

		if (argument === '--output' || argument === '-o') {
			outputPath = rawArguments[index + 1] ?? '';
			index += 1;
			continue;
		}

		if (argument === '--config') {
			configPath = rawArguments[index + 1] ?? '';
			index += 1;
			continue;
		}

		if (argument === '--settings') {
			inlineSettings = rawArguments[index + 1] ?? '';
			index += 1;
			continue;
		}

		if (argument === '--simplify-colors') {
			simplifyColors = true;
			continue;
		}

		if (argument === '--no-simplify-colors') {
			simplifyColors = false;
			continue;
		}

		if (argument === '--replace-name') {
			replaceNameValues.push(rawArguments[index + 1] ?? '');
			index += 1;
			continue;
		}

		if (argument === '--remove-data') {
			removeDataValues.push(rawArguments[index + 1] ?? '');
			index += 1;
			continue;
		}

		if (argument === '--remove-tag') {
			removeTagValues.push(rawArguments[index + 1] ?? '');
			index += 1;
			continue;
		}

		if (argument === '--remove-attribute') {
			removeAttributeValues.push(rawArguments[index + 1] ?? '');
			index += 1;
			continue;
		}

		if (argument === '--default-icon-fill') {
			defaultIconFill = rawArguments[index + 1] ?? '';
			index += 1;
			continue;
		}

		if (argument === '--default-icon-fill-opacity') {
			defaultIconFillOpacity = rawArguments[index + 1] ?? '';
			index += 1;
			continue;
		}

		if (argument === '--default-icon-stroke-width') {
			defaultIconStrokeWidth = rawArguments[index + 1] ?? '';
			index += 1;
			continue;
		}

		if (argument === '--default-icon-stroke-linecap') {
			defaultIconStrokeLinecap = rawArguments[index + 1] ?? '';
			index += 1;
			continue;
		}

		if (argument === '--default-icon-stroke-linejoin') {
			defaultIconStrokeLinejoin = rawArguments[index + 1] ?? '';
			index += 1;
			continue;
		}

		if (argument.startsWith('-')) {
			throw new Error(`Unknown argument: ${argument}`);
		}

		if (!inputPath) {
			inputPath = argument;
			continue;
		}

		throw new Error(`Unexpected positional argument: ${argument}`);
	}

	if (!inputPath) {
		return null;
	}

	if ((rawArguments.includes('--output') || rawArguments.includes('-o')) && !outputPath) {
		throw new Error('Missing value for --output');
	}

	if (rawArguments.includes('--config') && !configPath) {
		throw new Error('Missing value for --config');
	}

	if (rawArguments.includes('--settings') && !inlineSettings) {
		throw new Error('Missing value for --settings');
	}

	if (replaceNameValues.includes('')) {
		throw new Error('Missing value for --replace-name');
	}

	if (removeDataValues.includes('')) {
		throw new Error('Missing value for --remove-data');
	}

	if (removeTagValues.includes('')) {
		throw new Error('Missing value for --remove-tag');
	}

	if (removeAttributeValues.includes('')) {
		throw new Error('Missing value for --remove-attribute');
	}

	if (rawArguments.includes('--default-icon-fill') && !defaultIconFill) {
		throw new Error('Missing value for --default-icon-fill');
	}

	if (rawArguments.includes('--default-icon-fill-opacity') && !defaultIconFillOpacity) {
		throw new Error('Missing value for --default-icon-fill-opacity');
	}

	if (rawArguments.includes('--default-icon-stroke-width') && !defaultIconStrokeWidth) {
		throw new Error('Missing value for --default-icon-stroke-width');
	}

	if (rawArguments.includes('--default-icon-stroke-linecap') && !defaultIconStrokeLinecap) {
		throw new Error('Missing value for --default-icon-stroke-linecap');
	}

	if (rawArguments.includes('--default-icon-stroke-linejoin') && !defaultIconStrokeLinejoin) {
		throw new Error('Missing value for --default-icon-stroke-linejoin');
	}

	return {
		inputPath,
		outputPath,
		configPath,
		inlineSettings,
		simplifyColors,
		replaceNameValues,
		removeDataValues,
		removeTagValues,
		removeAttributeValues,
		defaultIconFill,
		defaultIconFillOpacity,
		defaultIconStrokeWidth,
		defaultIconStrokeLinecap,
		defaultIconStrokeLinejoin,
	};
};

const run = async (): Promise<void> => {
	const parsedArguments = parseArguments(process.argv.slice(2));

	if (!parsedArguments) {
		process.stdout.write(`${USAGE}\n`);
		process.exitCode = 1;
		return;
	}

	const transformSettings = mergeSettings(
		await resolveCliSettings(parsedArguments),
		resolveFlagSettings(parsedArguments)
	);
	const inputStats = await stat(parsedArguments.inputPath);

	if (inputStats.isDirectory()) {
		if (!parsedArguments.outputPath) {
			throw new Error('Directory input requires --output <directory>');
		}

		const svgFiles = await collectSvgFiles(parsedArguments.inputPath);

		await Promise.all(
			svgFiles.map(async (inputFilePath) => {
				const relativePath = path.relative(parsedArguments.inputPath, inputFilePath);
				const outputFilePath = path.join(parsedArguments.outputPath, relativePath);
				await transformSvgFile(inputFilePath, outputFilePath, transformSettings);
			})
		);
		return;
	}

	if (!parsedArguments.outputPath) {
		const sourceSvg = await readFile(parsedArguments.inputPath, 'utf8');
		process.stdout.write(
			transformSvgContent(sourceSvg, parsedArguments.inputPath, transformSettings)
		);
		return;
	}

	await transformSvgFile(
		parsedArguments.inputPath,
		parsedArguments.outputPath,
		transformSettings
	);
};

run().catch((error) => {
	const message = error instanceof Error ? error.message : String(error);
	process.stderr.write(`${message}\n\n${USAGE}\n`);
	process.exit(1);
});
