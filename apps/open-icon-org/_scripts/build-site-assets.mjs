import { execFile } from 'node:child_process';
import { cp, mkdir, readFile, readdir, rm, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { generatePackageIcons } from '../../../packages/open-icon-svg/scripts/generate-package-icons.mjs';
import { buildOpenIconSiteData } from '../../../packages/open-icon-svg/scripts/openIconSiteData.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appRoot, '../..');
const transformModulePath = path.join(repoRoot, 'packages', 'open-icon-transform', 'dist', 'index.js');
const execFileAsync = promisify(execFile);

const iconsRoot = path.join(repoRoot, 'packages', 'open-icon-svg', 'icons');
const generatedAssetsDir = path.join(appRoot, 'assets', 'generated');
const generatedIconsFile = path.join(generatedAssetsDir, 'icons.json');
const generatedPackagesFile = path.join(generatedAssetsDir, 'packages.json');
const appMediaRootDir = path.join(appRoot, 'media');
const appMediaIconsDir = path.join(appRoot, 'media', 'icons');
const logoSourceFile = path.join(appRoot, 'assets', 'logo.svg');
const logoOutputFile = path.join(appMediaRootDir, 'logo.svg');
const iconDocsDir = path.join(appRoot, 'icons');

const ensureTransformModule = async () => {
	try {
		await access(transformModulePath);
	} catch {
		await execFileAsync('npm', ['--workspace', 'open-icon-transform', 'run', 'build'], {
			cwd: repoRoot,
		});
	}

	return import(pathToFileURL(transformModulePath).href);
};

const clearGeneratedIconPages = async () => {
	const entries = await readdir(iconDocsDir, { withFileTypes: true });
	await Promise.all(
		entries
			.filter((entry) => entry.isDirectory())
			.map((entry) => rm(path.join(iconDocsDir, entry.name), { recursive: true, force: true }))
	);
};

export const transformSiteLogoSvg = async (svgContent) => {
	const { transformOpenIconSvg } = await ensureTransformModule();

	return `${transformOpenIconSvg(svgContent, logoSourceFile).trim()}\n`;
};

export const buildSiteAssets = async () => {
	const apiBaseUrl = process.env.OPEN_ICON_API_BASE_URL ?? '';
	await generatePackageIcons();
	const data = await buildOpenIconSiteData({ apiBaseUrl });
	const iconCatalog = data.icons;
	const packageCatalog = data.packages;

	await mkdir(generatedAssetsDir, { recursive: true });
	await writeFile(generatedIconsFile, `${JSON.stringify(iconCatalog, null, 2)}\n`, 'utf8');
	await writeFile(generatedPackagesFile, `${JSON.stringify(packageCatalog, null, 2)}\n`, 'utf8');
	await clearGeneratedIconPages();

	await rm(appMediaIconsDir, { recursive: true, force: true });
	await mkdir(appMediaRootDir, { recursive: true });
	await cp(iconsRoot, appMediaIconsDir, { recursive: true });
	await writeFile(
		logoOutputFile,
		await transformSiteLogoSvg(await readFile(logoSourceFile, 'utf8')),
		'utf8'
	);

	console.log(`[open-icon-org] Wrote ${generatedIconsFile}`);
	console.log(`[open-icon-org] Wrote ${generatedPackagesFile}`);
	console.log(`[open-icon-org] Cleared generated icon detail pages under ${iconDocsDir}`);
	if (apiBaseUrl) {
		console.log(`[open-icon-org] Using API URLs from ${apiBaseUrl}`);
	}
	console.log(`[open-icon-org] Copied icons to ${appMediaIconsDir}`);
	console.log(`[open-icon-org] Wrote transformed logo to ${logoOutputFile}`);
};

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
	buildSiteAssets().catch((error) => {
		console.error('[open-icon-org] Failed to build generated assets.');
		console.error(error);
		process.exit(1);
	});
}
