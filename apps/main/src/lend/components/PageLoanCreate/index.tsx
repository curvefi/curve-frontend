import { useEffect, useMemo } from 'react'
import LoanFormCreate from '@/lend/components/PageLoanCreate/LoanFormCreate'
import type { FormType } from '@/lend/components/PageLoanCreate/types'
import useStore from '@/lend/store/useStore'
import { type MarketUrlParams, type PageContentProps } from '@/lend/types/lend.types'
import { getLoanCreatePathname } from '@/lend/utils/utilsRouter'
import { AppFormContent, AppFormContentWrapper } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'

const LoanCreate = (pageProps: PageContentProps & { params: MarketUrlParams }) => {
  const { rChainId, rOwmId, rFormType, market, params } = pageProps
  const push = useNavigate()

  const resetState = useStore((state) => state.loanCreate.resetState)
  const { initCampaignRewards, initiated } = useStore((state) => state.campaigns)

  // form tabs
  const FORM_TYPES = useMemo(() => {
    const forms: { value: FormType; label: string }[] = [{ value: 'create', label: t`Create Loan` }]

    if (market?.leverage.hasLeverage()) {
      forms.push({ value: 'leverage', label: t`Leverage` })
    }
    return forms
  }, [market?.leverage])

  // init campaignRewardsMapper
  useEffect(() => {
    if (!initiated) {
      initCampaignRewards(rChainId)
    }
  }, [initCampaignRewards, rChainId, initiated])

  return (
    <AppFormContent variant="primary">
      <TabsSwitcher
        variant="contained"
        size="medium"
        value={!rFormType ? 'create' : rFormType}
        onChange={(key) => {
          resetState({ rChainId, rOwmId, key })
          push(getLoanCreatePathname(params, rOwmId, key))
        }}
        options={FORM_TYPES}
      />

      <AppFormContentWrapper>
        {/* FORMS */}
        {(rFormType === '' || rFormType === 'create') && <LoanFormCreate {...pageProps} />}
        {rFormType === 'leverage' && <LoanFormCreate isLeverage {...pageProps} />}
      </AppFormContentWrapper>
    </AppFormContent>
  )
}

export default LoanCreate
