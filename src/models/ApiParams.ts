import type { CalendarType } from "./CalendarType";
import type { Category } from "./Category";
import type { Column } from "./Column";
import type { Country } from "./Country";
import type { Feature } from "./Feature";
import type { Importance } from "./Importance";
import type { Language } from "./Language";
import type { TimeZone } from "./TimeZone";

export interface ApiCalendarParams {
	countries?: Country[];
	importance?: Importance[];
	timeZone?: TimeZone;
	calType?: CalendarType;
	lang?: Language;
	category?: Category[];
	columns?: Column[];
	features?: Feature[];
}

export function buildApiParams(params: ApiCalendarParams): string {
	const queryParams = new URLSearchParams();

	if (params.countries?.length) {
		queryParams.append("countries", params.countries.join(","));
	}

	if (params.importance?.length) {
		queryParams.append("importance", params.importance.join(","));
	}

	if (params.timeZone !== undefined) {
		queryParams.append("timeZone", params.timeZone.toString());
	}

	if (params.calType) {
		queryParams.append("calType", params.calType);
	}

	if (params.lang !== undefined) {
		queryParams.append("lang", params.lang.toString());
	}

	if (params.category?.length) {
		queryParams.append("category", params.category.join(","));
	}

	if (params.columns?.length) {
		queryParams.append("columns", params.columns.join(","));
	}

	if (params.features?.length) {
		queryParams.append("features", params.features.join(","));
	}

	return queryParams.toString();
}
