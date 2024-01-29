import Crawler from "crawler";
import qs from "qs";
import { CalendarType } from "./models/CalendarType";
import { Country } from "./models/Country";
import { Currency, currencyToCountries } from "./models/Currency";
import { EconomicEvent } from "./models/EconomicEvent";
import { Importance } from "./models/Importance";
import { Language } from "./models/Language";
import { TimeZone } from "./models/TimeZone";

interface InvestingParams {
	importance: Importance[];
	countries: Country[];
	calType: CalendarType.DAILY | CalendarType.WEEKLY;
	timeZone: TimeZone;
	lang: Language;
}

export interface Params extends InvestingParams {
	currencies: Currency[];
}

const newsCrawler = new Crawler({
	maxConnections: 1,
	retries: 1,
	retryTimeout: 1000,
});

const INVESTING_URL = "https://sslecal2.investing.com/";

/**
 * Generate the url for the Investing economic calendar widget.
 * @param {InvestingParams} params - Parameters to send to the widget
 * @returns {string} - The url generated
 */
function generateUrl(params: InvestingParams): string {
	const query = qs.stringify(params, { arrayFormat: "comma" });

	return `${INVESTING_URL}?${query}`;
}

/**
 * Extract one event from the widget
 * @param {cheerio.CheerioAPI} $ - Cheerio instance
 * @param {cheerio.Element} tr - HTML tr element
 * @returns {EconomicEvent} - One event
 */
function extractOneEventFromWidget($: cheerio.CheerioAPI, tr: cheerio.Element): EconomicEvent {
	const event: Partial<EconomicEvent> = {
		actual: null,
		forecast: null,
		previous: null,
	};

	if ($(tr).attr("id")) {
		event.id = ($(tr).attr("id") || "").replace("eventRowId_", "");
	}

	$(tr)
		.children("td")
		.each((index, td) => {
			if ($(td).hasClass("first left time")) {
				event.time = $(td).text().trim();
			}

			if ($(td).hasClass("left event")) {
				event.name = $(td).text().trim();
			}

			if ($(td).hasClass("flagCur")) {
				event.country = $(td).children("span").first().attr("title") || "";
				event.currency = $(td).text().trim() as Currency;
			}

			if ($(td).hasClass("sentiment")) {
				if ($(td).children().length === 3) {
					event.importance = Importance.HIGH;
				}
				if ($(td).children().length === 2) {
					event.importance = Importance.MEDIUM;
				}
				if ($(td).children().length === 1) {
					event.importance = Importance.LOW;
				}
			}

			if ($(td).hasClass("act")) {
				if ($(td).text().trim().length > 0) {
					event.actual = $(td).text().trim();
				}
			}

			if ($(td).hasClass("fore")) {
				if ($(td).text().trim().length > 0) {
					event.forecast = $(td).text().trim();
				}
			}

			if ($(td).hasClass("prev")) {
				if ($(td).text().trim().length > 0) {
					event.previous = $(td).text().trim();
				}
			}
		});

	return event as EconomicEvent;
}

/**
 * Extract events from the widget
 * @param {cheerio.CheerioAPI} $ - Cheerio instance
 * @returns {EconomicEvent[]} - Array with all events extracted
 */
function extractEventsFromWidget($: cheerio.CheerioAPI): EconomicEvent[] {
	const events: EconomicEvent[] = [];
	let lastTimestamp: string | null = null;

	$("#ecEventsTable")
		.children()
		.last()
		.children("tr")
		.each((index, event) => {
			if (!$(event).attr("class")) {
				$(event)
					.children("td")
					.each((i, td) => {
						if ($(td).attr("class")?.includes("theDay")) {
							lastTimestamp = $(td).attr("id")?.replace("theDay", "") || null;
						}
					});
			}

			if ($(event).attr("id")?.includes("eventRowId")) {
				if (lastTimestamp) {
					const extractedEvent = extractOneEventFromWidget($, event);
					extractedEvent.timestampDay = Number.parseInt(lastTimestamp, 10);
					events.push(extractedEvent);
				}
			}
		});

	return events;
}

/**
 * Extract events from the widget
 * @param {Params} params - Parameters to send to the widget
 * @returns {EconomicEvent[]} - Array with all events extracted
 */
export function fetchEconomicEvents(params: Params): Promise<EconomicEvent[]> {
	const { currencies, ...investingParams } = params;

	if (currencies && currencies.length > 0) {
		const countries = [];

		for (const currency of currencies) {
			countries.push(currencyToCountries[currency]);
		}

		investingParams.countries = countries.flat();
	}

	return new Promise((resolve, reject) => {
		newsCrawler.queue({
			uri: generateUrl(investingParams),
			callback: (err, res, doneCrawler) => {
				if (err) {
					reject(err);
				} else {
					resolve(extractEventsFromWidget(res.$));
				}
				doneCrawler();
			},
		});
	});
}
