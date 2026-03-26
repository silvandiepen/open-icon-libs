import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const cliPath = path.join(packageRoot, 'dist', 'cli.js');

test('cli transforms an svg file and writes the output file', () => {
	const fixtureDir = mkdtempSync(path.join(tmpdir(), 'open-icon-transform-cli-'));
	const inputPath = path.join(fixtureDir, 'icon_demo.svg');
	const outputPath = path.join(fixtureDir, 'dist', 'icon_demo.transformed.svg');

	writeFileSync(inputPath, '<svg><path style="fill:#ff0000;" /></svg>\n', 'utf8');

	execFileSync('node', [cliPath, inputPath, '--output', outputPath], {
		cwd: packageRoot,
		stdio: 'pipe',
	});

	const transformedSvg = readFileSync(outputPath, 'utf8');

	assert.match(transformedSvg, /var\(--icon-fill,/);
	assert.match(transformedSvg, /<svg>/);
});

test('cli loads transform settings from a config file', () => {
	const fixtureDir = mkdtempSync(path.join(tmpdir(), 'open-icon-transform-cli-config-'));
	const inputPath = path.join(fixtureDir, 'icon_demo.svg');
	const outputPath = path.join(fixtureDir, 'dist', 'icon_demo.transformed.svg');
	const configPath = path.join(fixtureDir, 'open-icon-transform.config.json');

	writeFileSync(inputPath, '<svg><path style="fill:#ff0000;" /></svg>\n', 'utf8');
	writeFileSync(
		configPath,
		`${JSON.stringify({ default: { iconFill: '#123456' } }, null, 2)}\n`,
		'utf8'
	);

	execFileSync('node', [cliPath, inputPath, '--output', outputPath, '--config', configPath], {
		cwd: packageRoot,
		stdio: 'pipe',
	});

	const transformedSvg = readFileSync(outputPath, 'utf8');

	assert.match(transformedSvg, /var\(--icon-fill, #123456\)/);
});

test('cli applies inline settings and lets them override config file values', () => {
	const fixtureDir = mkdtempSync(path.join(tmpdir(), 'open-icon-transform-cli-inline-'));
	const inputPath = path.join(fixtureDir, 'icon_demo.svg');
	const outputPath = path.join(fixtureDir, 'dist', 'icon_demo.transformed.svg');
	const configPath = path.join(fixtureDir, 'open-icon-transform.config.json');

	writeFileSync(inputPath, '<svg><path style="fill:#ff0000;" /></svg>\n', 'utf8');
	writeFileSync(
		configPath,
		`${JSON.stringify({ default: { iconFill: '#123456' } }, null, 2)}\n`,
		'utf8'
	);

	execFileSync(
		'node',
		[
			cliPath,
			inputPath,
			'--output',
			outputPath,
			'--config',
			configPath,
			'--settings',
			'{"default":{"iconFill":"#abcdef"}}',
		],
		{
			cwd: packageRoot,
			stdio: 'pipe',
		}
	);

	const transformedSvg = readFileSync(outputPath, 'utf8');

	assert.match(transformedSvg, /var\(--icon-fill, #abcdef\)/);
});

test('cli applies first-class flags for common transform settings', () => {
	const fixtureDir = mkdtempSync(path.join(tmpdir(), 'open-icon-transform-cli-flags-'));
	const inputPath = path.join(fixtureDir, 'asset_demo.svg');
	const outputPath = path.join(fixtureDir, 'dist', 'asset_demo.transformed.svg');

	writeFileSync(
		inputPath,
		'<svg id="Layer_1"><title>Demo</title><path data-note="keep" style="fill:#ff0000;stroke-width:4;" /></svg>\n',
		'utf8'
	);

	execFileSync(
		'node',
		[
			cliPath,
			inputPath,
			'--output',
			outputPath,
			'--replace-name',
			'asset_',
			'--remove-tag',
			'title',
			'--remove-attribute',
			'data-note',
			'--default-icon-fill',
			'#654321',
			'--default-icon-stroke-width',
			'9',
		],
		{
			cwd: packageRoot,
			stdio: 'pipe',
		}
	);

	const transformedSvg = readFileSync(outputPath, 'utf8');

	assert.match(transformedSvg, /id="Demo"/);
	assert.doesNotMatch(transformedSvg, /<title>/);
	assert.doesNotMatch(transformedSvg, /data-note=/);
	assert.match(transformedSvg, /var\(--icon-fill, #654321\)/);
	assert.match(transformedSvg, /var\(--icon-stroke-width-m, calc\(var\(--icon-stroke-width, 9\) \* 1\)\)/);
});

test('cli lets first-class flags override config and inline settings', () => {
	const fixtureDir = mkdtempSync(path.join(tmpdir(), 'open-icon-transform-cli-flag-precedence-'));
	const inputPath = path.join(fixtureDir, 'icon_demo.svg');
	const outputPath = path.join(fixtureDir, 'dist', 'icon_demo.transformed.svg');
	const configPath = path.join(fixtureDir, 'open-icon-transform.config.json');

	writeFileSync(inputPath, '<svg><path style="fill:#ff0000;" /></svg>\n', 'utf8');
	writeFileSync(
		configPath,
		`${JSON.stringify({ default: { iconFill: '#123456' }, simplifyColors: true }, null, 2)}\n`,
		'utf8'
	);

	execFileSync(
		'node',
		[
			cliPath,
			inputPath,
			'--output',
			outputPath,
			'--config',
			configPath,
			'--settings',
			'{"default":{"iconFill":"#abcdef"},"simplifyColors":true}',
			'--default-icon-fill',
			'#fedcba',
			'--no-simplify-colors',
		],
		{
			cwd: packageRoot,
			stdio: 'pipe',
		}
	);

	const transformedSvg = readFileSync(outputPath, 'utf8');

	assert.doesNotMatch(transformedSvg, /var\(--icon-fill,/);
	assert.match(transformedSvg, /fill:#ff0000;/);
});

test('cli transforms svg directories recursively and preserves relative paths', () => {
	const fixtureDir = mkdtempSync(path.join(tmpdir(), 'open-icon-transform-cli-dir-'));
	const inputRoot = path.join(fixtureDir, 'input');
	const nestedInputRoot = path.join(inputRoot, 'nested');
	const outputRoot = path.join(fixtureDir, 'output');
	const rootSvgPath = path.join(inputRoot, 'icon_root.svg');
	const nestedSvgPath = path.join(nestedInputRoot, 'icon_nested.svg');
	const ignoredFilePath = path.join(inputRoot, 'notes.txt');

	mkdirSync(nestedInputRoot, { recursive: true });
	writeFileSync(rootSvgPath, '<svg><path style="fill:#ff0000;" /></svg>\n', 'utf8');
	writeFileSync(nestedSvgPath, '<svg><path style="stroke:#000000;" /></svg>\n', 'utf8');
	writeFileSync(ignoredFilePath, 'ignore me\n', 'utf8');

	execFileSync('node', [cliPath, inputRoot, '--output', outputRoot], {
		cwd: packageRoot,
		stdio: 'pipe',
	});

	const transformedRootSvg = readFileSync(path.join(outputRoot, 'icon_root.svg'), 'utf8');
	const transformedNestedSvg = readFileSync(
		path.join(outputRoot, 'nested', 'icon_nested.svg'),
		'utf8'
	);

	assert.match(transformedRootSvg, /var\(--icon-fill,/);
	assert.match(transformedNestedSvg, /var\(--icon-stroke-color,/);
	assert.equal(existsSync(path.join(outputRoot, 'notes.txt')), false);
});
