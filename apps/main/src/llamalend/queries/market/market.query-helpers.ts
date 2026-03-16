import { requireLib } from '@ui-kit/features/connect-wallet'

export const getLendMarket = (marketId: string) => requireLib('llamaApi').getLendMarket(marketId)
