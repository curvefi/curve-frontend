import type { FormDisabledAlert, LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { LowSolvencyActionModal } from '@/llamalend/widgets/action-card/LowSolvencyActionModal'
import { StakeTokenLabel } from '@/llamalend/widgets/action-card/StakeTokenLabel'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { AlertDisableForm } from '@ui-kit/shared/ui/AlertDisableForm'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useStakeForm } from '../hooks/useStakeForm'
import { AlertNoGauge } from './alerts/AlertNoGauge'
import { StakeSupplyInfoList } from './StakeSupplyInfoList'

type StakeFormProps<ChainId extends IChainId> = {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  depositDisabledAlert?: FormDisabledAlert
}

const TEST_ID_PREFIX = 'supply-stake'

export const StakeForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  depositDisabledAlert,
}: StakeFormProps<ChainId>) => {
  const network = networks[chainId]
  const blockchainId = network.id

  const {
    form,
    params,
    isPending,
    isLoading,
    onSubmit,
    isDisabled,
    vaultToken,
    borrowToken,
    collateralToken,
    error,
    formErrors,
    isApproved,
    hasGauge,
    max,
    disabledAlert,
    lowSolvencyModalProps,
  } = useStakeForm({ market, network, enabled, depositDisabledAlert })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={<StakeSupplyInfoList form={form} params={params} networks={networks} tokens={{ borrowToken }} />}
    >
      <LoanFormTokenInput
        label={t`Amount to stake`}
        token={vaultToken}
        blockchainId={blockchainId}
        name="stakeAmount"
        form={form}
        max={max}
        testId={`${TEST_ID_PREFIX}-input`}
        network={network}
        tokenSelector={
          <StakeTokenLabel
            blockchainId={blockchainId}
            vaultTokenLabel={vaultToken?.symbol}
            collateralTokenAddress={collateralToken?.address}
            borrowTokenAddress={borrowToken?.address}
          />
        }
      />

      {hasGauge ? (
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
      )}

      <LowSolvencyActionModal {...lowSolvencyModalProps} />

      <FormAlerts error={error} formErrors={formErrors} handledErrors={['stakeAmount']} />
    </Form>
  )
}
