import { ReactNode, useMemo } from 'react'
import { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { Address } from '@primitives/address.utils'
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

export type Alerts = { [chainId: number]: { [controllerAddress: Address]: MarketAlert } }

export const LEND_MARKETS_ALERTS: Alerts = {
  [Chain.Ethereum]: {
    // one-way-market-30 - sDOLA/crvUSD
    '0xad444663c6c92b497225c6ce65fee2e7f78bfb86': {
      alertType: 'danger',
      isDisableBorrow: true,
      isDisableDeposit: true,
      message: t`This market is deprecated after a donation attack. New borrow positions and deposits are disabled.`,
    },
  },
  [Chain.Arbitrum]: {
    // one-way-market-7 - FXN/crvUSD
    '0x7adcc491f0b7f9bc12837b8f5edf0e580d176f1f': {
      alertType: 'danger',
      isDisableDeposit: true,
      message: t`Due to small liquidity, borrowing or supplying in this market is not advisable.`,
    },
  },
}

export const MINT_MARKETS_ALERTS: Alerts = {}

export const useMarketAlert = <ChainId extends IChainId>(
  rChainId: ChainId,
  controllerAddress: Address | undefined,
  marketType: LlamaMarketType,
) =>
  useMemo(
    () =>
      controllerAddress &&
      (marketType === LlamaMarketType.Lend ? LEND_MARKETS_ALERTS : MINT_MARKETS_ALERTS)[rChainId]?.[
        // we have tests to be sure that all controller addresses of the alerts are lowercase
        controllerAddress.toLowerCase() as Address
      ],
    [rChainId, controllerAddress, marketType],
  )
