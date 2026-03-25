import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatePackageIcons } from './generate-package-icons.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const iconsRoot = path.join(packageRoot, 'icons');

const walkSvgFiles = async (directory, result = []) => {
	const entries = await fs.readdir(directory, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.name.startsWith('.')) {
			continue;
		}

		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			await walkSvgFiles(fullPath, result);
			continue;
		}

		if (entry.isFile() && entry.name.toLowerCase().endsWith('.svg')) {
			result.push(fullPath);
		}
	}

	return result;
};

await generatePackageIcons();

const files = await walkSvgFiles(iconsRoot);
if (files.length === 0) {
	throw new Error(`No SVG assets found in ${iconsRoot}`);
}

console.log(`[open-icon-svg] Verified ${files.length} SVG assets`);
