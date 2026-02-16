import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { StakeOptions } from '@/llamalend/mutations/stake.mutation'
import { LoanFormAlerts } from '@/llamalend/widgets/action-card/LoanFormAlerts'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Button from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { useStakeForm } from '../hooks/useStakeForm'
import { StakeSupplyInfoList } from './StakeSupplyInfoList'

export type StakeFormProps<ChainId extends IChainId> = {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onStaked?: NonNullable<StakeOptions['onStaked']>
}

const TEST_ID_PREFIX = 'supply-stake'

export const StakeForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  onStaked,
}: StakeFormProps<ChainId>) => {
  const network = networks[chainId]

  const {
    form,
    params,
    isPending,
    onSubmit,
    isDisabled,
    vaultToken,
    borrowToken,
    isStaked,
    stakeError,
    txHash,
    formErrors,
    isApproved,
    max,
  } = useStakeForm({
    market,
    network,
    enabled,
    onStaked,
  })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={<StakeSupplyInfoList params={params} networks={networks} tokens={{ borrowToken }} />}
    >
      <LoanFormTokenInput
        label={t`Amount to stake`}
        token={vaultToken}
        blockchainId={network.id}
        name="stakeAmount"
        form={form}
        max={max}
        testId={`${TEST_ID_PREFIX}-input`}
        network={network}
      />

      <Button
        type="submit"
        loading={isPending || !market}
        disabled={isDisabled}
        data-testid={`${TEST_ID_PREFIX}-submit-button`}
      >
        {isPending ? t`Processing...` : notFalsy(isApproved.data === false && t`Approve`, t`Stake`).join(' & ')}
      </Button>

      <LoanFormAlerts
        isSuccess={isStaked}
        error={stakeError}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={['stakeAmount']}
        successTitle={t`Staked successfully`}
      />
    </Form>
  )
}
