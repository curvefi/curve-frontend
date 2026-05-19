import type { Address } from '@primitives/address.utils'
import { fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Options } from '..'
import * as Schema from './schema'

export type * from './schema'

export async function getCompetition(tx: Address, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/mainnet/api/v1/solver_competition/by_tx_hash/${tx}`)

  return Schema.getSolverCompetitionResponse.parse(response)
}
