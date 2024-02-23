import type { FormType } from '@/components/PageLoanCreate/types'

import { t } from '@lingui/macro'
import { useNavigate, useParams } from 'react-router-dom'

import { getLoanCreatePathname } from '@/utils/utilsRouter'

import { FormContent, FormContentWrapper } from '@/components/SharedFormStyles/styles'
import FormHeader from '@/components/SharedFormStyles/FormHeader'
import LoanFormCreate from '@/components/PageLoanCreate/LoanFormCreate'

const LoanCreate = (pageProps: PageContentProps) => {
  const { rOwmId, rFormType } = pageProps
  const params = useParams()
  const navigate = useNavigate()

  // form tabs
  const FORM_TYPES: { key: FormType; label: string }[] = [{ label: t`Create Loan`, key: 'create' }]

  return (
    <FormContent variant="primary" shadowed>
      <FormHeader
        formTypes={FORM_TYPES}
        activeFormKey={!rFormType ? 'create' : (rFormType as string)}
        handleClick={(key) => navigate(getLoanCreatePathname(params, rOwmId, key))}
      />

      <FormContentWrapper grid gridRowGap={3} padding margin="1rem 0 0 0">
        {/* FORMS */}
        {rFormType === '' || rFormType === 'create' ? <LoanFormCreate {...pageProps} /> : null}
      </FormContentWrapper>
    </FormContent>
  )
}

export default LoanCreate
