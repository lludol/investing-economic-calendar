import { Country } from "./Country";

export enum Currency {
	AUD = "AUD",
	CAD = "CAD",
	CHF = "CHF",
	EUR = "EUR",
	GBP = "GBP",
	JPY = "JPY",
	NZD = "NZD",
	USD = "USD",
}

export const currencyToCountries = {
	[Currency.AUD]: [Country.AUSTRALIA],
	[Currency.CAD]: [Country.CANADA],
	[Currency.CHF]: [Country.SWITZERLAND],
	[Currency.EUR]: [
		Country.AUSTRIA,
		Country.BELGIUM,
		Country.EURO_ZONE,
		Country.FRANCE,
		Country.GERMANY,
		Country.IRELAND,
		Country.ITALY,
		Country.NETHERLANDS,
		Country.PORTUGAL,
		Country.SPAIN,
	],
	[Currency.GBP]: [Country.UNITED_KINGDOM],
	[Currency.JPY]: [Country.JAPAN],
	[Currency.NZD]: [Country.NEW_ZEALAND],
	[Currency.USD]: [Country.UNITED_STATES],
};
