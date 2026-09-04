import { AddressActionInfo } from '@evm-ui/shared/ui/AddressActionInfo'
import Stack from '@mui/material/Stack'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { TokenLabel } from '@ui/components/TokenLabel'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'
import type { PoolRow } from '../../types'
import { poolTypeClassifications, type PoolClassification } from './classifications'

const CLASSIFICATIONS = {
  stable: t`A stable pool is designed for assets expected to maintain a similar value.`,
  volatile: t`A volatile pool is designed for assets whose relative values may change significantly.`,
  fxswap: t`An FXSwap pool automatically recenters liquidity for assets whose relative prices drift over time.`,
} satisfies Record<PoolClassification, string>

const METAPOOL_DESCRIPTION = t`A metapool pairs an asset with the liquidity of an existing base pool.`

export const PoolTooltipContent = ({ pool }: { pool: PoolRow }) => {
  const classification = pool.poolType && poolTypeClassifications[pool.poolType]
  const descriptions = notFalsy(
    classification && CLASSIFICATIONS[classification],
    pool.isMetapool && METAPOOL_DESCRIPTION,
  )

  return (
    <TooltipWrapper>
      {descriptions.map(description => (
        <TooltipDescription key={description} text={description} />
      ))}

      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={t`Pool tokens`} />
          {pool.tradeableCoins.map(({ address, symbol }) => (
            <AddressActionInfo
              key={address}
              chainId={pool.chainId}
              title={
                <TokenLabel
                  blockchainId={pool.blockchainId}
                  address={address}
                  label={symbol}
                  size="mui-sm"
                  typographyVariant="bodyXsRegular"
                />
              }
              address={address}
              size="small"
            />
          ))}
        </TooltipItems>

        <TooltipItems secondary extraMargin>
          <TooltipItem title={t`Contracts`} />
          <AddressActionInfo chainId={pool.chainId} title={t`Pool`} address={pool.address} size="small" />
          {maybe(pool.gauge, gauge => (
            <AddressActionInfo chainId={pool.chainId} title={t`Gauge`} address={gauge.address} size="small" />
          ))}
        </TooltipItems>
      </Stack>
    </TooltipWrapper>
  )
}
