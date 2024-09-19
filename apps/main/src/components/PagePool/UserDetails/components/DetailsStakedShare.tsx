import React, { useMemo } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'

import { Chip } from '@/ui/Typography'
import Box from '@/ui/Box'

type Props = {
  lpShare: string | undefined
}

const { PERCENT } = FORMAT_OPTIONS

const DetailsStakedShare: React.FC<Props> = ({ lpShare }) => {
  const userShareLabel = useMemo(() => {
    if (typeof lpShare === 'undefined') return ''

    const lpShareNum = Number(lpShare)

    if (lpShareNum !== 0) {
      if (lpShareNum > 0.01) return formatNumber(lpShare, PERCENT)
      return `< ${formatNumber(0.01, PERCENT)}`
    }

    return formatNumber(0, PERCENT)
  }, [lpShare])

  return (
    <Title>
      <h3>{t`Your position`}</h3>
      <span>
        {t`Staked share:`} <strong>{userShareLabel}</strong> <Chip size={'xs'}>{t`of pool`}</Chip>
      </span>
    </Title>
  )
}

const Title = styled(Box)`
  padding: 1rem;
  grid-template-columns: 1fr auto;

  .stats {
    margin: 0;
  }
`

export default DetailsStakedShare
