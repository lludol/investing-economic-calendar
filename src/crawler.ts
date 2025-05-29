import * as cheerio from "cheerio";
import type { CalendarType } from "./models/CalendarType";
import type { Country } from "./models/Country";
import { type Currency, currencyToCountries } from "./models/Currency";
import type { EconomicEvent } from "./models/EconomicEvent";
import { Importance } from "./models/Importance";
import type { Language } from "./models/Language";
import type { TimeZone } from "./models/TimeZone";

interface InvestingParams {
	importance: Importance[];
	countries?: Country[];
	calType: CalendarType.DAILY | CalendarType.WEEKLY;
	timeZone: TimeZone;
	lang: Language;
}

export interface Params extends InvestingParams {
	currencies?: Currency[];
}

const INVESTING_URL = "https://sslecal2.investing.com/";

/**
 * Generate the url for the Investing economic calendar widget.
 * @param {InvestingParams} params - Parameters to send to the widget
 * @returns {string} - The url generated
 */
function generateUrl(params: InvestingParams): string {
	const url = new URL(INVESTING_URL);

	for (const [key, value] of Object.entries(params)) {
		if (Array.isArray(value)) {
			url.searchParams.set(key, value.join(","));
		} else {
			url.searchParams.set(key, String(value));
		}
	}

	return url.toString();
}

/**
 * Extract one event from the widget
 * @param {cheerio.Root} $ - Cheerio instance
 * @param {cheerio.Element} tr - HTML tr element
 * @returns {EconomicEvent} - One event
 */
function extractOneEventFromWidget($: cheerio.Root, tr: cheerio.Element): EconomicEvent {
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
		.each((_, td) => {
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
				let nbIcons = 0;
				$(td)
					.children()
					.each((i, child) => {
						if ($(child).attr("class")?.includes("grayFullBullishIcon")) {
							nbIcons++;
						}
					});

				if (nbIcons === 3) {
					event.importance = Importance.HIGH;
				}
				if (nbIcons === 2) {
					event.importance = Importance.MEDIUM;
				}
				if (nbIcons === 1) {
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
 * @param {Params} params - Parameters to send to the widget
 * @returns {EconomicEvent[]} - Array with all events extracted
 */
export async function fetchEconomicEvents(params: Params): Promise<EconomicEvent[]> {
	const { currencies, ...investingParams } = params;

	if (currencies && currencies.length > 0) {
		const countries = [];

		for (const currency of currencies) {
			countries.push(currencyToCountries[currency]);
		}

		investingParams.countries = countries.flat();
	}

	const url = generateUrl(investingParams);
	const response = await fetch(url, {
		headers: {
			Accept: "*/*",
			Connection: "keep-alive",
			"Accept-Encoding": "gzip, deflate, br",
			"Content-Type": "text/html; charset=UTF-8",
			Host: "sslecal2.investing.com",
		},
	});

	const html = await response.text();
	const $ = cheerio.load(html);

	const events: EconomicEvent[] = [];
	let lastTimestamp: string | null = null;

	$("#ecEventsTable")
		.children()
		.last()
		.children("tr")
		.each((_, event) => {
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
