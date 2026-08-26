import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { t } from '@evm-ui/lib/i18n'
import { AddressActionInfo } from '@evm-ui/shared/ui/AddressActionInfo'
import { TokenLabel } from '@evm-ui/shared/ui/TokenLabel'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@evm-ui/shared/ui/TooltipComponents'
import Stack from '@mui/material/Stack'
import { maybe, notFalsy } from '@primitives/objects.utils'
import type { PoolRow } from '../../types'
import { poolTypeClassifications, type PoolClassification } from './classifications'

const CLASSIFICATIONS = {
  stable: t`A stable pool is a liquidity pool designed for assets that trade at similar values, enabling low-slippage swaps with minimal fees.`,
  volatile: t`A volatile pool is a liquidity pool designed for assets whose values can fluctuate independently, enabling efficient swaps across a wide range of prices.`,
} satisfies Record<PoolClassification, string>

const METAPOOL_DESCRIPTION = t`A metapool pairs an asset with a base pool's LP token, enabling swaps with the base pool's underlying assets.`

export const PoolTooltipContent = ({ pool }: { pool: PoolRow }) => {
  const network = useNetworkFromUrl()

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
              network={network}
              title={
                <TokenLabel
                  blockchainId={pool.network}
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
          <AddressActionInfo network={network} title={t`Pool`} address={pool.address} size="small" />
          {maybe(pool.gauge, gauge => (
            <AddressActionInfo network={network} title={t`Gauge`} address={gauge.address} size="small" />
          ))}
        </TooltipItems>
      </Stack>
    </TooltipWrapper>
  )
}
