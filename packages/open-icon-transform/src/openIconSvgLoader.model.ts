/** Replacement rule used by the SVG transformation pipeline. */
export type OpenIconReplaceDataEntry = [string | string[], string];

/** Runtime configuration for the open-icon SVG transformer. */
export interface OpenIconSvgLoaderSettings {
	/** Query key used by loaders (kept here for shared config compatibility). */
	query: string;
	/** String(s) removed from original file names before deriving metadata. */
	replaceName: string | string[];
	/** Literal replacement rules applied to SVG source. */
	replaceData: OpenIconReplaceDataEntry[];
	/** Cleanup patterns removed from source (literal or `/regex/`). */
	removeData: string | string[];
	/** SVG tags removed entirely from output. */
	removeTags: string | string[];
	/** Element attributes removed from output. */
	removeAttributes: string | string[];
	/** Enables color simplification of hex values to nearest base names. */
	simplifyColors: boolean;
	/** Defaults used during variable interpolation. */
	default: {
		iconFill: string;
		iconFillOpacity: string;
		iconStrokeWidth: string;
		iconStrokeLinecap: string;
		iconStrokeLinejoin: string;
	};
	/** Extra variable context available in templates (`{{...}}`). */
	configData?: Record<string, unknown>;
}

/** Derived metadata used during variable interpolation. */
export interface OpenIconSvgMeta {
	/** Slug-safe name derived from filename. */
	fileName: string;
	/** PascalCase component-like name derived from filename. */
	componentName: string;
}
