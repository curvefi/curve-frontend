import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'

import Stats from '@/ui/Stats'

type Props = {
  lpToken: string | undefined
  gauge: string | undefined
}

const DetailsStaked: React.FC<Props> = ({ lpToken, gauge }) => {
  return (
    <>
      <StyledStats label={t`LP Tokens`}>
        <div>
          {t`Staked:`} <strong>{formatNumber(gauge, { defaultValue: '-' })}</strong>
        </div>
        <div>
          {t`Unstaked:`} <strong>{formatNumber(lpToken, { defaultValue: '-' })}</strong>
        </div>
      </StyledStats>
    </>
  )
}

const StyledStats = styled(Stats)`
  margin: 0;
`

export default DetailsStaked
