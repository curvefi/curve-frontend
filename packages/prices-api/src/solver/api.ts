import { fetchJson as fetch } from '@curvefi/primitives/fetch.utils'
import { getHost, type Options, type Address } from '..'
import * as Parsers from './parsers'
import type * as Responses from './responses'

export async function getCompetition(tx: Address, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetSolverCompetitionResponse>(
    `${host}/mainnet/api/v1/solver_competition/by_tx_hash/${tx}`,
  )

  return Parsers.parseSolverCompetition(resp)
}
