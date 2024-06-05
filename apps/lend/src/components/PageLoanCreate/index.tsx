import type { FormType } from '@/components/PageLoanCreate/types'

import { useMemo } from 'react'
import { t } from '@lingui/macro'
import { useNavigate, useParams } from 'react-router-dom'

import { getLoanCreatePathname } from '@/utils/utilsRouter'

import { AppFormContent, AppFormContentWrapper, AppFormHeader } from '@/ui/AppForm'
import LoanFormCreate from '@/components/PageLoanCreate/LoanFormCreate'
import useStore from '@/store/useStore'

const LoanCreate = (pageProps: PageContentProps) => {
  const { rChainId, rOwmId, rFormType, api, owmData, owmDataCachedOrApi } = pageProps
  const params = useParams()
  const navigate = useNavigate()

  const resetState = useStore((state) => state.loanCreate.resetState)

  // form tabs
  const FORM_TYPES = useMemo(() => {
    let forms: { key: FormType; label: string }[] = [{ label: t`Create Loan`, key: 'create' }]

    if (owmDataCachedOrApi?.hasLeverage) {
      forms.push({ label: t`Leverage`, key: 'leverage' })
    }
    return forms
  }, [owmDataCachedOrApi?.hasLeverage])

  return (
    <AppFormContent variant="primary" shadowed>
      <AppFormHeader
        formTypes={FORM_TYPES}
        activeFormKey={!rFormType ? 'create' : (rFormType as string)}
        handleClick={(key: string) => {
          resetState({ rChainId, rOwmId, key })
          navigate(getLoanCreatePathname(params, rOwmId, key))
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
