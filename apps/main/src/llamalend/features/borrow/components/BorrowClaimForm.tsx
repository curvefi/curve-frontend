import type { NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { EvmFormButton } from '@evm-ui/features/forms/EvmFormButton'
import { EvmDataTable } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import { Form } from '@ui/features/forms/components/Form'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { t } from '@ui/lib/i18n'
import { useMarketContext } from '../../market-context'
import { TotalNotionalRow } from '../../supply/components/columns/notional-cells'
import { useBorrowClaimForm } from '../hooks/useBorrowClaimForm'
import { BorrowClaimActionInfoList } from './BorrowClaimActionInfoList'

type BorrowClaimFormProps<ChainId extends IChainId> = { networks: NetworkDict<ChainId> }

const TEST_ID_PREFIX = 'borrow-claim'

export const BorrowClaimForm = <ChainId extends IChainId>({ networks }: BorrowClaimFormProps<ChainId>) => {
  const { chainId } = useMarketContext<ChainId>()
  const {
    form,
    params,
    userAddress,
    table,
    claimableTokens,
    totalNotionals,
    usdRateLoading,
    isLoading,
    onSubmit,
    isDisabled,
    isPending,
    errors,
  } = useBorrowClaimForm({ network: networks[chainId] })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={<BorrowClaimActionInfoList params={params} isOpen={!!claimableTokens.length} />}
    >
      <EvmDataTable
        category="form"
        table={table}
        emptyState={{ title: t`No rewards to claim`, testId: `${TEST_ID_PREFIX}-empty-state` }}
        footerRow={
          !!claimableTokens.length &&
          !isLoading && (
            <TotalNotionalRow
              sx={{ backgroundColor: t => t.design.Table.Row.Hover }}
              totalNotionals={totalNotionals}
              isNotionalLoading={usdRateLoading}
            />
          )
        }
      />
      <EvmFormButton
        fullWidth
        pending={isPending}
        loading={isLoading}
        disabled={isDisabled}
        label={t`Claim CRV rewards`}
        testId={`${TEST_ID_PREFIX}-crv-rewards-submit-button`}
      />
      <FormAlerts error={errors.find(Boolean) ?? null} formErrors={[]} handledErrors={[]} userAddress={userAddress} />
    </Form>
  )
}
