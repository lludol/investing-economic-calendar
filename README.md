# investing-economic-calendar

Extract economic events from the Investing.com widget.

## Node.js library

```bash
npm install investing-economic-calendar # or yarn add investing-economic-calendar
```

### fetchEconomicEvents
Return economic events of the period sent in parameters (weekly or daily).

```typescript
import {
	fetchEconomicEvents, CalendarType, Country, Currency, Language, Importance, TimeZone,
} from 'investing-economic-calendar';

// Example to fetch all important events of today by Countries.
const eventsDaily = await fetchEconomicEvents({
	importance: [Importance.HIGH],
	calType:    CalendarType.DAILY,
	lang:       Language.ENGLISH,
	timeZone:   TimeZone.UTC,
	countries:  [
		Country.AUSTRALIA, Country.CANADA, Country.EURO_ZONE, Country.FRANCE,
		Country.GERMANY, Country.JAPAN, Country.NEW_ZEALAND, Country.SWITZERLAND,
		Country.UNITED_KINGDOM, Country.UNITED_STATES],
});

// Example to fetch all important events of the week by Currencies.
const eventsWeekly = await fetchEconomicEvents({
	importance: [Importance.HIGH],
	calType:    CalendarType.DAILY,
	lang:       Language.ENGLISH,
	timeZone:   TimeZone.UTC,
	currencies: [
		Currency.AUD, Currency.CAD, Currency.CHF,
		Currency.EUR, Currency.GBP, Currency.JPY,
		Currency.NZD, Currency.USD,
	],
});
```

## TODO
- [ ] Find a way to fetch events with a specific range date
- [ ] Complete models for Language, TimeZone and Country

## Contributing

Don't hesitate to [create a pull request](https://github.com/lludol/investing-economic-calendar/pulls) to improve the project.

## Bugs

If you find a bug or want a new feature, dont'hesitate to [create an issue](https://github.com/lludol/investing-economic-calendar/issues).

## License

[MIT](LICENSE)
