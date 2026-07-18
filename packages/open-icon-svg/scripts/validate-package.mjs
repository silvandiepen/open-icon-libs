import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { walkSvgFiles } from './openIconCatalog.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const iconsRoot = path.join(packageRoot, 'icons');

// Icon generation is handled by the `generate` step (generate-open-icon-catalog.mjs).
// This script only verifies the generated asset tree is non-empty, reusing the
// shared walkSvgFiles helper instead of a local copy.
const files = await walkSvgFiles(iconsRoot);
if (files.length === 0) {
	throw new Error(`No SVG assets found in ${iconsRoot}`);
}

console.log(`[open-icon-svg] Verified ${files.length} SVG assets`);
