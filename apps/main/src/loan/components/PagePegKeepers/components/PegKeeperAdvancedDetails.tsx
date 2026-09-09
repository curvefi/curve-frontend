import { DEX_ROUTES, getInternalUrl } from '@evm-ui/shared/routes'
import { tryChecksumAddress, shortenAddress } from '@evm-ui/utils'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Stack from '@mui/material/Stack'
import { formatNumber } from '@primitives/number.utils'
import { ExternalLink } from '@ui/components/ExternalLink'
import { Tooltip } from '@ui/components/Tooltip'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { amount } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
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
    <ActionInfo
      label={t`Pool`}
      value={shortenAddress(poolAddress, { digits: 2 })}
      valueTooltip={
        <ExternalLink
          href={getInternalUrl('dex', 'ethereum', `${DEX_ROUTES.PAGE_POOLS}/${poolId}/deposit`)}
          label={t`View pool`}
        />
      }
      copyValue={poolAddress}
      format={tryChecksumAddress}
      testId={`${testId}-action-info-pool`}
    />

    <ActionInfo
      label={t`Contract`}
      value={shortenAddress(address, { digits: 2 })}
      valueTooltip={<ExternalLink href={`https://etherscan.io/address/${address}`} label={t`View on Etherscan`} />}
      copyValue={address}
      format={tryChecksumAddress}
      testId={`${testId}-action-info-contract`}
    />

    <ActionInfo
      label={t`Est. rebalance profit`}
      value={mapQuery(estCallerProfit, data =>
        formatNumber(amount(data), { decimals: 5, abbreviate: false, fallback: '-' }),
      )}
      valueRight={
        <Tooltip arrow placement="top" title={t`Profit is denominated in ${poolName} LP Tokens`}>
          <InfoOutlinedIcon
            sx={{ width: IconSize.md, height: IconSize.md, color: t => t.design.Text.TextColors.Primary }}
          />
        </Tooltip>
      }
      sx={{ paddingBlockStart: Spacing.md }}
      testId={`${testId}-action-info-profit`}
    />
  </Stack>
)
