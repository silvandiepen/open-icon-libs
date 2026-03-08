export type OpenIconReplaceDataEntry = [string | string[], string];

export interface OpenIconSvgLoaderSettings {
	query: string;
	replaceName: string | string[];
	replaceData: OpenIconReplaceDataEntry[];
	removeData: string | string[];
	removeTags: string | string[];
	removeAttributes: string | string[];
	simplifyColors: boolean;
	default: {
		iconFill: string;
		iconFillOpacity: string;
		iconStrokeWidth: string;
		iconStrokeLinecap: string;
		iconStrokeLinejoin: string;
	};
	configData?: Record<string, unknown>;
}

export interface OpenIconSvgMeta {
	fileName: string;
	componentName: string;
}
