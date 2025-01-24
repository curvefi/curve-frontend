import { getHost, type Options, type Chain } from "..";
import { fetchJson as fetch } from "../fetch";
import type * as Responses from "./responses";
import * as Parsers from "./parsers";

export type Endpoint = "crvusd" | "lending";

export async function getEvents(
  endpoint: Endpoint,
  chain: Chain,
  llamma: string,
  page: number,
  options?: Options
) {
  const host = await getHost(options);
  const resp = await fetch<Responses.GetLlammaEventsResponse>(
    `${host}/v1/${endpoint}/llamma_events/${chain}/${llamma}?page=${page}&per_page=10`
  );

  return {
    events: resp.data.map(Parsers.parseEvents),
    count: resp.count,
  };
}

export async function getTrades(
  endpoint: Endpoint,
  chain: Chain,
  llamma: string,
  page: number,
  options?: Options
) {
  const host = await getHost(options);
  const resp = await fetch<Responses.GetLlammaTradesResponse>(
    `${host}/v1/${endpoint}/llamma_trades/${chain}/${llamma}?page=${page}&per_page=10`
  );

  return {
    trades: resp.data.map(Parsers.parseTrades),
    count: resp.count,
  };
}

export async function getOHLC(
  endpoint: Endpoint,
  chain: Chain,
  llamma: string,
  options?: Options
) {
  const host = await getHost(options);

  const end = Math.floor(new Date().getTime() / 1000);
  const start = end - 10 * 24 * 60 * 60; // Subtract 1 month worth of seconds.

  const resp = await fetch<Responses.GetLlammaOHLCResponse>(
    `${host}/v1/${endpoint}/llamma_ohlc/${chain}/${llamma}?agg_number=1&agg_units=hour&start=${start}&end=${end}`
  );

  return resp.data.map(Parsers.parseOHLC);
}
