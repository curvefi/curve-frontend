import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarket } from '@/loan/entities/llama-markets'
import Chip from '@mui/material/Chip'
import { t } from '@ui-kit/lib/i18n'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'

const { Spacing } = SizesAndSpaces

/**
 * Displays warnings for a pool, such as deprecated pools or pools with collateral corrosion.
 */
export const MarketWarnings = ({
  market: { userCollateralEroded, userDeposited, deprecatedMessage },
}: {
  market: LlamaMarket
}) => (
  <Stack direction="row" gap={Spacing.md} sx={{ height: 20 }}>
    {deprecatedMessage && (
      <Tooltip title={deprecatedMessage}>
        <Typography variant="bodySRegular" color="warning" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {t`Deprecated`}
          <ExclamationTriangleIcon />
        </Typography>
      </Tooltip>
    )}
    {Boolean(userDeposited) && userCollateralEroded && (
      <Tooltip title={t`Your position is in eroded`}>
        <Chip label={t`Collateral erosion`} color="alert" size="small" />
      </Tooltip>
    )}
  </Stack>
)
