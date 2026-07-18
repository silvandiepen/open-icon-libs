import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import '@angular/compiler';
import {
	provideServerRendering,
	renderApplication,
} from '@angular/platform-server';
import { bootstrapApplication } from '@angular/platform-browser';
import {
	Component,
	provideZonelessChangeDetection,
} from '@angular/core';

import {
	Icons,
	IconComponent,
	getAngularOpenIconLabel,
	loadAngularOpenIconMarkup,
	resolveAngularOpenIconName,
} from '../dist/index.js';
import {
	StaticIconComponent,
	getStaticAngularOpenIconMarkup,
} from '../dist/static.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const renderAngularApplication = (rootComponent, selector) =>
	renderApplication(
		(context) =>
			bootstrapApplication(
				rootComponent,
				{
					providers: [
						provideServerRendering(),
						provideZonelessChangeDetection(),
					],
				},
				context
			),
		{
			document: `<${selector}></${selector}>`,
		}
	);

test('resolveAngularOpenIconName resolves root icon keys and names', () => {
	assert.equal(resolveAngularOpenIconName('UI_SEARCH_M'), 'ui/search-m');
	assert.equal(resolveAngularOpenIconName(Icons.UI_SEARCH_M), 'ui/search-m');
});

test('loadAngularOpenIconMarkup returns inline svg strings', async () => {
	const svg = await loadAngularOpenIconMarkup(Icons.UI_SEARCH_M);

	assert.match(svg, /^<svg\b/i);
});

test('getAngularOpenIconLabel prefers title over aria label', () => {
	assert.equal(getAngularOpenIconLabel('Check in', 'Ignored'), 'Check in');
	assert.equal(getAngularOpenIconLabel('', 'Search'), 'Search');
});

test('root export exposes the Angular component class', () => {
	assert.equal(typeof IconComponent, 'function');
});

test('static entry exposes synchronous Angular icon markup', () => {
	const svg = getStaticAngularOpenIconMarkup(Icons.UI_SEARCH_M);

	assert.match(svg, /^<svg\b/i);
	assert.equal(typeof StaticIconComponent, 'function');
});

test('IconComponent renders its SSR shell and accessibility attributes', async () => {
	class TestAppComponent {
		constructor() {
			this.Icons = Icons;
		}
	}
	Component({
		selector: 'test-app',
		standalone: true,
		imports: [IconComponent],
		template: `<open-icon [name]="Icons.UI_SEARCH_M" title="Search"></open-icon>`,
	})(TestAppComponent);

	const html = await renderAngularApplication(TestAppComponent, 'test-app');

	assert.match(html, /<open-icon\b/i);
	assert.match(html, /role="img"/);
	assert.match(html, /aria-label="Search"/);
});

test('IconComponent honours an aria-label input when no title is set', async () => {
	class TestAriaAppComponent {
		constructor() {
			this.Icons = Icons;
		}
	}
	Component({
		selector: 'test-aria-app',
		standalone: true,
		imports: [IconComponent],
		template: `<open-icon [name]="Icons.UI_SEARCH_M" aria-label="Find"></open-icon>`,
	})(TestAriaAppComponent);

	const html = await renderAngularApplication(TestAriaAppComponent, 'test-aria-app');

	assert.match(html, /role="img"/);
	assert.match(html, /aria-label="Find"/);
});

test('StaticIconComponent renders inside a real Angular SSR app', async () => {
	class TestStaticAppComponent {
		constructor() {
			this.Icons = Icons;
		}
	}
	Component({
		selector: 'test-static-app',
		standalone: true,
		imports: [StaticIconComponent],
		template: `<open-icon-static [name]="Icons.UI_SEARCH_M" title="Search"></open-icon-static>`,
	})(TestStaticAppComponent);

	const html = await renderAngularApplication(TestStaticAppComponent, 'test-static-app');

	assert.match(html, /<svg\b/i);
	assert.match(html, /aria-label="Search"/);
});

test('built entrypoints keep runtime and static icon loading separate', async () => {
	const runtimeSource = await readFile(path.join(__dirname, '../dist/index.js'), 'utf8');
	const staticSource = await readFile(path.join(__dirname, '../dist/static.js'), 'utf8');

	assert.match(runtimeSource, /open-icon\/runtime/);
	assert.doesNotMatch(runtimeSource, /open-icon\/static/);
	assert.match(staticSource, /open-icon\/static/);
});

test('InlineIconComponent renders a statically-imported glyph via SSR', async () => {
	const { InlineIconComponent } = await import('../dist/index.js');
	const glyph = '<svg viewBox="0 0 10 10"><path d="M1 2"></path></svg>';

	class TestInlineAppComponent {
		constructor() {
			this.glyph = glyph;
		}
	}
	Component({
		selector: 'test-inline-app',
		standalone: true,
		imports: [InlineIconComponent],
		template: `<open-icon-inline [icon]="glyph" title="Search"></open-icon-inline>`,
	})(TestInlineAppComponent);

	const html = await renderAngularApplication(TestInlineAppComponent, 'test-inline-app');

	assert.match(html, /<svg\b/i);
	assert.match(html, /role="img"/);
	assert.match(html, /aria-label="Search"/);
});

test('the inline component does not import the runtime or static catalog', async () => {
	const inlineSource = await readFile(path.join(__dirname, '../dist/inline-icon.component.js'), 'utf8');
	assert.doesNotMatch(inlineSource, /from ['"]open-icon\/runtime/);
	assert.doesNotMatch(inlineSource, /from ['"]open-icon\/static/);
});
