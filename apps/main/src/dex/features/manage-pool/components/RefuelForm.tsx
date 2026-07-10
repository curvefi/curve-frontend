import type { Address } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { FormButton } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { HelperMessage, LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal } from '@ui-kit/utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useRefuelForm } from '../hooks/useRefuelForm'
import { RefuelFormList } from './RefuelFormList'

const { Spacing } = SizesAndSpaces

export type RefuelFormParams = {
  chainId: number
  blockchainId: Chain
  poolAddress: Address
}

export const RefuelForm = ({ chainId, blockchainId, poolAddress }: RefuelFormParams) => {
  const { form, values, tokenA, tokenB, poolTvl, refuelError, formErrors, isPending, isDisabled, onSubmit } =
    useRefuelForm({
      chainId,
      blockchainId,
      poolAddress,
    })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={<RefuelFormList values={values} tokenA={tokenA} tokenB={tokenB} poolTvl={poolTvl} />}
    >
      <Stack sx={{ gap: Spacing.sm }}>
        <LargeTokenInput
          name="tokenAAmount"
          balance={values.tokenAAmount}
          onBalance={tokenAAmount => form.update({ tokenAAmount })}
          isError={!!tokenA.amountError}
          walletBalance={tokenA}
          inputBalanceUsd={decimal(values.tokenAAmount && tokenA.usdRate && tokenA.usdRate * +values.tokenAAmount)}
          tokenSelector={
            <TokenLabel
              blockchainId={blockchainId}
              address={tokenA.address}
              label={tokenA.symbol ?? '?'}
              tooltip={tokenA.symbol}
            />
          }
        >
          {tokenA.amountError && (
            <HelperMessage
              message={tokenA.amountError}
              onNumberClick={tokenAAmount => form.update({ tokenAAmount })}
              isError
            />
          )}
        </LargeTokenInput>

        <LargeTokenInput
          name="tokenBAmount"
          balance={values.tokenBAmount}
          onBalance={tokenBAmount => form.update({ tokenBAmount })}
          isError={!!tokenB.amountError}
          walletBalance={tokenB}
          inputBalanceUsd={decimal(values.tokenBAmount && tokenB.usdRate && tokenB.usdRate * +values.tokenBAmount)}
          tokenSelector={
            <TokenLabel
              blockchainId={blockchainId}
              address={tokenB.address}
              label={tokenB.symbol ?? '?'}
              tooltip={tokenB.symbol}
            />
          }
        >
          {tokenB.amountError && (
            <HelperMessage
              message={tokenB.amountError}
              onNumberClick={tokenBAmount => form.update({ tokenBAmount })}
              isError
            />
          )}
        </LargeTokenInput>
      </Stack>

      <FormButton
        pending={isPending}
        disabled={isDisabled}
        connectWalletTestId="refuel-connect-wallet-button"
        label={t`Refuel`}
        testId="refuel-submit-button"
      />

      <FormAlerts error={refuelError} formErrors={formErrors} handledErrors={['tokenAAmount', 'tokenBAmount']} />
    </Form>
  )
}
