import { t } from '@lingui/macro'
import React from 'react'
import styled from 'styled-components'

import AlertBox from '@ui/AlertBox'
import Box from '@ui/Box'
import Checkbox from '@ui/Checkbox'

function DialogHealthLeverageWarning({
  confirmed,
  warning,
  setConfirmed,
}: HealthMode & {
  confirmed: boolean
  setConfirmed: React.Dispatch<React.SetStateAction<boolean>>
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
