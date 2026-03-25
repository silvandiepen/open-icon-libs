const inlineIconMarkupCache = new Map<string, Promise<string>>();

export const normalizeInlineIconMarkup = (svgMarkup: string): string => {
	return svgMarkup
		.replace(/<\?xml[\s\S]*?\?>\s*/gi, '')
		.replace(/<!doctype[\s\S]*?>\s*/gi, '')
		.trim();
};

export const clearInlineIconMarkupCache = (): void => {
	inlineIconMarkupCache.clear();
};

export const loadInlineIconMarkup = async (url: string): Promise<string> => {
	const existingMarkupPromise = inlineIconMarkupCache.get(url);
	if (existingMarkupPromise) {
		return existingMarkupPromise;
	}

	const markupPromise = fetch(url)
		.then(async (response) => {
			if (!response.ok) {
				throw new Error(`Failed to load ${url}: ${response.status}`);
			}

			return normalizeInlineIconMarkup(await response.text());
		})
		.catch((error) => {
			inlineIconMarkupCache.delete(url);
			throw error;
		});

	inlineIconMarkupCache.set(url, markupPromise);
	return markupPromise;
};

export const hydrateInlineIcons = async (root: ParentNode): Promise<void> => {
	const iconTargets = Array.from(root.querySelectorAll<HTMLElement>('[data-inline-icon-url]'));

	await Promise.all(
		iconTargets.map(async (target) => {
			const iconUrl = target.dataset.inlineIconUrl;
			if (!iconUrl) {
				return;
			}

			try {
				const markup = await loadInlineIconMarkup(iconUrl);
				if (!target.isConnected || target.dataset.inlineIconUrl !== iconUrl) {
					return;
				}

				target.innerHTML = markup;
				target.dataset.inlineIconReady = 'true';
			} catch {
				if (!target.isConnected || target.dataset.inlineIconUrl !== iconUrl) {
					return;
				}

				target.dataset.inlineIconReady = 'error';
			}
		})
	);
};
