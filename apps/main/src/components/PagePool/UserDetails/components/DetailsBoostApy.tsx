import type { SignerPoolDetailsResp } from '@/entities/signer'

import React from 'react'
import { t } from '@lingui/macro'

import { formatNumber } from '@/ui/utils'

import { Chip } from '@/ui/Typography'

type Props = {
  userBoostApy: SignerPoolDetailsResp['boostApy'] | undefined
}

const DetailsBoostApy: React.FC<Props> = ({ userBoostApy }) => {
  const isNaN = userBoostApy === 'NaN'
  return (
    <>
      <br />
      <Chip size="md">
        {t`Current Boost:`} {isNaN && <strong>{formatNumber(0)}</strong>}
        {!isNaN && <strong>{formatNumber(userBoostApy, { maximumFractionDigits: 3 })}x</strong>}
      </Chip>
      {/* TODO: future boost */}
    </>
  )
}

export default DetailsBoostApy
