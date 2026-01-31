import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { DEX_ROUTES, getInternalUrl } from '@ui-kit/shared/routes'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { shortenAddress } from '@ui-kit/utils'
import type { PegKeeper, PegKeeperDetails, Pool } from '../types'

const { Spacing, IconSize } = SizesAndSpaces

type Props = {
  address: PegKeeper['address']
  estCallerProfit: PegKeeperDetails['estCallerProfit']
  poolName: Pool['name']
  poolId: Pool['id']
  poolAddress: Pool['address']
  testId?: string
}

export const PegKeeperAdvancedDetails = ({
  address,
  estCallerProfit,
  poolId,
  poolName,
  poolAddress,
  testId = 'pegkeeper',
}: Props) => (
  <Stack>
    <Typography
      variant="headingXsBold"
      sx={{
        paddingBlockStart: Spacing.md,
        paddingBlockEnd: Spacing.sm,
        paddingInline: Spacing.md,
        borderBottom: (t) => `1px solid ${t.design.Layer[3].Outline}`,
      }}
    >
      {t`Advanced details`}
    </Typography>

    <Stack
      sx={{
        paddingBlockStart: Spacing.xs,
        paddingBlockEnd: Spacing.sm,
        paddingInline: Spacing.md,
      }}
    >
      <ActionInfo
        label={t`Pool`}
        value={shortenAddress(poolAddress, { digits: 2 })}
        link={getInternalUrl('dex', 'ethereum', `${DEX_ROUTES.PAGE_POOLS}/${poolId}/deposit`)}
        copyValue={poolAddress}
        testId={`${testId}-action-info-pool`}
      />

      <ActionInfo
        label={t`Contract`}
        value={shortenAddress(address, { digits: 2 })}
        link={`https://etherscan.io/address/${address}`}
        copyValue={address}
        testId={`${testId}-action-info-contract`}
      />

      <ActionInfo
        label={t`Est. rebalance profit`}
        loading={estCallerProfit == null}
        value={formatNumber(estCallerProfit, { decimals: 5 })}
        valueRight={
          <Tooltip arrow placement="top" title={t`Profit is denominated in ${poolName} LP Tokens`}>
            <InfoOutlinedIcon
              sx={{
                width: IconSize.md,
                height: IconSize.md,
                color: (t) => t.design.Text.TextColors.Primary,
              }}
            />
          </Tooltip>
        }
        sx={{ paddingBlockStart: Spacing.md }}
        testId={`${testId}-action-info-profit`}
      />
    </Stack>
  </Stack>
)
