import { Fragment } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { TokenIcon } from '@ui/components/TokenIcon'
import { TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import { type QueryProp, toValue } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { decimal, decimalCompare } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import type { PoolClaimables, PoolRow } from '../types'

const { Spacing } = SizesAndSpaces

export const ClaimablesTooltipContent = ({
  blockchainId,
  claimables,
  totalUsd,
}: {
  blockchainId: PoolRow['blockchainId']
  claimables: PoolClaimables
  totalUsd: QueryProp<Decimal> | undefined
}) => (
  <TooltipWrapper>
    <Stack>
      <TooltipItems secondary>
        <Box
          sx={{
            // Using <TooltipItem> doesn't work well for perfectly aligned tables, and mui Table is overkill
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            columnGap: Spacing.sm,
            rowGap: Spacing.xs,
            alignItems: 'center',
          }}
        >
          {claimables
            .toSorted((a, b) => decimalCompare(b.amountUsd, a.amountUsd))
            .map(reward => (
              <Fragment key={reward.token}>
                <Stack direction="row" sx={{ gap: Spacing.xs }}>
                  <TokenIcon blockchainId={blockchainId} address={reward.token} size="mui-sm" />
                  <Typography variant="bodySRegular" color="textSecondary">
                    {reward.symbol}
                  </Typography>
                </Stack>
                <Typography variant="bodySBold" color="textPrimary" sx={{ textAlign: 'right' }}>
                  {formatNumber(decimal(reward.amount), 'token.precise')}
                </Typography>
                <Typography variant="bodyXsRegular" color="tertiary" sx={{ textAlign: 'right' }}>
                  {formatNumber(reward.amountUsd, 'usd.precise')}
                </Typography>
              </Fragment>
            ))}
        </Box>
      </TooltipItems>
      <TooltipItems borderTop>
        <TooltipItem title={t`Total`} variant="primary">
          {formatNumber(toValue(totalUsd), 'usd.precise')}
        </TooltipItem>
      </TooltipItems>
    </Stack>
  </TooltipWrapper>
)
