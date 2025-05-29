import { fetchEconomicEvents, CalendarType, Country, Currency, Importance, Language, TimeZone } from "./src/index";

console.log(await fetchEconomicEvents({
	importance: [Importance.HIGH],
	calType: CalendarType.WEEKLY,
	lang: Language.ENGLISH,
	timeZone: TimeZone.EASTERN_TIME_US_CANADA,
	countries: [Country.UNITED_STATES],
	currencies: [Currency.USD],
}));