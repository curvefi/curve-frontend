import { useConnection } from 'wagmi'
import type { MarketTokens } from '@/llamalend/llama.utils'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { LowSolvencyActionModal } from '@/llamalend/widgets/action-card/LowSolvencyActionModal'
import { StakeTokenLabel } from '@/llamalend/widgets/action-card/StakeTokenLabel'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import type { Address, Token } from '@primitives/address.utils'
import { notFalsy } from '@primitives/objects.utils'
import { ConnectWalletButton } from '@ui-kit/features/connect-wallet/ui/ConnectWalletButton'
import { t } from '@ui-kit/lib/i18n'
import { AlertDisableForm } from '@ui-kit/shared/ui/AlertDisableForm'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useStakeForm } from '../hooks/useStakeForm'
import { AlertNoGauge } from './alerts/AlertNoGauge'
import { StakeSupplyInfoList } from './StakeSupplyInfoList'

type StakeFormProps<ChainId extends IChainId> = {
  marketId: string | undefined
  controllerAddress: Address | undefined
  tokens: Partial<MarketTokens>
  vaultToken: Token | undefined
  gaugeAddress: Address | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
}

const TEST_ID_PREFIX = 'supply-stake'

export const StakeForm = <ChainId extends IChainId>({
  marketId,
  controllerAddress,
  tokens,
  vaultToken,
  gaugeAddress,
  networks,
  chainId,
  enabled,
}: StakeFormProps<ChainId>) => {
  const { isConnected } = useConnection()
  const network = networks[chainId]
  const blockchainId = network.id

  const {
    form,
    params,
    isPending,
    isLoading,
    onSubmit,
    isDisabled,
    vaultToken: stakeVaultToken,
    borrowToken,
    collateralToken,
    error,
    formErrors,
    isApproved,
    hasGauge,
    max,
    disabledAlert,
    solvencyModal: { onConfirm, onClose, isOpen },
  } = useStakeForm({ marketId, controllerAddress, tokens, vaultToken, gaugeAddress, network, enabled })

  return (
    <Form
      {...form}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
      onSubmit={onSubmit}
      footer={
        <StakeSupplyInfoList
          form={form}
          params={params}
          networks={networks}
          tokens={{ borrowToken }}
          controllerAddress={controllerAddress}
        />
      }
    >
      <LoanFormTokenInput
        label={t`Amount to stake`}
        token={stakeVaultToken}
        blockchainId={blockchainId}
        name="stakeAmount"
        form={form}
        max={max}
        testId={`${TEST_ID_PREFIX}-input`}
        network={network}
        tokenSelector={
          <StakeTokenLabel
            blockchainId={blockchainId}
            vaultTokenLabel={stakeVaultToken?.symbol}
            collateralTokenAddress={collateralToken?.address}
            borrowTokenAddress={borrowToken?.address}
          />
        }
      />

      {isConnected ? (
        hasGauge ? (
          disabledAlert ? (
            <AlertDisableForm>{disabledAlert.message}</AlertDisableForm>
          ) : (
            <Button
              type="submit"
              loading={isLoading}
              disabled={isDisabled}
              data-testid={`${TEST_ID_PREFIX}-submit-button`}
            >
              {isPending ? t`Processing...` : notFalsy(isApproved.data === false && t`Approve`, t`Stake`).join(' & ')}
            </Button>
          )
        ) : (
          <AlertNoGauge />
        )
      ) : (
        <ConnectWalletButton />
      )}

      <LowSolvencyActionModal
        action="stake"
        open={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        tokenSymbol={stakeVaultToken?.symbol}
      />

      <FormAlerts error={error} formErrors={formErrors} handledErrors={['stakeAmount']} />
    </Form>
  )
}
