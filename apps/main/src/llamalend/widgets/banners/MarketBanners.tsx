import { ReactNode } from 'react'
import { useMarketAlert } from '@/llamalend/features/market-list/hooks/useMarketAlert'
import { useDeprecatedMarket } from '@/llamalend/hooks/useDeprecatedMarket'
import { useSolvencyMarket } from '@/llamalend/hooks/useSolvencyMarket'
import { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import { AlertType } from '@ui/AlertBox/types'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { QueryProp } from '@ui-kit/types/util'
import { BlockchainIds } from '@ui-kit/utils/network'
import { DeprecatedMarketBanner } from './DeprecatedMarketBanner'
import { LowSolvencyBanner } from './LowSolvencyBanner'
import { MarketAlertBanner } from './MarketAlertBanner'

const isHighSeverityAlert = (type: AlertType | undefined) => type && ['warning', 'danger'].includes(type)

/**
 * When the stack is empty, we don't want to display it at all,
 * because an empty div influences a parent flex's gap.
 */
const HIDE_IF_EMPTY = { '&:empty': { display: 'none' } }

export const MarketBanners = <ChainId extends IChainId>({
  chainId,
  marketType,
  controllerAddress: { data: controllerAddress },
  rewardsBanner,
}: {
  chainId: ChainId
  marketType: LlamaMarketType
  controllerAddress: QueryProp<Address>
  // additional banner not shared across all markets type and hidden if market alert has high severity
  rewardsBanner?: ReactNode
}) => {
  const blockchainId = BlockchainIds[chainId]
  const marketAlert = useMarketAlert(chainId, controllerAddress, marketType)
  const deprecatedMarket = useDeprecatedMarket({ blockchainId, controllerAddress, marketType })
  const { data: solvencyMarket } = useSolvencyMarket({ blockchainId, controllerAddress, marketType })

  return (
    <Stack sx={HIDE_IF_EMPTY}>
      {marketAlert?.banner && <MarketAlertBanner alertType={marketAlert.alertType} banner={marketAlert.banner} />}
      {deprecatedMarket && <DeprecatedMarketBanner {...deprecatedMarket} />}
      {solvencyMarket && <LowSolvencyBanner {...solvencyMarket} />}
      {!isHighSeverityAlert(marketAlert?.alertType) && rewardsBanner}
    </Stack>
  )
}
