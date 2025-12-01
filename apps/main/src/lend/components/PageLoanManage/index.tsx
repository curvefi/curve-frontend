import { useEffect, useMemo, useState } from 'react'
import LoanBorrowMore from '@/lend/components/PageLoanManage/LoanBorrowMore'
import LoanCollateralAdd from '@/lend/components/PageLoanManage/LoanCollateralAdd'
import LoanCollateralRemove from '@/lend/components/PageLoanManage/LoanCollateralRemove'
import LoanRepay from '@/lend/components/PageLoanManage/LoanRepay'
import LoanSelfLiquidation from '@/lend/components/PageLoanManage/LoanSelfLiquidation'
import type { CollateralFormType, LeverageFormType, LoanFormType } from '@/lend/components/PageLoanManage/types'
import networks from '@/lend/networks'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { getLoanManagePathname } from '@/lend/utils/utilsRouter'
import { AddCollateralForm } from '@/llamalend/features/manage-loan/components/AddCollateralForm'
import { RemoveCollateralForm } from '@/llamalend/features/manage-loan/components/RemoveCollateralForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import type { BorrowPositionDetailsProps } from '@/llamalend/features/market-position-details'
import Stack from '@mui/material/Stack'
import { AppFormContentWrapper } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { useManageLoanMuiForm } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { type TabOption, TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MaxWidth } = SizesAndSpaces

type OldTab = 'loan' | 'collateral' | 'leverage'
type NewTab = 'loan' | 'repay' | 'collateral'

const oldMenu = {
  loan: {value: 'loan' as const, label: t`Loan`,
    subtabs: [
      { value: 'loan-increase', label: t`Borrow more` },
      { value: 'loan-decrease', label: t`Repay` },
      { value: 'loan-liquidate', label: t`Self-liquidate` },
    ] satisfies TabOption<LoanFormType>[],
  },
  collateral: {
    subtabs: [value: 'collateral' as const, label: t`Collateral`,
      { value: 'collateral-increase', label: t`Add collateral` },
      { value: 'collateral-decrease', label: t`Remove collateral` },
    ] satisfies TabOption<CollateralFormType>[],
            ...(market?.leverage?.hasLeverage() ? [{ value: 'leverage' as const, label: t`Leverage` }] : []),
  },
} satisfies Record<OldTab, any>

type ManageLoanProps = PageContentProps & { params: MarketUrlParams } & {
  borrowPositionDetails: BorrowPositionDetailsProps
}

const ManageLoan = (pageProps: ManageLoanProps) => {
  const { rChainId, rOwmId, rFormType, market, params, isLoaded, borrowPositionDetails } = pageProps
  const push = useNavigate()
  const shouldUseManageLoanMuiForm = useManageLoanMuiForm()
  const useMuiForm = shouldUseManageLoanMuiForm && !!market
  const isLeveragedPosition = borrowPositionDetails.leverage?.value && borrowPositionDetails.leverage.value > 1

  const tabsLoanMui: TabOption<LoanFormType>[] = useMemo(
    () => [
      { value: 'loan-increase', label: t`Borrow` },
      { value: 'loan-repay-wallet', label: t`Repay from wallet` },
      { value: 'loan-repay-collateral', label: t`Repay from collateral` },
      { value: 'loan-decrease', label: t`Repay` },
      { value: 'loan-liquidate', label: t`Self-liquidate` },
    ],
    [leverageEnabled],
  )

  const tabs: TabOption<Tab>[] = useMemo(
    () =>
      useMuiForm
        ? [
            { value: 'loan' as const, label: t`Loan` },
            { value: 'repay' as const, label: isLeveragedPosition ? t`Delever` : t`Repay` },
            { value: 'collateral' as const, label: t`Collateral` },
          ]
        : [
            { value: 'loan' as const, label: t`Loan` },
            { value: 'collateral' as const, label: t`Collateral` },
            ...(market?.leverage?.hasLeverage() ? [{ value: 'leverage' as const, label: t`Leverage` }] : []),
          ],
    [market?.leverage],
  )

  type SubTab = LoanFormType | CollateralFormType | LeverageFormType
  const [subTab, setSubTab] = useState<SubTab | undefined>('loan-increase')

  const subTabs = useMemo(
    () =>
      !rFormType || rFormType === 'loan'
        ? useMuiForm
          ? tabsLoanMui
          : tabsLoan
        : rFormType === 'collateral'
          ? tabsCollateral
          : [],
    [rFormType, tabsLoanMui, useMuiForm],
  )

  useEffect(() => setSubTab(subTabs[0]?.value), [subTabs])

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
        value={!rFormType ? 'loan' : rFormType}
        onChange={(key) => push(getLoanManagePathname(params, rOwmId, key))}
        options={tabs}
      />
      {useMuiForm ? (
        <>
          <TabsSwitcher
            variant="underlined"
            size="small"
            value={subTab}
            onChange={setSubTab}
            options={subTabs}
            fullWidth
          />

          {subTab === 'loan-increase' && (
            <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
              <AppFormContentWrapper>
                <LoanBorrowMore {...pageProps} />
              </AppFormContentWrapper>
            </Stack>
          )}
          {subTab === 'loan-decrease' && market && (
            <RepayForm
              networks={networks}
              chainId={rChainId}
              market={market}
              enabled={isLoaded}
              // No extra side effects required for legacy store; llamalend hooks handle cache invalidation.
              onRepaid={async () => {}}
            />
          )}
          {subTab === 'loan-liquidate' && <LoanSelfLiquidation {...pageProps} />}
          {subTab === 'collateral-increase' && market && (
            <AddCollateralForm
              networks={networks}
              chainId={rChainId}
              market={market}
              enabled={isLoaded}
              onAdded={async () => {}}
            />
          )}
          {subTab === 'collateral-decrease' && market && (
            <RemoveCollateralForm
              networks={networks}
              chainId={rChainId}
              market={market}
              enabled={isLoaded}
              onRemoved={async () => {}}
            />
          )}
          {/** Leverage has no subtabs */}
          {rFormType === 'leverage' && (
            <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
              <AppFormContentWrapper>
                <LoanBorrowMore isLeverage {...pageProps} />
              </AppFormContentWrapper>
            </Stack>
          )}
        </>
      ) : (
        <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
          <TabsSwitcher
            variant="underlined"
            size="small"
            value={subTab}
            onChange={setSubTab}
            options={subTabs}
            fullWidth
          />

          <AppFormContentWrapper>
            {subTab === 'loan-increase' && <LoanBorrowMore {...pageProps} />}
            {subTab === 'loan-decrease' && <LoanRepay {...pageProps} />}
            {subTab === 'loan-liquidate' && <LoanSelfLiquidation {...pageProps} />}
            {subTab === 'collateral-increase' && <LoanCollateralAdd {...pageProps} />}
            {subTab === 'collateral-decrease' && <LoanCollateralRemove {...pageProps} />}
            {/** Leverage has no subtabs */}
            {rFormType === 'leverage' && <LoanBorrowMore isLeverage {...pageProps} />}
          </AppFormContentWrapper>
        </Stack>
      )}
    </Stack>
  )
}

export default ManageLoan
