import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { CheckboxField } from '@ui/features/forms/controls/CheckboxField'
import { SlippageToleranceActionInfo } from '@ui/features/forms/slippage/SlippageToleranceActionInfo'
import { poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { DISABLED_Q, mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { CREATE_POOL_COLUMNS } from './constants'
import { CreatePoolField } from './CreatePoolField'
import type { CreatePoolLiquidityProps } from './types'

const { Spacing } = SizesAndSpaces

export const CreatePoolLiquidity = ({
  form: { values, update },
  poolTypes,
  maxAmounts,
  totalDepositValueUsd,
  isPending,
  isFunded,
  userAddress,
}: CreatePoolLiquidityProps) => {
  const poolType = poolTypes.find(type => type.id === values.poolType)
  return (
    <Stack
      component="fieldset"
      disabled={isPending || isFunded}
      sx={{ border: 0, padding: 0, margin: 0, minWidth: 0, gap: Spacing.sm }}
    >
      <Typography variant="bodySRegular">{poolType?.liquidityDescription}</Typography>
      <Stack sx={{ ...CREATE_POOL_COLUMNS, gap: Spacing.sm }}>
        {values.tokens.map((token, index) => (
          <Stack key={poolAmountField(index)}>
            <CreatePoolField
              name={poolAmountField(index)}
              label={token?.symbol ?? `${t`Token`} ${index + 1}`}
              unit={token?.symbol}
              placeholder={formatNumber(0, 'token.amount')}
              disabled={isPending || isFunded || !token}
            />
            <ActionInfo
              size="small"
              label={t`Balance`}
              value={mapQuery(maxAmounts?.[index] ?? DISABLED_Q, value => formatNumber(value, 'token.balance'))}
            />
          </Stack>
        ))}
      </Stack>
      <CheckboxField
        checked={values.addLiquidity}
        disabled={isPending || isFunded}
        label={t`Add this liquidity right after deploy`}
        onChange={event => update({ addLiquidity: event.target.checked })}
      />
      <Typography
        variant="bodyXsRegular"
        color="textSecondary"
      >{t`The deposit is signed once the pool exists.`}</Typography>
      {poolType && (
        <SlippageToleranceActionInfo
          size="small"
          maxSlippage={values.slippage}
          userAddress={userAddress}
          type={poolType.slippageType}
          onChanged={settings => update({ slippage: settings[poolType.slippageType] })}
        />
      )}
      <ActionInfo
        size="small"
        label={t`Pool value at deposit`}
        value={mapQuery(totalDepositValueUsd, value => formatNumber(value, 'usd.amount'))}
      />
    </Stack>
  )
}
