import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');
const publicDir = path.join(appRoot, 'public');

const LOGO_FALLBACK_PATTERN =
	/<a class="logo logo--title" href="\/"><span class="logo__text">Open Icon<\/span><\/a>/g;

const LOGO_MARKUP =
	'<a class="logo logo--image-only" href="/" aria-label="Open Icon"><img src="/assets/logo.svg" alt="Open Icon"></a>';

const getHtmlFiles = async (rootDir) => {
	const entries = await readdir(rootDir, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const entryPath = path.join(rootDir, entry.name);
			if (entry.isDirectory()) {
				return getHtmlFiles(entryPath);
			}

			return entry.isFile() && entry.name.endsWith('.html') ? [entryPath] : [];
		})
	);

	return files.flat();
};

const patchFile = async (filePath) => {
	const source = await readFile(filePath, 'utf8');
	const next = source.replace(LOGO_FALLBACK_PATTERN, LOGO_MARKUP);
	if (next === source) {
		return false;
	}

	await writeFile(filePath, next, 'utf8');
	return true;
};

export const patchSiteOutput = async () => {
	const htmlFiles = await getHtmlFiles(publicDir);
	const patchedFiles = await Promise.all(htmlFiles.map((filePath) => patchFile(filePath)));
	const patchedCount = patchedFiles.filter(Boolean).length;
	console.log(`[open-icon-org] Patched logo markup in ${patchedCount} generated HTML files`);
};

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
	patchSiteOutput().catch((error) => {
		console.error('[open-icon-org] Failed to patch generated site output.');
		console.error(error);
		process.exit(1);
	});
}
