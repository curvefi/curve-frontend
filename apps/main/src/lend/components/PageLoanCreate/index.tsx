import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import LoanFormCreate from '@/lend/components/PageLoanCreate/LoanFormCreate'
import type { FormType } from '@/lend/components/PageLoanCreate/types'
import useStore from '@/lend/store/useStore'
import { type MarketUrlParams, type PageContentProps } from '@/lend/types/lend.types'
import { getLoanCreatePathname } from '@/lend/utils/utilsRouter'
import { AppFormContent, AppFormContentWrapper, AppFormHeader } from '@ui/AppForm'
import { t } from '@ui-kit/lib/i18n'

const LoanCreate = (pageProps: PageContentProps & { params: MarketUrlParams }) => {
  const { rChainId, rOwmId, rFormType, market, params } = pageProps
  const { push } = useRouter()

  const resetState = useStore((state) => state.loanCreate.resetState)
  const { initCampaignRewards, initiated } = useStore((state) => state.campaigns)

  // form tabs
  const FORM_TYPES = useMemo(() => {
    const forms: { key: FormType; label: string }[] = [{ label: t`Create Loan`, key: 'create' }]

    if (market?.leverage.hasLeverage()) {
      forms.push({ label: t`Leverage`, key: 'leverage' })
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
    <AppFormContent variant="primary" shadowed>
      <AppFormHeader
        formTypes={FORM_TYPES}
        activeFormKey={!rFormType ? 'create' : (rFormType as string)}
        handleClick={(key: string) => {
          resetState({ rChainId, rOwmId, key })
          push(getLoanCreatePathname(params, rOwmId, key))
        }}
      />

      <AppFormContentWrapper grid gridRowGap={3} padding margin="1rem 0 0 0">
        {/* FORMS */}
        {(rFormType === '' || rFormType === 'create') && <LoanFormCreate {...pageProps} />}
        {rFormType === 'leverage' && <LoanFormCreate isLeverage {...pageProps} />}
      </AppFormContentWrapper>
    </AppFormContent>
  )
}

export default LoanCreate
