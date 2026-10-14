import { useMarketAlert } from '@/llamalend/features/market-list/hooks/useMarketAlert'
import { useMaxDepositTokenValues } from '@/llamalend/features/supply/hooks/useMaxDeposit'
import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import { useDepositMutation } from '@/llamalend/mutations/deposit.mutation'
import { useDepositIsApproved } from '@/llamalend/queries/supply/supply-deposit-approved.query'
import {
  type DepositForm,
  depositFormValidationSuite,
  DepositParams,
} from '@/llamalend/queries/validation/supply.validation'
import { useLowSolvencyAction } from '@/llamalend/widgets/action-card/hooks/useLowSolvencyAction'
import { marketFormActions } from '@/llamalend/widgets/action-card/marketFormActions'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useForm } from '@ui/features/forms'
import { q } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { useMarketContext } from '../../market-context'

const userDefaultValues = { depositAmount: undefined }

const emptyDepositForm = (): DepositForm => ({ ...userDefaultValues, maxDepositAmount: undefined })

const formOptions = { validation: depositFormValidationSuite, defaultValues: emptyDepositForm() }
export const useDepositForm = <ChainId extends LlamaChainId>({ network }: { network: LlamaNetwork<ChainId> }) => {
  const { marketId, controllerAddress, tokens, marketType, userAddress } = useMarketContext<ChainId>()
  const { chainId } = network
  const marketAlert = useMarketAlert(chainId, controllerAddress, marketType)

  const { borrowToken } = tokens

  const form = useForm<DepositForm>(formOptions)

  const depositAmount = form.watchValue('depositAmount')
  const [params, isDebouncing] = useFormDebounce(
    { chainId, marketId, userAddress, depositAmount } satisfies DepositParams<ChainId>,
    userDefaultValues,
  )

  const {
    onSubmit: deposit,
    isPending: isDepositing,
    error: depositError,
  } = useDepositMutation({ marketId, network, onReset: () => form.reset(userDefaultValues), userAddress })

  const { onSubmit, solvencyModal, solvencyAlert, ...formActions } = marketFormActions({
    handleSubmit: form.handleSubmit,
    lowSolvency: useLowSolvencyAction({ controllerAddress, marketType, chainId }),
    onConfirmed: deposit,
  })

  const disabledAlert = (marketAlert?.isDepositDisabled ? marketAlert : undefined) ?? solvencyAlert
  const { formState } = form

  const isPending = formState.isSubmitting || isDepositing
  return {
    form,
    params,
    isPending,
    isLoading: isPending || !marketId || formActions.isLoading,
    onSubmit,
    isDisabled: !!disabledAlert || !formState.isValid || isPending || isDebouncing,
    userAddress,
    borrowToken,
    error: formActions.error ?? depositError,
    max: useMaxDepositTokenValues({ params, borrowToken: borrowToken?.address, form }),
    isApproved: q(useDepositIsApproved(params)),
    formErrors: formState.visibleErrors,
    disabledAlert,
    solvencyModal,
  }
}
