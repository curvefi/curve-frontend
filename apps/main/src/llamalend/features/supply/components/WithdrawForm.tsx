import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useWithdrawForm } from '../hooks/useWithdrawForm'
import { AlertUnstakeFirst } from './alerts/AlertUnstakeFirst'
import { WithdrawSupplyInfoList } from './WithdrawSupplyInfoList'

export type WithdrawFormProps<ChainId extends IChainId> = {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
}

const TEST_ID_PREFIX = 'supply-withdraw'

export const WithdrawForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
}: WithdrawFormProps<ChainId>) => {
  const network = networks[chainId]

  const {
    form,
    params,
    isPending,
    onSubmit,
    isDisabled,
    borrowToken,
    withdrawError,
    formErrors,
    max,
    maxStakedShares,
    isFull,
  } = useWithdrawForm({ market, network, enabled })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={<WithdrawSupplyInfoList form={form} params={params} networks={networks} tokens={{ borrowToken }} />}
    >
      <LoanFormTokenInput
        label={t`Amount to withdraw`}
        token={borrowToken}
        blockchainId={network.id}
        name="withdrawAmount"
        form={form}
        max={max}
        testId={`${TEST_ID_PREFIX}-input`}
        network={network}
        positionBalance={{
          position: max,
          tooltip: t`Vault shares value`,
        }}
      />

      {max.data && maxStakedShares.data && Number(max.data) === 0 && Number(maxStakedShares.data) > 0 && (
        <AlertUnstakeFirst />
      )}

      <Button
        type="submit"
        loading={isPending || !market}
        disabled={isDisabled}
        data-testid={`${TEST_ID_PREFIX}-submit-button`}
      >
        {isPending ? t`Processing...` : notFalsy(t`Withdraw`, isFull.data && t`All`).join(' ')}
      </Button>

      <FormAlerts error={withdrawError} formErrors={formErrors} handledErrors={['withdrawAmount']} />
    </Form>
  )
}
