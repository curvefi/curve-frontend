import Card from '@mui/material/Card'
import type { SxProps } from '@ui-kit/utils'
import { usePegkeeper } from '../hooks/usePegkeeper'
import type { PegKeeper as PegKeeperType } from '../types'
import { PegKeeperAdvancedDetails } from './PegKeeperAdvancedDetails'
import { PegKeeperHeader } from './PegKeeperHeader'
import { PegKeeperMetrics } from './PegKeeperMetrics'
import { PegKeeperRebalanceButton } from './PegKeeperRebalanceButton'

type Props = PegKeeperType & {
  testId?: string
  sx?: SxProps
}

export const PegKeeper = ({ sx, testId = 'pegkeeper', ...pegkeeper }: Props) => {
  const {
    address,
    pool: { id: poolId, name: poolName, address: poolAddress, underlyingCoins, underlyingCoinAddresses },
  } = pegkeeper

  const { rate, debt, debtCeiling, estCallerProfit, rebalance, isRebalancing } = usePegkeeper(pegkeeper)

  return (
    <Card sx={sx} data-testid={`${testId}-root`}>
      <PegKeeperHeader
        underlyingCoins={underlyingCoins}
        underlyingCoinAddresses={underlyingCoinAddresses}
        rate={rate}
      />

      <PegKeeperMetrics
        rate={rate}
        debt={debt}
        debtCeiling={debtCeiling}
        poolName={poolName}
        underlyingCoins={underlyingCoins}
        testId={testId}
      />

      <PegKeeperAdvancedDetails
        address={address}
        estCallerProfit={estCallerProfit}
        poolId={poolId}
        poolName={poolName}
        poolAddress={poolAddress}
        testId={testId}
      />

      <PegKeeperRebalanceButton
        canRebalance={!!estCallerProfit && estCallerProfit !== '0'}
        isRebalancing={isRebalancing}
        onRebalance={rebalance}
        testId={testId}
      />
    </Card>
  )
}
