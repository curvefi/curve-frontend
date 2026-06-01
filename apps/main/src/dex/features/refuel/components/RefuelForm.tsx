import type { Address } from 'viem'
import { useConnection } from 'wagmi'
import type { Chain } from '@curvefi/prices-api'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { ConnectWalletButton } from '@ui-kit/features/connect-wallet/ui/ConnectWalletButton'
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

export interface RefuelFormParams {
  chainId: number
  blockchainId: Chain
  poolAddress: Address
}

export const RefuelForm = ({ chainId, blockchainId, poolAddress }: RefuelFormParams) => {
  const { isConnected, isConnecting } = useConnection()
  const { connect } = useWallet()

  const { form, values, tokenA, tokenB, poolTvl, refuelError, formErrors, isPending, isDisabled, onSubmit } =
    useRefuelForm({
      chainId,
      blockchainId,
      poolAddress,
    })

  return (
    <Form
      {...form}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
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

      {isConnected ? (
        <Button type="submit" size="large" loading={isPending} disabled={isDisabled} data-testid="refuel-submit-button">
          {t`Refuel`}
        </Button>
      ) : (
        <ConnectWalletButton
          type="button"
          size="large"
          loading={isConnecting}
          onClick={() => void connect()}
          data-testid="refuel-connect-wallet-button"
        />
      )}

      <FormAlerts error={refuelError} formErrors={formErrors} handledErrors={['tokenAAmount', 'tokenBAmount']} />
    </Form>
  )
}
