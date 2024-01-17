import type { FormType, PageLoanCreateProps } from '@/components/PageLoanCreate/types'

import { t } from '@lingui/macro'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import isUndefined from 'lodash/isUndefined'
import styled from 'styled-components'

import { getLoanCreatePathname, getLoanManagePathname } from '@/utils/utilsRouter'
import { hasLeverage } from '@/components/PageLoanCreate/utils'
import useCollateralAlert from '@/hooks/useCollateralAlert'

import Box from '@/ui/Box'
import IconButton from '@/ui/IconButton'
import LoanFormCreate from '@/components/PageLoanCreate/LoanFormCreate'
import Tabs, { Tab, TabContentWrapper } from '@/ui/Tab'

const LoanCreate = ({
  fetchInitial,
  ...props
}: PageLoanCreateProps & {
  loanExists: boolean | undefined
  fetchInitial: (curve: Curve, isLeverage: boolean, llamma: Llamma) => void
}) => {
  const { curve, llamma, loanExists, params, rCollateralId, rFormType } = props
  const navigate = useNavigate()
  const collateralAlert = useCollateralAlert(llamma?.address)

  const FORM_TYPES: { key: FormType; label: string }[] = [
    { label: t`Create Loan`, key: 'create' },
    { label: t`Leverage`, key: 'leverage' },
  ]

  const handleTabClick = useCallback(
    (formType: FormType) => {
      if (loanExists) {
        navigate(getLoanManagePathname(params, rCollateralId, 'loan'))
      } else {
        if (curve && llamma) {
          fetchInitial(curve, formType === 'leverage', llamma)
        }
        navigate(getLoanCreatePathname(params, rCollateralId, formType))
      }
    },
    [curve, fetchInitial, llamma, loanExists, navigate, params, rCollateralId]
  )

  return (
    <FormContent variant="primary" shadowed>
      <Header>
        <Tabs>
          {FORM_TYPES.map(({ key, label }) => {
            return key === 'create' || (key === 'leverage' && hasLeverage(llamma)) ? (
              <Tab
                key={key}
                className={!rFormType && key === 'create' ? 'active' : rFormType === key ? 'active' : ''}
                disabled={isUndefined(loanExists)}
                onClick={() => handleTabClick(key)}
              >
                {label}
              </Tab>
            ) : null
          })}
        </Tabs>
        <IconButton hidden />
      </Header>

      <FormContentWrapper grid gridRowGap={3} padding>
        <LoanFormCreate {...props} collateralAlert={collateralAlert} />
      </FormContentWrapper>
    </FormContent>
  )
}

const FormContentWrapper = styled(TabContentWrapper)`
  padding-top: 1rem;
  position: relative;

  min-height: 14rem; // 224px;
`

const FormContent = styled(Box)`
  position: relative;
  min-height: 17.125rem;
`

const Header = styled.header`
  display: flex;
  justify-content: space-between;

  background-color: var(--box_header--primary--background-color);
  border-bottom: var(--box_header--border);
`

export default LoanCreate
