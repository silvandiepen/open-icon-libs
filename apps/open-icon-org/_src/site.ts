import {
	applyIconRenderSettingsToDocument,
	readStoredIconRenderSettings,
} from './lib/icon-render-settings.js';
import './components/open-icon-gallery/index.js';
import './components/open-icon-icon-detail/index.js';
import './components/open-icon-package-grid/index.js';
import './components/open-icon-render-controls/index.js';
import './components/open-icon-site-stats/index.js';

const ensureGlobalRenderControls = (): void => {
	applyIconRenderSettingsToDocument(readStoredIconRenderSettings());

	if (document.body.querySelector('open-icon-render-controls')) {
		return;
	}

	document.body.append(document.createElement('open-icon-render-controls'));
};

if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', ensureGlobalRenderControls, { once: true });
	} else {
		ensureGlobalRenderControls();
	}
}
