import { getHost, type Options, type Chain } from "..";
import { fetchJson as fetch } from "../fetch";
import type * as Responses from "./responses";
import * as Parsers from "./parsers";

export type Endpoint = "crvusd" | "lending";

export async function getLoanDistribution(
  endpoint: Endpoint,
  chain: Chain,
  controller: string,
  options?: Options
) {
  const host = await getHost(options);
  const resp = await fetch<Responses.GetLoanDistributionResponse>(
    `${host}/v1/${endpoint}/markets/${chain}/${controller}/loans/distribution`
  );

  return Parsers.parseLoanDistribution(resp);
}
