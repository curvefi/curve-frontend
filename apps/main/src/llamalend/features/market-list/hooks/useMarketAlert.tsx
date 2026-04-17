import { ReactNode, useMemo } from 'react'
import { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { AlertType } from '@ui/AlertBox/types'
import type { TooltipProps } from '@ui/Tooltip/types'
import { t } from '@ui-kit/lib/i18n'
import type { BannerProps } from '@ui-kit/shared/ui/Banner'
import { LlamaMarketType } from '@ui-kit/types/market'
import { Chain } from '@ui-kit/utils'

export type MarketAlert = TooltipProps & {
  alertType: AlertType
  isDisableBorrow?: boolean // disallow user from creating new borrow positions
  isDisableDeposit?: boolean // disallow user from supply deposit
  // banner message, related to the market situation
  banner?: Omit<BannerProps, 'children'> & { title: ReactNode }
  // action card message, related to action of user
  message?: ReactNode
}

type Alerts = { [chainId: number]: { [owmId: string]: MarketAlert } }

const LEND_MARKETS_ALERTS: Alerts = {
  [Chain.Ethereum]: {
    // sdola-crvusd lend market
    'one-way-market-30': {
      alertType: 'danger',
      isDisableBorrow: true,
      isDisableDeposit: true,
      message: t`This market is deprecated after a donation attack. New borrow positions and deposits are disabled.`,
    },
  },
  [Chain.Arbitrum]: {
    'one-way-market-7': {
      alertType: 'danger',
      isDisableDeposit: true,
      message: t`Due to small liquidity, borrowing or supplying in this market is not advisable.`,
    },
  },
}

const MINT_MARKETS_ALERTS: Alerts = {}

export const useMarketAlert = <ChainId extends IChainId>(
  rChainId: ChainId,
  rOwmId: string | undefined,
  marketType: LlamaMarketType,
) =>
  useMemo(() => {
    if (!rChainId || !rOwmId) return null

    const foundAlert = (marketType === LlamaMarketType.Lend ? LEND_MARKETS_ALERTS : MINT_MARKETS_ALERTS)[rChainId]?.[
      rOwmId
    ]

    return foundAlert || null
  }, [rChainId, rOwmId, marketType])
