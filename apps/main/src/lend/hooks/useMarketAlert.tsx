import type { TooltipProps } from '@ui/Tooltip/types'

import React, { useMemo } from 'react'
import { t } from '@lingui/macro'
import { AlertType, ChainId } from '@/lend/types/lend.types'

export type MarketAlert = TooltipProps & {
  alertType: AlertType
  isDisableDeposit?: boolean // disallow user from supply deposit
  message: string | React.ReactNode
}

type Alerts = { [chainId: number]: { [owmId: string]: MarketAlert } }

const useMarketAlert = (rChainId: ChainId, rOwmId: string | undefined) =>
  useMemo(() => {
    if (!rChainId || !rOwmId) return null

    const alerts: Alerts = {
      42161: {
        'one-way-market-7': {
          alertType: 'danger',
          isDisableDeposit: true,
          message: t`Due to small liquidity, borrowing or supplying in this market is not advisable.`,
        },
      },
    }

    const foundAlert = alerts[rChainId]?.[rOwmId]

    return foundAlert || null
  }, [rChainId, rOwmId])

export default useMarketAlert
