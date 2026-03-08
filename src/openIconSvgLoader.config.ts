import type { OpenIconSvgLoaderSettings } from './openIconSvgLoader.model';

export const openIconSvgLoaderDefaults: OpenIconSvgLoaderSettings = {
	query: 'open-icon',
	replaceName: 'icon_',
	removeData: [
		'/<\\?xml.*?\\?>/',
		'stroke:black;',
		'stroke: black;',
		'/<!--.*?-->/',
	],
	replaceData: [
		[['fill: black;'], 'fill: var(--icon-line-color, currentColor);'],
		['id="Layer_1"', 'id="{{componentName}}"'],
		['data-name="Layer_1"', 'data-name="{{componentName}}"'],
		[
			[
				'opacity:0.5;fill:red;',
				'fill: red; opacity: .5;',
				'fill: red; stroke-width: 0px; opacity: .5;',
			],
			'fill: var(--icon-fill, {{default.iconFill}}); opacity: var(--icon-fill-opacity, {{default.iconFillOpacity}});',
		],
		[
			['stroke:red;', 'stroke: red;', 'fill:none;stroke:red;'],
			'stroke: var(--icon-stroke-color-secondary, var(--icon-stroke-color, currentColor));',
		],
		['fill:red;', 'fill: var(--icon-fill, {{default.iconFill}});'],
		[['stroke: teal;', 'stroke:teal;'], 'stroke: var(--icon-stroke-invisible, transparent);'],
		[
			['stroke-width:1;', 'stroke-width: 1px;'],
			'stroke-width:var(--icon-stroke-width-xs, calc(var(--icon-stroke-width, {{default.iconStrokeWidth}}) * 0.25));',
		],
		[
			['stroke-width:2;', 'stroke-width: 2px;'],
			'stroke-width:var(--icon-stroke-width-s, calc(var(--icon-stroke-width, {{default.iconStrokeWidth}}) * 0.5));',
		],
		[
			['stroke-width:4;', 'stroke-width: 4px;'],
			'stroke-width:var(--icon-stroke-width-m, calc(var(--icon-stroke-width, {{default.iconStrokeWidth}}) * 1));',
		],
		[
			['stroke-width:6;', 'stroke-width: 6px;'],
			'stroke-width:var(--icon-stroke-width-l,  calc(var(--icon-stroke-width, {{default.iconStrokeWidth}}) * 1.5));',
		],
		[
			['stroke-width:12;', 'stroke-width: 12px;'],
			'stroke-width:var(--icon-stroke-width-xl, calc(var(--icon-stroke-width, {{default.iconStrokeWidth}}) * 3));',
		],
		[
			'stroke: purple;',
			'transform: rotate(calc((360 / 12 * var(--hours-handle)) * 1deg));',
		],
		[
			'stroke: orange;',
			'transform: rotate(calc((360 / 60 * var(--minutes-handle)) * 1deg));',
		],
		[
			'stroke: gray;',
			'transform: rotate(calc((360 / 60 * var(--seconds-handle)) * 1deg));',
		],
		[
			'stroke: brown;',
			'transform: rotate(calc((360 / 60 * var(--handle)) * 1deg));',
		],
		[
			'stroke-linecap:round;',
			'stroke-linecap: var(--icon-stroke-linecap, round);',
		],
		[
			'stroke-linecap:square;',
			'stroke-linecap: var(--icon-stroke-linecap, square);',
		],
		[
			'stroke-linejoin:round;',
			'stroke-linecap: var(--icon-stroke-linejoin, round);',
		],
		[
			'stroke-linejoin:square;',
			'stroke-linecap: var(--icon-stroke-linejoin, square);',
		],
	],
	default: {
		iconFill: 'rgba(0, 0, 0, 0)',
		iconFillOpacity: '1',
		iconStrokeWidth: '5',
		iconStrokeLinecap: 'round',
		iconStrokeLinejoin: 'round',
	},
	removeTags: [],
	removeAttributes: [],
	simplifyColors: true,
	configData: {},
};
