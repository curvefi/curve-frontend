import { useCallback, useMemo } from 'react'
import LoanFormCreate from '@/lend/components/PageLoanCreate/LoanFormCreate'
import type { FormValues } from '@/lend/components/PageLoanCreate/types'
import { DEFAULT_FORM_VALUES } from '@/lend/components/PageLoanCreate/utils'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { type MarketUrlParams, type PageContentProps } from '@/lend/types/lend.types'
import { getLoanCreatePathname } from '@/lend/utils/utilsRouter'
import { BorrowTabContents } from '@/llamalend/features/borrow/components/BorrowTabContents'
import type { OnBorrowFormUpdate } from '@/llamalend/features/borrow/types'
import Stack from '@mui/material/Stack'
import { AppFormContentWrapper } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'
import { ReleaseChannel } from '@ui-kit/utils'

/**
 * Callback that synchronizes the `ChartOhlc` component with the `RangeSlider` component in the new `BorrowTabContents`.
 */
const useOnFormUpdate = ({ api, market }: PageContentProps): OnBorrowFormUpdate =>
  useCallback(
    async ({ debt, userCollateral, range, slippage, leverageEnabled }) => {
      const { setFormValues, setStateByKeys } = useStore.getState().loanCreate
      const formValues: FormValues = {
        ...DEFAULT_FORM_VALUES,
        n: range,
        debt: `${debt ?? ''}`,
        userCollateral: `${userCollateral ?? ''}`,
      }
      await setFormValues(api, market, formValues, `${slippage}`, leverageEnabled)
      setStateByKeys({ isEditLiqRange: true })
    },
    [api, market],
  )

const LoanCreate = (pageProps: PageContentProps & { params: MarketUrlParams }) => {
  const { rChainId, rOwmId, rFormType, market, params } = pageProps
  const push = useNavigate()
  const [releaseChannel] = useReleaseChannel()
  const onUpdate = useOnFormUpdate(pageProps)

  const resetState = useStore((state) => state.loanCreate.resetState)

  type Tab = 'create' | 'leverage'
  const tabs: TabOption<Tab>[] = useMemo(
    () =>
      releaseChannel === ReleaseChannel.Beta
        ? // the new borrow form contains both create and leverage functionality
          [{ value: 'create' as const, label: t`Borrow` }]
        : [
            { value: 'create' as const, label: t`Create Loan` },
            ...(market?.leverage.hasLeverage() ? [{ value: 'leverage' as const, label: t`Leverage` }] : []),
          ],
    [market?.leverage, releaseChannel],
  )

  return (
    <>
      <TabsSwitcher
        variant="contained"
        size="medium"
        value={!rFormType ? 'create' : rFormType}
        onChange={(key) => {
          resetState({ rChainId, rOwmId, key })
          push(getLoanCreatePathname(params, rOwmId, key))
        }}
        options={tabs}
        fullWidth={releaseChannel !== ReleaseChannel.Beta}
      />
      <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
        <AppFormContentWrapper>
          {releaseChannel === ReleaseChannel.Beta ? (
            <BorrowTabContents
              networks={networks}
              chainId={rChainId}
              market={market ?? undefined}
              onUpdate={onUpdate}
            />
          ) : rFormType === 'leverage' ? (
            <LoanFormCreate isLeverage {...pageProps} />
          ) : (
            <LoanFormCreate {...pageProps} />
          )}
        </AppFormContentWrapper>
      </Stack>
    </>
  )
}

export default LoanCreate
