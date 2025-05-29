import type { Currency } from "./Currency";
import type { Importance } from "./Importance";

export interface EconomicEvent {
	id: string;

	timestampDay: number;
	time: string;

	country: string;
	currency: Currency;
	importance: Importance;

	name: string;

	actual: string | null;
	forecast: string | null;
	previous: string | null;
}
