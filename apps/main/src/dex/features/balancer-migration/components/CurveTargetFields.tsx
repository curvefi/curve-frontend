import { noop } from 'lodash'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { CheckboxField } from '@ui/features/forms/controls/CheckboxField'
import { HelperMessage, LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput'
import type { QueryProp } from '@ui/features/queries/util'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { type CurveTarget, getCurveLpPriceUsd, getTargetGauge } from '../migration.utils'
import { PoolTokensLabel } from './PoolTokensLabel'

/** The Curve side of a migration form: the expected LP and the option to stake it in the gauge. */
export const CurveTargetFields = ({
  blockchainId,
  target,
  expectedLp,
  stake,
  onStakeChange,
}: {
  blockchainId: string
  target: CurveTarget | undefined
  expectedLp: QueryProp<Decimal>
  stake: boolean
  onStakeChange: (stake: boolean) => void
}) => {
  const lpPriceUsd = maybe(target?.pool, getCurveLpPriceUsd)
  const gauge = maybe(target, getTargetGauge)
  return (
    <>
      <LargeTokenInput
        name="expectedLp"
        label={stake ? t`Staked Curve LP to receive` : t`Curve LP to receive`}
        testId="migration-target"
        balance={expectedLp}
        onBalance={noop}
        inputBalanceUsd={decimal(lpPriceUsd && expectedLp.data && +expectedLp.data * lpPriceUsd)}
        disabled
        tokenSelector={
          target && (
            <PoolTokensLabel
              protocol="curve"
              blockchainId={blockchainId}
              tokens={target.row.tradeableCoins}
              label={target.row.name}
            />
          )
        }
      >
        {!target && <HelperMessage message={t`Select a Curve pool to migrate to.`} isError />}
      </LargeTokenInput>
      <CheckboxField
        checked={stake && !!gauge}
        label={t`Deposit & stake`}
        disabled={!gauge}
        testIdPrefix="migration-stake"
        onChange={({ target: { checked } }) => onStakeChange(checked)}
      />
    </>
  )
}
