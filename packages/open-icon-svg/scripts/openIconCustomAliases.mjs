/**
 * Custom semantic aliases for common icon use-cases.
 *
 * Each key is the alias name (case-insensitive lookup is handled downstream).
 * Each value is the canonical icon name it resolves to.
 *
 * These give consumers short, memorable, framework-agnostic names for the most
 * frequently used icons (e.g. `search`, `close`, `trash`) instead of having to
 * know the exact catalog path (`ui/search-m`, `ui/multiply-m`, `ui/trash`).
 * Multiple aliases may point at the same canonical icon so common synonyms all
 * resolve. Every target below is validated against the generated catalog at
 * build time — an alias whose target no longer exists is skipped rather than
 * emitted (see buildOpenIconCatalog in ./openIconCatalog.mjs), and the catalog
 * test asserts that all of these resolve.
 */
export const OPEN_ICON_CUSTOM_ALIASES = {
	// Add / remove
	plus: 'ui/add-m',
	add: 'ui/add-m',
	minus: 'ui/subtract-m',
	subtract: 'ui/subtract-m',
	remove: 'ui/subtract-m',

	// Close / confirm
	x: 'ui/multiply-m',
	close: 'ui/multiply-m',
	cancel: 'ui/multiply-m',
	dismiss: 'ui/multiply-m',
	check: 'ui/check-m',
	checkmark: 'ui/check-m',
	tick: 'ui/check-m',
	done: 'ui/check-m',
	success: 'ui/check-m',

	// Actions
	search: 'ui/search-m',
	magnifier: 'ui/search-m',
	find: 'ui/search-m',
	edit: 'ui/edit-line',
	pencil: 'ui/edit-line',
	write: 'ui/edit-line',
	trash: 'ui/trash',
	delete: 'ui/trash',
	bin: 'ui/trash',
	download: 'arrows/arrow-download',
	upload: 'arrows/arrow-upload',
	like: 'ui/like',
	thumbsup: 'ui/like',
	dislike: 'ui/dislike',
	thumbsdown: 'ui/dislike',

	// Objects / entities
	user: 'ui/user',
	person: 'ui/user',
	account: 'ui/user',
	profile: 'ui/user',
	settings: 'ui/settings',
	gear: 'ui/settings',
	cog: 'ui/settings',
	preferences: 'ui/settings',
	home: 'ui/home-location',
	mail: 'media/mail',
	email: 'media/mail',
	envelope: 'media/mail',
	calendar: 'ui/calendar',
	date: 'ui/calendar',
	clock: 'ui/clock',
	time: 'ui/clock',
	file: 'ui/file',
	document: 'ui/file',
	folder: 'ui/folder',
	directory: 'ui/folder',
	archive: 'ui/file-archive',
	image: 'media/image',
	picture: 'media/image',
	photo: 'media/image',
	camera: 'media/camera',
	link: 'ui/link',
	chain: 'ui/link',
	code: 'ui/code-chevrons',
	grid: 'ui/grid',
	list: 'ui/list-dots',
	checklist: 'ui/list-checklist',
	dashboard: 'ui/dashboard',
	globe: 'ui/globe',
	map: 'wayfinding/map',
	cart: 'product/cart',
	bag: 'product/shopping-bag',
	label: 'product/label',
	tag: 'product/label',
	sticker: 'ui/sticker',
	wallet: 'misc/wallet',
	bulb: 'misc/bulb',
	idea: 'misc/bulb',

	// Status / feedback
	info: 'ui/info-m',
	information: 'ui/info-m',
	warning: 'ui/exclamation-mark-m',
	alert: 'ui/exclamation-mark-m',
	error: 'ui/exclamation-mark-m',
	question: 'ui/question-mark-m',
	help: 'ui/question-mark-m',
	star: 'ui/star-m',
	favorite: 'ui/star-m',
	favourite: 'ui/star-m',
	heart: 'ui/heart-m',
	love: 'ui/heart-m',
	lock: 'misc/lock',
	locked: 'misc/lock',
	secure: 'misc/lock',
	unlock: 'misc/unlock',
	unlocked: 'misc/unlock',
	bell: 'media/alarm-bell',
	notification: 'media/alarm-bell',

	// Navigation
	'chevron-down': 'arrows/chevron-down',
	'chevron-up': 'arrows/chevron-up',
	'chevron-left': 'arrows/chevron-left',
	'chevron-right': 'arrows/chevron-right',
	'arrow-down': 'arrows/arrow-down',
	'arrow-up': 'arrows/arrow-up',
	'arrow-left': 'arrows/arrow-left',
	'arrow-right': 'arrows/arrow-right',
	back: 'arrows/arrow-left',
	forward: 'arrows/arrow-right',

	// Media playback
	play: 'media/playback-play',
	pause: 'media/playback-pause',
	stop: 'media/playback-stop',

	// Theme
	sun: 'weather/sun',
	'light-mode': 'weather/sun-light-mode',
	moon: 'weather/moon',
	'dark-mode': 'weather/moon-dark-mode',
	cloud: 'weather/cloud',
};
