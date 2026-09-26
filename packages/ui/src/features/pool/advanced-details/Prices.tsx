import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import type { Address } from '@primitives/address.utils'
import type { Amount } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import type { Nullish } from '@primitives/objects.utils'
import { SectionContentCard } from '@ui/components/SectionContentCard'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { amount } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'

export type PricesProps = {
  tokenSymbols: string[] | undefined
  tokenAddresses: Address[] | undefined
  priceOracleData?: Amount[] | undefined
  priceScaleData?: Amount[] | undefined
  xcpProfit?: number | Nullish
  xcpProfitA?: number | Nullish
}

export const Prices = ({
  tokenSymbols,
  tokenAddresses,
  priceOracleData,
  priceScaleData,
  xcpProfit,
  xcpProfitA,
}: PricesProps) => {
  // Curve price oracle/scale arrays omit the base token, so value index 0 belongs to token index 1.
  const priceRows = tokenSymbols
    ?.slice(1)
    .map((label, index) => ({ key: tokenAddresses?.[index + 1] ?? `${label}-${index + 1}`, label, index }))

  return (
    <>
      {!!priceOracleData?.length && (
        <Card size="extraSmall" variant="inline">
          <CardHeader title={t`Price Oracle`} />
          <CardContent component={SectionContentCard}>
            {priceRows?.map(({ key, label, index }) => (
              <ActionInfo
                key={`price-oracle-${key}`}
                label={label}
                value={formatNumber(amount(priceOracleData?.[index]), 'pool.parameter')}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {!!priceScaleData?.length && (
        <Card size="extraSmall" variant="inline">
          <CardHeader title={t`Price Scale`} />
          <CardContent component={SectionContentCard}>
            {priceRows?.map(({ key, label, index }) => (
              <ActionInfo
                key={`price-scale-${key}`}
                label={label}
                value={formatNumber(amount(priceScaleData?.[index]), 'pool.parameter')}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {(xcpProfit != null || xcpProfitA != null) && (
        <Card size="extraSmall" variant="inline">
          <CardHeader title={t`Xcp Profit`} />
          <CardContent component={SectionContentCard}>
            {xcpProfit != null && (
              <ActionInfo label={t`Xcp Profit`} value={formatNumber(amount(xcpProfit / 10 ** 18), 'pool.parameter')} />
            )}
            {xcpProfitA != null && (
              <ActionInfo
                label={t`Xcp Profit A`}
                value={formatNumber(amount(xcpProfitA / 10 ** 18), 'pool.parameter')}
              />
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
