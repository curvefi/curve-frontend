import { useEffect, useMemo } from 'react'
import LoanFormCreate from '@/lend/components/PageLoanCreate/LoanFormCreate'
import useStore from '@/lend/store/useStore'
import { type MarketUrlParams, type PageContentProps } from '@/lend/types/lend.types'
import { getLoanCreatePathname } from '@/lend/utils/utilsRouter'
import Stack from '@mui/material/Stack'
import { AppFormContentWrapper } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'

const LoanCreate = (pageProps: PageContentProps & { params: MarketUrlParams }) => {
  const { rChainId, rOwmId, rFormType, market, params } = pageProps
  const push = useNavigate()

  const resetState = useStore((state) => state.loanCreate.resetState)
  const { initCampaignRewards, initiated } = useStore((state) => state.campaigns)

  type Tab = 'create' | 'leverage'
  const tabs: TabOption<Tab>[] = useMemo(
    () => [
      { value: 'create' as const, label: t`Create Loan` },
      ...(market?.leverage.hasLeverage() ? [{ value: 'leverage' as const, label: t`Leverage` }] : []),
    ],
    [market?.leverage],
  )

  // init campaignRewardsMapper
  useEffect(() => {
    if (!initiated) {
      initCampaignRewards(rChainId)
    }
  }, [initCampaignRewards, rChainId, initiated])

  return (
    <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
      <TabsSwitcher
        variant="contained"
        size="medium"
        value={!rFormType ? 'create' : rFormType}
        onChange={(key) => {
          resetState({ rChainId, rOwmId, key })
          push(getLoanCreatePathname(params, rOwmId, key))
        }}
        options={tabs}
        fullWidth
      />

      <AppFormContentWrapper>
        {(rFormType === '' || rFormType === 'create') && <LoanFormCreate {...pageProps} />}
        {rFormType === 'leverage' && <LoanFormCreate isLeverage {...pageProps} />}
      </AppFormContentWrapper>
    </Stack>
  )
}

export default LoanCreate
