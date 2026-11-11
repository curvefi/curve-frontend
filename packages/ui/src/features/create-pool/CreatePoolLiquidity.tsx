import Stack from '@mui/material/Stack'
import { formatNumber } from '@primitives/number.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { CheckboxField } from '@ui/features/forms/controls/CheckboxField'
import { poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { DISABLED_Q, mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { getCreatePoolTokens } from './create-pool.utils'
import { CreatePoolField } from './CreatePoolField'
import type { CreatePoolLiquidityProps } from './types'

const { Spacing } = SizesAndSpaces

export const CreatePoolLiquidity = ({
  form: { values, update },
  maxAmounts,
  totalDepositValueUsd,
  inputsDisabled,
}: CreatePoolLiquidityProps) => (
  <Stack
    component="fieldset"
    disabled={inputsDisabled}
    sx={{ border: 0, padding: 0, margin: 0, minWidth: 0, gap: Spacing.sm }}
  >
    <CheckboxField
      testIdPrefix="create-pool-seed"
      checked={values.addLiquidity}
      disabled={inputsDisabled}
      label={t`Seed pool after deployment`}
      onChange={event => update({ addLiquidity: event.target.checked })}
    />
    {values.addLiquidity && (
      <>
        <Stack sx={{ gap: Spacing.sm }}>
          {getCreatePoolTokens(values, values.tokenCount).map((token, index) => (
            <Stack key={poolAmountField(index)} data-testid="create-pool-liquidity-input">
              <CreatePoolField
                name={poolAmountField(index)}
                label={token?.symbol ?? `${t`Token`} ${index + 1}`}
                unit={token?.symbol}
                placeholder={formatNumber(0, 'token.amount')}
                disabled={inputsDisabled || !token}
              />
              {token && (
                <ActionInfo
                  size="small"
                  label={t`Balance`}
                  value={mapQuery(maxAmounts?.[index] ?? DISABLED_Q, value => formatNumber(value, 'token.balance'))}
                />
              )}
            </Stack>
          ))}
        </Stack>
        {values.poolType && (
          <ActionInfo
            size="small"
            label={t`Pool TVL at deposit`}
            value={mapQuery(totalDepositValueUsd, value => formatNumber(value, 'usd.amount'))}
          />
        )}
      </>
    )}
  </Stack>
)
