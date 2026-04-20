import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";
import { type ApiCalendarParams, buildApiParams } from "./models/ApiParams";
import { type Currency, currencyToCountries } from "./models/Currency";
import type { EconomicEvent } from "./models/EconomicEvent";
import { Importance } from "./models/Importance";

export interface Params extends ApiCalendarParams {
	currencies?: Currency[];
}

const INVESTING_URL = "https://sslecal2.investing.com/";

function generateUrl(params: ApiCalendarParams): string {
	const query = buildApiParams(params);
	return `${INVESTING_URL}?${query}`;
}

function extractOneEventFromWidget($: CheerioAPI, tr: AnyNode): EconomicEvent {
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
