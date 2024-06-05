import type { FormType } from '@/components/PageLoanCreate/types'

import { t } from '@lingui/macro'
import { useNavigate, useParams } from 'react-router-dom'

import { getLoanCreatePathname } from '@/utils/utilsRouter'

import { AppFormContent, AppFormContentWrapper, AppFormHeader } from '@/ui/AppForm'
import LoanFormCreate from '@/components/PageLoanCreate/LoanFormCreate'

const LoanCreate = (pageProps: PageContentProps) => {
  const { rOwmId, rFormType } = pageProps
  const params = useParams()
  const navigate = useNavigate()

  // form tabs
  const FORM_TYPES: { key: FormType; label: string }[] = [{ label: t`Create Loan`, key: 'create' }]

  return (
    <AppFormContent variant="primary" shadowed>
      <AppFormHeader
        formTypes={FORM_TYPES}
        activeFormKey={!rFormType ? 'create' : (rFormType as string)}
        handleClick={(key: string) => navigate(getLoanCreatePathname(params, rOwmId, key))}
      />

      <AppFormContentWrapper grid gridRowGap={3} padding margin="1rem 0 0 0">
        {/* FORMS */}
        {rFormType === '' || rFormType === 'create' ? <LoanFormCreate {...pageProps} /> : null}
      </AppFormContentWrapper>
    </AppFormContent>
  )
}

export default LoanCreate
