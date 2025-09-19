import { getTokens } from '@/llamalend/llama.utils'
import type { ActionInfosProps } from '..'
import type { UserState, Market } from '../types'
import { parseFloatOptional } from './float'

type Props = {
  market: Market | undefined
  userState: Pick<UserState, 'collateral' | 'stablecoin' | 'debt'> | undefined
}

export function getCollateralInfo({ market, userState }: Props): ActionInfosProps['collateral'] {
  const { collateral } = userState ?? {}
  const amount = parseFloatOptional(collateral)
  const { symbol } = (market && getTokens(market))?.collateralToken || {}
  const borrowed = (amount && symbol && { symbol, amount }) || undefined

  return {
    borrowed,
    leverage: undefined, // I don't know yet how to determine it so it's not available for now
    assetsToWithdraw: undefined, // Not sure what the point is atm, same as 'collateral' action info in loan group?
  }
}
