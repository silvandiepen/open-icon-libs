import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOpenIconCatalog, renderOpenIconCatalogTs } from './openIconCatalog.mjs';
import { generatePackageIcons } from './generate-package-icons.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const iconsRoot = path.resolve(packageRoot, '../../icons-src');
const generatedDir = path.join(packageRoot, 'src', 'generated');
const generatedFile = path.join(generatedDir, 'openIconCatalog.generated.ts');

const main = async () => {
	await generatePackageIcons();

	const catalog = await buildOpenIconCatalog({ iconsRoot });
	const content = renderOpenIconCatalogTs(catalog);

	await fs.mkdir(generatedDir, { recursive: true });
	await fs.writeFile(generatedFile, content, 'utf8');

	console.log(`[open-icon-svg] Generated catalog for ${catalog.entries.length} icons.`);
	console.log(`[open-icon-svg] Categories: ${catalog.categories.length}`);
	console.log(`[open-icon-svg] Output: ${generatedFile}`);
};

main().catch((error) => {
	console.error('[open-icon-svg] Failed to generate icon catalog.');
	console.error(error);
	process.exit(1);
});
