import { BigNumber } from 'bignumber.js'
import type { FastifyRequest } from 'fastify'
import type { Address, Hex } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { FetchError, fetchJson } from '@primitives/fetch.utils'
import type { ClmmMigrationResponse, TransactionData } from '@primitives/router.utils'
import { getRouterFee } from '../router-fees'
import type { ClmmMigrationQuery } from './clmm-migration.schemas'

const { ENSO_API_URL = 'https://api.enso.finance', ENSO_API_KEY } = process.env

type EnsoBundleResponse = {
  amountsOut: Record<Address, Decimal>
  minAmountsOut: Record<Address, Decimal>
  gas: Decimal
  tx: TransactionData
  preTransactions?: { type: string; tx: { to: Address; data: Hex } }[]
}

/**
 * Enso bundle: redeem the whole position, take the router fee from each token, then route each token into `tokenOut`.
 * Routing each token separately works for every Curve pool type and gauge, unlike protocol-specific deposits.
 */
const buildActions = ({
  chainId,
  protocol,
  positionManager,
  tokenId,
  liquidity,
  tokens,
  tokenOut,
  slippage,
}: ClmmMigrationQuery) => {
  const fee = getRouterFee('enso', { chainId })
  const slippageBps = new BigNumber(slippage).times(100).toFixed(0)
  const redeem = {
    protocol,
    action: 'redeemclmm',
    args: { tokenIn: positionManager, tokenOut: tokens, liquidity, tokenId },
  }
  const fees = fee
    ? tokens.map((token, index) => ({
        protocol: 'enso',
        action: 'fee',
        args: { token, amount: { useOutputOfCallAt: 0, index }, bps: fee.feeBps, receiver: fee.feeReceiver },
      }))
    : []
  const routes = tokens.map((token, index) => ({
    protocol: 'enso',
    action: 'route',
    args: {
      tokenIn: token,
      tokenOut,
      amountIn: fee ? { useOutputOfCallAt: 1 + index } : { useOutputOfCallAt: 0, index },
      slippage: slippageBps,
    },
  }))
  return { actions: [redeem, ...fees, ...routes], feePercentage: (fee ? +fee.feeBps / 100 : 0).toString() as Decimal }
}

export const getClmmMigration = async (
  request: FastifyRequest<{ Querystring: ClmmMigrationQuery }>,
): Promise<ClmmMigrationResponse> => {
  const { query, log } = request
  const { actions, feePercentage } = buildActions(query)
  const url = `${ENSO_API_URL}/api/v1/shortcuts/bundle?${new URLSearchParams({
    chainId: `${query.chainId}`,
    fromAddress: query.userAddress,
    routingStrategy: 'router',
  })}`
  const {
    amountsOut,
    minAmountsOut,
    gas,
    tx,
    preTransactions = [],
  } = await fetchJson<EnsoBundleResponse>(url, {
    body: actions,
    ...(ENSO_API_KEY && { headers: { Authorization: `Bearer ${ENSO_API_KEY}` } }),
  }).catch(error => {
    if (error instanceof FetchError) log.error({ message: 'Enso bundle request failed', status: error.status, url })
    throw error
  })
  const outKey = Object.keys(amountsOut).find(key => key.toLowerCase() === query.tokenOut.toLowerCase()) as Address
  const approval = preTransactions.find(({ type }) => type === 'tokenApproval')?.tx
  return {
    routerFeePercentage: feePercentage,
    amountOut: amountsOut[outKey],
    minAmountOut: minAmountsOut[outKey] ?? amountsOut[outKey],
    gas,
    tx,
    approval: approval ? { to: approval.to, data: approval.data } : null,
  }
}
