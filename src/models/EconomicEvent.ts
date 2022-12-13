import { Importance } from './Importance';

export type Currency = 'AUD' | 'CAD' | 'CHF' | 'GBP' | 'EUR' | 'JPY' | 'USD' | 'NZD';

export interface EconomicEvent {
	time: string;
	country: string;
	currency: Currency;
	importance: Importance;

	name: string;

	actual: string | null;
	forecast: string | null;
	previous: string | null;
}
