import React from 'react'
import { t } from '@lingui/macro'

import Button from '@/ui/Button'

const BtnClaim: React.FC = () => {
  return (
    <Button disabled variant="filled" size="large">
      {t`Claim`}
    </Button>
  )
}

export default BtnClaim
