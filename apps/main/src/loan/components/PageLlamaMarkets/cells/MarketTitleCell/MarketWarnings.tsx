import { useUserMarketStats } from '@/loan/entities/llama-market-stats'
import { LlamaMarket } from '@/loan/entities/llama-markets'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/**
 * Displays warnings for a pool, such as deprecated pools or pools with collateral corrosion.
 */
export const MarketWarnings = ({ market }: { market: LlamaMarket }) => {
  const { isCollateralEroded } = useUserMarketStats(market)?.data ?? {}
  return (
    <Stack direction="row" gap={Spacing.md} sx={{ height: 20 }}>
      {market.deprecatedMessage && (
        <Tooltip title={market.deprecatedMessage}>
          <Typography variant="bodySRegular" color="warning" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {t`Deprecated`}
            <ExclamationTriangleIcon />
          </Typography>
        </Tooltip>
      )}
      {isCollateralEroded && (
        <Tooltip title={t`Your position is in eroded`}>
          <Chip label={t`Collateral erosion`} color="alert" size="small" />
        </Tooltip>
      )}
    </Stack>
  )
}
