import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { formatDate } from '@primitives/date.utils'
import type { Amount, Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { maybe, maybes, type Nullish } from '@primitives/objects.utils'
import { SectionContentCard } from '@ui/components/SectionContentCard'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

export type ParametersProps = {
  a: number | Nullish
  adjustmentStep: number | Nullish
  allowedExtraProfit: number | Nullish
  feeGamma: number | Nullish
  maHalfTime: number | Nullish
  midFee: number | Nullish
  offpegFeeMultiplier: number | Nullish
  outFee: number | Nullish
  A: Decimal | Nullish
  initial_A: Decimal | Nullish
  initial_A_time: number | Nullish
  future_A: Decimal | Nullish
  future_A_time: number | Nullish
  formatADisplay: (a: Amount | Nullish) => string
  rampADetails: { isFutureATimePassedToday: boolean; isRampUp: boolean } | undefined
  ammFee: QueryProp<Amount>
  daoFee: QueryProp<Amount>
  eywaFee: QueryProp<Amount | null>
  virtualPrice: QueryProp<Amount>
  gamma: Amount | undefined
}

export const Parameters = ({
  a,
  adjustmentStep,
  allowedExtraProfit,
  feeGamma,
  maHalfTime,
  midFee,
  offpegFeeMultiplier,
  outFee,
  A,
  initial_A,
  initial_A_time,
  future_A,
  future_A_time,
  formatADisplay,
  rampADetails,
  ammFee,
  daoFee,
  eywaFee,
  virtualPrice,
  gamma,
}: ParametersProps) => (
  <Card size="extraSmall" variant="inline">
    <CardHeader title={t`Parameters`} />
    <CardContent>
      <SectionContentCard>
        <ActionInfo
          label={t`AMM fee`}
          value={mapQuery(ammFee, fee =>
            formatNumber(fee, { maximumFractionDigits: 4, unit: 'percentage', abbreviate: false, fallback: '-' }),
          )}
        />

        <ActionInfo
          label={t`DAO fee`}
          valueTooltip={t`The total fee on each trade is split in two parts: one part goes to the pool's Liquidity Providers, another part goes to the DAO (i.e. Curve veCRV holders)`}
          value={mapQuery(daoFee, daoFee =>
            formatNumber(daoFee, { maximumFractionDigits: 4, unit: 'percentage', abbreviate: false, fallback: '-' }),
          )}
        />

        {eywaFee.data != null && <ActionInfo label={t`EYWA fee`} value={eywaFee} />}

        <ActionInfo
          label={t`Virtual price`}
          value={mapQuery(virtualPrice, value =>
            formatNumber(value, { maximumFractionDigits: 8, abbreviate: false, fallback: '-' }),
          )}
          valueTooltip={t`Measures pool growth; this is not a dollar value`}
        />
      </SectionContentCard>

      <SectionContentCard>
        {(A != null || a != null) && (
          <ActionInfo
            label={t`Amplification factor`}
            value={formatADisplay(A ?? a ?? undefined)}
            valueTooltip={
              <Stack sx={{ gap: Spacing.sm }}>
                {t`Amplification coefficient chosen from fluctuation of prices around 1.`}
                {rampADetails?.isFutureATimePassedToday &&
                  maybes(
                    [initial_A_time, future_A_time],
                    (initial_A_time, future_A_time) =>
                      t`Last change occurred between ${formatDate(initial_A_time, 'short')} and ${formatDate(
                        future_A_time,
                        'short',
                      )}, when A ramped from ${formatADisplay(initial_A)} to ${formatADisplay(future_A)}.`,
                  )}
              </Stack>
            }
          />
        )}

        {rampADetails && !rampADetails.isFutureATimePassedToday && (
          <>
            <ActionInfo
              label={t`Ramping ${rampADetails.isRampUp ? 'up' : 'down'} A`}
              valueTooltip={t`Slowly changing ${rampADetails.isRampUp ? 'up' : 'down'} A so that it doesn't negatively change virtual price growth of shares`}
              value={formatADisplay(initial_A)}
              futureValue={formatADisplay(future_A)}
            />
            <ActionInfo label={t`Ramp ends`} value={future_A_time ? formatDate(future_A_time, 'short') : '-'} />
          </>
        )}

        {maybe(offpegFeeMultiplier, x => (
          <ActionInfo label={t`Off peg multiplier`} value={formatNumber(x / 10 ** 10, 'pool.parameter')} />
        ))}
      </SectionContentCard>

      <SectionContentCard>
        {maybe(midFee, x => (
          <ActionInfo label={t`Mid fee`} value={formatNumber(x / 10 ** 8, 'pool.parameter')} />
        ))}

        {maybe(outFee, x => (
          <ActionInfo label={t`Out fee`} value={formatNumber(x / 10 ** 8, 'pool.parameter')} />
        ))}
      </SectionContentCard>

      <SectionContentCard>
        {gamma && (
          <ActionInfo
            label={t`Gamma`}
            value={formatNumber(gamma, { useGrouping: false, abbreviate: false, fallback: '-' })}
          />
        )}

        {maybe(feeGamma, x => (
          <ActionInfo label={t`Fee Gamma`} value={formatNumber(x / 10 ** 18, 'pool.parameter')} />
        ))}

        {maybe(allowedExtraProfit, x => (
          <ActionInfo label={t`Allowed extra profit`} value={formatNumber(x / 10 ** 18, 'pool.parameter')} />
        ))}
      </SectionContentCard>

      <SectionContentCard>
        {maybe(adjustmentStep, x => (
          <ActionInfo label={t`Adjustment step`} value={formatNumber(x / 10 ** 18, 'pool.parameter')} />
        ))}

        {maybe(maHalfTime, x => (
          <ActionInfo
            label={t`Moving average time`}
            value={formatNumber(x, { useGrouping: false, abbreviate: false })}
          />
        ))}
      </SectionContentCard>
    </CardContent>
  </Card>
)
