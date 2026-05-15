import type { Address } from 'viem'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { HelperMessage, LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { NumericTextField } from '@ui-kit/shared/ui/NumericTextField'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal } from '@ui-kit/utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useRefuelForm } from '../hooks/useRefuelForm'
import type { RefuelConfiguration, RefuelTokens } from '../types'
import { RefuelActionInfos } from './RefuelActionInfos'

const { Spacing } = SizesAndSpaces

export type RefuelFormParams = {
  chainId: number
  blockchainId: string
  poolAddress: Address
  tokens: RefuelTokens
}

export const RefuelForm = ({ chainId, blockchainId, poolAddress, tokens }: RefuelFormParams) => {
  const configurationOptions = [
    { value: 'balanced', label: '50/50' },
    { value: 'tokenA', label: tokens.tokenA.symbol },
    { value: 'tokenB', label: tokens.tokenB.symbol },
    { value: 'custom', label: t`Custom` },
  ] satisfies readonly { value: RefuelConfiguration; label: string }[]

  const {
    form,
    values,
    balances,
    error,
    refuelError,
    formErrors,
    isPending,
    targetRefuelPercentageError,
    tokenAAmountError,
    tokenBAmountError,
    setConfiguration,
    onSubmit,
  } = useRefuelForm({ chainId, poolAddress, tokens })

  const tokenAUsdRate = useTokenUsdRate({ chainId, tokenAddress: tokens.tokenA.address })
  const tokenBUsdRate = useTokenUsdRate({ chainId, tokenAddress: tokens.tokenB.address })

  return (
    <Form {...form} onSubmit={onSubmit} footer={<RefuelActionInfos />}>
      <Stack gap={Spacing.sm}>
        <FormControl>
          <FormLabel>{t`Configuration`}</FormLabel>
          <ToggleButtonGroup
            exclusive
            value={values.configuration}
            onChange={(_, configuration: RefuelConfiguration | null) => {
              if (configuration) setConfiguration(configuration)
            }}
            aria-label={t`Refuel configuration`}
            data-testid="refuel-configuration"
          >
            {configurationOptions.map(({ value, label }) => (
              <ToggleButton key={value} value={value} size="small" sx={{ flex: 1 }}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </FormControl>

        <FormControl error={!!targetRefuelPercentageError}>
          <FormLabel>{t`Target refuel percentage`}</FormLabel>
          <NumericTextField
            variant="outlined" // TODO: needs proper styling cuz the border looks not like the rest of the design
            name="targetRefuelPercentage"
            value={values.targetRefuelPercentage}
            min={decimal(0)}
            max={decimal(100)}
            error={!!targetRefuelPercentageError}
            adornment="percentage"
            disabled={values.configuration !== 'custom'}
            slotProps={{
              htmlInput: { 'aria-label': t`Target refuel percentage`, inputMode: 'numeric', pattern: '[0-9]*' },
            }}
            onChange={value => form.update({ targetRefuelPercentage: decimal(value) })}
          />
          <FormHelperText>
            {targetRefuelPercentageError ?? t`Enter a target refuel percentage, based on current pool TVL`}
          </FormHelperText>
        </FormControl>
      </Stack>

      <Stack gap={Spacing.sm}>
        <Typography variant="headingXsBold">{t`Deposits`}</Typography>

        <LargeTokenInput
          name="tokenAAmount"
          balance={values.tokenAAmount}
          onBalance={tokenAAmount => form.update({ tokenAAmount })}
          isError={!!tokenAAmountError}
          walletBalance={{
            balance: balances.tokenA.data,
            symbol: tokens.tokenA.symbol,
            usdRate: tokenAUsdRate.data,
            loading: balances.tokenA.isLoading,
          }}
          inputBalanceUsd={decimal(
            values.tokenAAmount && tokenAUsdRate.data && tokenAUsdRate.data * +values.tokenAAmount,
          )}
          tokenSelector={
            <TokenLabel
              blockchainId={blockchainId}
              address={tokens.tokenA.address}
              label={tokens.tokenA.symbol}
              tooltip={tokens.tokenA.symbol}
            />
          }
        >
          {tokenAAmountError && (
            <HelperMessage
              message={tokenAAmountError}
              onNumberClick={tokenAAmount => form.update({ tokenAAmount })}
              isError
            />
          )}
        </LargeTokenInput>

        <LargeTokenInput
          name="tokenBAmount"
          balance={values.tokenBAmount}
          onBalance={tokenBAmount => form.update({ tokenBAmount })}
          isError={!!tokenBAmountError}
          walletBalance={{
            balance: balances.tokenB.data,
            symbol: tokens.tokenB.symbol,
            usdRate: tokenBUsdRate.data,
            loading: balances.tokenB.isLoading,
          }}
          inputBalanceUsd={decimal(
            values.tokenBAmount && tokenBUsdRate.data && tokenBUsdRate.data * +values.tokenBAmount,
          )}
          tokenSelector={
            <TokenLabel
              blockchainId={blockchainId}
              address={tokens.tokenB.address}
              label={tokens.tokenB.symbol}
              tooltip={tokens.tokenB.symbol}
            />
          }
        >
          {tokenBAmountError && (
            <HelperMessage
              message={tokenBAmountError}
              onNumberClick={tokenBAmount => form.update({ tokenBAmount })}
              isError
            />
          )}
        </LargeTokenInput>
      </Stack>

      <Button
        type="submit"
        size="large"
        loading={isPending}
        disabled={!form.formState.isValid || isPending}
        data-testid="refuel-submit-button"
      >
        {t`Refuel`}
      </Button>

      <FormAlerts
        error={error || refuelError}
        formErrors={formErrors}
        handledErrors={['targetRefuelPercentage', 'tokenAAmount', 'tokenBAmount']}
      />
    </Form>
  )
}
