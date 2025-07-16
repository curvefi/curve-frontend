import { useChainId } from 'wagmi'
import { useAppStatsTotalCrvusdSupply } from '@/loan/entities/appstats-total-crvusd-supply'
import type { ChainId } from '@/loan/types/loan.types'
import { CardHeader, Box } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces
const CRVUSD_OPTION = { symbol: 'crvUSD', position: 'suffix' as const, abbreviate: true }

export const PegKeeperStatistics = () => {
  const chainId = useChainId() as ChainId
  const { data: crvusdTotalSupply, isLoading } = useAppStatsTotalCrvusdSupply({ chainId })

  const { total, minted, pegKeepersDebt } = crvusdTotalSupply ?? {}

  const formattedDebtFraction = !total || !minted ? undefined : ((+total - +minted) / +total) * 100

  return (
    <Box display="flex" flexDirection="column">
      <CardHeader title={t`Statistics`} />
      <Box display="grid" gridTemplateColumns="1fr 1fr" padding={Spacing.md} gap={Spacing.xl}>
        <Metric
          loading={isLoading}
          label={t`Peg Stabilisation Reserve`}
          valueOptions={{ unit: CRVUSD_OPTION }}
          value={pegKeepersDebt && Number(pegKeepersDebt)}
        />
        <Metric
          loading={isLoading}
          label={t`% of  crvUSD supply in reserve`}
          value={formattedDebtFraction}
          valueOptions={{ unit: 'percentage' }}
        />
      </Box>
    </Box>
  )
}
