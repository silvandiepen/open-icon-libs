import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOpenIconCatalog } from './openIconCatalog.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../..');
const sourceIconsRoot = path.join(repoRoot, 'icons-src');

const PACKAGE_DETAILS = {
	'open-icon': {
		bestFor: 'The main Open Icon package with catalog helpers, lookup keys, plus runtime and static SVG access.',
		highlights: [
			'Exports the generated icon catalog and `Icons` lookup keys.',
			'Provides `open-icon/runtime` for lazy per-icon loading and `open-icon/static` for synchronous icon access.',
			'Provides tree-shakable exports from `open-icon/icons`.',
			'Depends on `open-icon-svg` for raw asset delivery.',
		],
	},
	'vue-open-icon': {
		bestFor: 'Vue apps that want ready-to-use icon components on top of the shared catalog.',
		highlights: [
			'Exports a lazy `Icon` component for the default client/runtime path.',
			'Exports `StaticIcon` from `vue-open-icon/static` for synchronous SSR and static output.',
			'Re-exports `Icons` and the shared catalog helpers from `open-icon`.',
		],
	},
	'react-open-icon': {
		bestFor: 'React apps that want ready-to-use icon components on top of the shared catalog.',
		highlights: [
			'Exports a lazy `Icon` component for the default client/runtime path.',
			'Exports `StaticIcon` from `react-open-icon/static` for synchronous SSR and static output.',
			'Re-exports `Icons` and the shared catalog helpers from `open-icon`.',
		],
	},
	'ng-open-icon': {
		bestFor: 'Angular apps that want standalone icon components backed by the shared catalog.',
		highlights: [
			'Exports a standalone `IconComponent` for the default client/runtime path.',
			'Exports `StaticIconComponent` from `ng-open-icon/static` for synchronous SSR and static output.',
			'Re-exports `Icons` and the shared catalog helpers from `open-icon`.',
		],
	},
	'wc-open-icon': {
		bestFor: 'Any app that wants a standards-based custom element or CDN-loadable icon package.',
		highlights: [
			'Exports a custom element class and `defineOpenIconElement()` helper for the runtime path.',
			'Exports `renderStaticOpenIconMarkup()` from `wc-open-icon/static` for synchronous server output.',
			'Provides an `auto` entrypoint for direct ESM/CDN loading.',
			'Lets any project render icons with `<open-icon name=\"ui/search-m\"></open-icon>`.',
		],
	},
	'open-icon-svg': {
		bestFor: 'Direct raw SVG file imports without the main catalog helper layer.',
		highlights: [
			'Ships the raw SVG files from the catalog.',
			'Exports package-stable `./icons/*` asset paths.',
			'Pairs well with Vite and any runtime that imports SVG assets directly.',
		],
	},
	'open-icon-transform': {
		bestFor: 'Running the Open Icon SVG pipeline inside scripts, CLIs, or custom tooling.',
		highlights: [
			'Transforms raw SVG strings without depending on Vite.',
			'Exposes replace/remove rules and interpolation settings.',
			'Useful for Node scripts, CI jobs, and custom rendering pipelines.',
		],
	},
	'vite-plugin-open-icon': {
		bestFor: 'Vite apps that want transformed SVG output at import time.',
		highlights: [
			'Runs the transform engine during Vite module loading.',
			'Supports custom loader query names.',
			'Re-exports the shared transform helpers when needed.',
		],
	},
};

const PACKAGE_NAMES = ['open-icon', 'vue-open-icon', 'react-open-icon', 'ng-open-icon', 'wc-open-icon', 'open-icon-svg', 'open-icon-transform', 'vite-plugin-open-icon'];

const toDisplayLabel = (iconName) => {
	const parts = iconName.split('/');
	const baseName = parts.at(-1) ?? iconName;

	return baseName
		.split('-')
		.filter(Boolean)
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join(' ');
};

export const createSiteIconCatalog = (catalog, options = {}) => {
	const {
		mediaBaseUrl = '/media',
		filePathPrefix = 'icons',
		apiBaseUrl = '',
	} = options;

	const categories = catalog.categories.map((category) => ({
		name: category,
		count: catalog.categoryToNames[category].length,
	}));

	const normalizedMediaBaseUrl = mediaBaseUrl.replace(/\/$/, '');
	const normalizedApiBaseUrl = apiBaseUrl.replace(/\/$/, '');

	const entries = catalog.entries.map((entry) => {
		const relativeFilePath = entry.filePath.replace(new RegExp(`^${filePathPrefix}/`), '');
		const rawSvgUrl = `${normalizedMediaBaseUrl}/${entry.filePath}`;
		const apiSvgUrl = normalizedApiBaseUrl
			? `${normalizedApiBaseUrl}/v1/icons/${encodeURIComponent(entry.iconName)}.svg`
			: rawSvgUrl;

		return {
			name: entry.iconName,
			constName: entry.key,
			category: entry.category,
			label: toDisplayLabel(entry.iconName),
			filePath: entry.filePath,
			relativeFilePath,
			url: rawSvgUrl,
			apiUrl: normalizedApiBaseUrl ? `${normalizedApiBaseUrl}/v1/icons/${encodeURIComponent(entry.iconName)}` : '',
			svgUrl: apiSvgUrl,
			pngUrl: normalizedApiBaseUrl
				? `${normalizedApiBaseUrl}/v1/icons/${encodeURIComponent(entry.iconName)}.png`
				: '',
			aliases: entry.aliases,
		};
	});

	return {
		total: entries.length,
		categories,
		entries,
	};
};

export const createPackageCatalog = ({ packages, totalIcons, totalCategories }) => ({
	total: packages.length,
	entries: packages.map((pkg) => {
		const details = PACKAGE_DETAILS[pkg.name];
		const highlights =
			pkg.name === 'open-icon-svg'
				? [`Ships ${totalIcons} icons across ${totalCategories} categories.`, ...details.highlights]
				: details.highlights;

		return {
			name: pkg.name,
			title: pkg.name,
			description: pkg.description,
			version: pkg.version,
			install: `npm install ${pkg.name}`,
			href: `/packages/${pkg.name}/`,
			bestFor: details.bestFor,
			highlights,
		};
	}),
});

const readPackageManifest = async (packageName) => {
	const packagePath = path.join(repoRoot, 'packages', packageName, 'package.json');
	return JSON.parse(await readFile(packagePath, 'utf8'));
};

export const buildOpenIconSiteData = async (options = {}) => {
	const { apiBaseUrl = '' } = options;
	const catalog = await buildOpenIconCatalog({ iconsRoot: sourceIconsRoot });
	const iconCatalog = createSiteIconCatalog(catalog, { apiBaseUrl });
	const packages = await Promise.all(PACKAGE_NAMES.map(readPackageManifest));
	const packageCatalog = createPackageCatalog({
		packages,
		totalIcons: iconCatalog.total,
		totalCategories: iconCatalog.categories.length,
	});

	return {
		icons: iconCatalog,
		packages: packageCatalog,
	};
};
