import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');
const publicDir = path.join(appRoot, 'public');

const NAV_ITEMS = [
	{ label: 'Icons', href: '/icons/index.html', section: 'icons' },
	{ label: 'Packages', href: '/packages/index.html', section: 'packages' },
	{ label: 'API', href: '/api/index.html', section: 'api' },
];

const getHtmlFiles = async (directory) => {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const absolutePath = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				return getHtmlFiles(absolutePath);
			}

			return entry.name.endsWith('.html') ? [absolutePath] : [];
		})
	);

	return files.flat();
};

const getCurrentSection = (relativePath) => {
	const normalizedPath = relativePath.replace(/\\/g, '/');
	if (normalizedPath.startsWith('icons/')) {
		return 'icons';
	}

	if (normalizedPath.startsWith('packages/')) {
		return 'packages';
	}

	if (normalizedPath.startsWith('api/')) {
		return 'api';
	}

	return '';
};

const renderHeaderNavigation = (currentSection) => `
<ul class="navigation__list" id="header-navigation-list">
${NAV_ITEMS.map(
	(item) => `  <li class="navigation__item${item.section === currentSection ? ' navigation__item--current' : ''}">
    <div class="navigation__entry"><a class="navigation__link" href="${item.href}"><span class="navigation__text">${item.label}</span></a>
    </div>
  </li>`
).join('\n')}
</ul>`;

const renderFooterNavigation = (currentSection) => `
<ul class="navigation__footer-list navigation__footer-list--level-0">
${NAV_ITEMS.map(
	(item) => `  <li class="navigation__footer-item${item.section === currentSection ? ' navigation__footer-item--current' : ''}"><a class="navigation__footer-link  navigation__footer-link--heading" href="${item.href}">${item.label}</a>
  </li>`
).join('\n')}
</ul>`;

const patchNavigation = (html, currentSection) =>
	html
		.replace(
			/<ul class="navigation__list" id="header-navigation-list">[\s\S]*?<\/ul>/,
			renderHeaderNavigation(currentSection)
		)
		.replace(
			/<ul class="navigation__footer-list navigation__footer-list--level-0">[\s\S]*?<\/ul>/,
			renderFooterNavigation(currentSection)
		);

export const patchSiteOutput = async () => {
	const htmlFiles = await getHtmlFiles(publicDir);

	await Promise.all(
		htmlFiles.map(async (htmlFile) => {
			const relativePath = path.relative(publicDir, htmlFile);
			const currentSection = getCurrentSection(relativePath);
			const html = await readFile(htmlFile, 'utf8');
			const patchedHtml = patchNavigation(html, currentSection);

			if (patchedHtml !== html) {
				await writeFile(htmlFile, patchedHtml, 'utf8');
			}
		})
	);

	console.log(`[open-icon-org] Patched navigation in ${htmlFiles.length} HTML files.`);
};

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
	patchSiteOutput().catch((error) => {
		console.error('[open-icon-org] Failed to patch built HTML output.');
		console.error(error);
		process.exit(1);
	});
}
