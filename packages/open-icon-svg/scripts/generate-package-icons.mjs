import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformOpenIconSvg } from '../../open-icon-transform/dist/index.js';
import { walkSvgFiles } from './openIconCatalog.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const sourceIconsRoot = path.resolve(packageRoot, '../../icons-src');
const packageIconsRoot = path.join(packageRoot, 'icons');

export const generatePackageIcons = async () => {
	const sourceFiles = await walkSvgFiles(sourceIconsRoot);

	await fs.rm(packageIconsRoot, { recursive: true, force: true });
	await fs.mkdir(packageIconsRoot, { recursive: true });

	await Promise.all(
		sourceFiles.map(async (sourceFile) => {
			const relativePath = path.relative(sourceIconsRoot, sourceFile);
			const outputFile = path.join(packageIconsRoot, relativePath);
			const svg = await fs.readFile(sourceFile, 'utf8');
			const transformedSvg = transformOpenIconSvg(svg, outputFile).trim();

			await fs.mkdir(path.dirname(outputFile), { recursive: true });
			await fs.writeFile(outputFile, `${transformedSvg}\n`, 'utf8');
		})
	);

	console.log(`[open-icon-svg] Generated ${sourceFiles.length} transformed package icons in ${packageIconsRoot}`);
};

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
	generatePackageIcons().catch((error) => {
		console.error('[open-icon-svg] Failed to generate transformed package icons.');
		console.error(error);
		process.exit(1);
	});
}
