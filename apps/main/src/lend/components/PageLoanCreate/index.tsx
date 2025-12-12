import { useCallback, useMemo } from 'react'
import LoanFormCreate from '@/lend/components/PageLoanCreate/LoanFormCreate'
import type { FormValues } from '@/lend/components/PageLoanCreate/types'
import { DEFAULT_FORM_VALUES } from '@/lend/components/PageLoanCreate/utils'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { type MarketUrlParams, type PageContentProps } from '@/lend/types/lend.types'
import { getLoanCreatePathname } from '@/lend/utils/utilsRouter'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { OnBorrowFormUpdate } from '@/llamalend/features/borrow/types'
import Stack from '@mui/material/Stack'
import { AppFormContentWrapper } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { useCreateLoanMuiForm } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useThrottle } from '@ui-kit/utils/timers'

const { MaxWidth } = SizesAndSpaces

/**
 * Callback that synchronizes the `ChartOhlc` component with the `RangeSlider` component in the new `BorrowTabContents`.
 */
const useOnFormUpdate = ({ api, market }: PageContentProps): OnBorrowFormUpdate => {
  const setFormValues = useThrottle(useStore((store) => store.loanCreate.setFormValues))
  const setStateByKeys = useThrottle(useStore((store) => store.loanCreate.setStateByKeys))
  return useCallback(
    async ({ debt, userCollateral, range, slippage, leverageEnabled }) => {
      const formValues: FormValues = {
        ...DEFAULT_FORM_VALUES,
        n: range,
        debt: `${debt ?? ''}`,
        userCollateral: `${userCollateral ?? ''}`,
      }
      await setFormValues(api, market, formValues, `${slippage}`, leverageEnabled)
      setStateByKeys({ isEditLiqRange: true })
    },
    [api, market, setFormValues, setStateByKeys],
  )
}

const LoanCreate = (pageProps: PageContentProps & { params: MarketUrlParams }) => {
  const { rChainId, rOwmId, rFormType, market, params, api } = pageProps
  const push = useNavigate()
  const shouldUseBorrowUnifiedForm = useCreateLoanMuiForm()
  const onUpdate = useOnFormUpdate(pageProps)

  const onLoanCreated = useStore((state) => state.loanCreate.onLoanCreated)
  const resetState = useStore((state) => state.loanCreate.resetState)

  type Tab = 'create' | 'leverage'
  const tabs: TabOption<Tab>[] = useMemo(
    () =>
      shouldUseBorrowUnifiedForm
        ? // the new borrow form contains both create and leverage functionality
          [{ value: 'create' as const, label: t`Borrow` }]
        : [
            { value: 'create' as const, label: t`Create Loan` },
            ...(market?.leverage.hasLeverage() ? [{ value: 'leverage' as const, label: t`Leverage` }] : []),
          ],
    [market?.leverage, shouldUseBorrowUnifiedForm],
  )

  const onCreated = useCallback(
    async () => api && market && (await onLoanCreated(api, market)),
    [api, market, onLoanCreated],
  )

  return (
    <Stack
      sx={{
        width: { mobile: '100%', tablet: MaxWidth.actionCard },
        marginInline: { mobile: 'auto', desktop: 0 },
      }}
    >
      <TabsSwitcher
        variant="contained"
        size="medium"
        value={!rFormType ? 'create' : rFormType}
        onChange={(key) => {
          resetState({ rChainId, rOwmId, key })
          push(getLoanCreatePathname(params, rOwmId, key))
        }}
        options={tabs}
      />
      {shouldUseBorrowUnifiedForm ? (
        <CreateLoanForm
          networks={networks}
          chainId={rChainId}
          market={market ?? undefined}
          onUpdate={onUpdate}
          onCreated={onCreated}
        />
      ) : (
        <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
          <AppFormContentWrapper>
            <LoanFormCreate isLeverage={rFormType === 'leverage'} {...pageProps} />
          </AppFormContentWrapper>
        </Stack>
      )}
    </Stack>
  )
}

export default LoanCreate
