import { Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import { HealthMode } from '@/loan/types/loan.types'
import AlertBox from '@ui/AlertBox'
import Checkbox from '@ui/Checkbox'
import { t } from '@ui-kit/lib/i18n'

interface Props extends HealthMode {
  confirmed: boolean
  setConfirmed: Dispatch<SetStateAction<boolean>>
}

function DialogHealthWarning({ confirmed, warningTitle, warning, setConfirmed }: Props) {
  const handleInpChange = (isConfirmed: boolean) => {
    setConfirmed(isConfirmed)
  }

  return (
    <>
      <AlertBox alertType="error">
        {warningTitle}
        <br />
        {warning}
      </AlertBox>

      <StyledCheckbox isSelected={confirmed} onChange={handleInpChange}>
        {t`Confirm warning to proceed.`}
      </StyledCheckbox>
    </>
  )
}

const StyledCheckbox = styled(Checkbox)`
  margin-top: 1rem;
`

export default DialogHealthWarning
