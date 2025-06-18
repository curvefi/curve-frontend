import { Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import { HealthMode } from '@/lend/types/lend.types'
import AlertBox from '@ui/AlertBox'
import Box from '@ui/Box'
import Checkbox from '@ui/Checkbox'
import { t } from '@ui-kit/lib/i18n'

function DialogHealthLeverageWarning({
  confirmed,
  warning,
  setConfirmed,
}: HealthMode & {
  confirmed: boolean
  setConfirmed: Dispatch<SetStateAction<boolean>>
}) {
  const handleInpChange = (isConfirmed: boolean) => {
    setConfirmed(isConfirmed)
  }

  return (
    <Box grid gridRowGap={3}>
      <AlertBox alertType="error">
        {!!warning ? (
          <div>
            <strong>Please review the following warnings:</strong>
            <br />
            <Items>
              <li>{warning}</li>
            </Items>
          </div>
        ) : null}
      </AlertBox>

      <Checkbox isSelected={confirmed} onChange={handleInpChange}>
        {t`Confirm warning to proceed.`}
      </Checkbox>
    </Box>
  )
}

const Items = styled.ol`
  li {
    list-style: initial;
    margin-left: 1rem;

    &:not(:last-of-type) {
      padding: 0.5rem 0;
    }
  }
`

export default DialogHealthLeverageWarning
