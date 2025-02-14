import { t } from '@ui-kit/lib/i18n'
import React from 'react'

import AlertBox from '@ui/AlertBox'
import Box from '@ui/Box'
import Checkbox from '@ui/Checkbox'

function DialogHighPriceImpactWarning({
  priceImpact,
  confirmed,
  setConfirmed,
}: {
  priceImpact: string
  confirmed: boolean
  setConfirmed: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const handleInpChange = (isConfirmed: boolean) => {
    setConfirmed(isConfirmed)
  }

  return (
    <Box grid gridRowGap={3}>
      <AlertBox alertType="error">{t`You have a high price impact ${priceImpact}%!`}</AlertBox>

      <Checkbox isSelected={confirmed} onChange={handleInpChange}>
        {t`Confirm warning to proceed.`}
      </Checkbox>
    </Box>
  )
}

export default DialogHighPriceImpactWarning
