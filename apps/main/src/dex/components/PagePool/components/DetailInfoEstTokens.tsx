import { useMemo } from 'react'
import { Trans } from '@lingui/macro'
import styled from 'styled-components'

import DetailInfo from '@/ui/DetailInfo'

type Props = {
  tokens: string[]
  amounts: string[]
  showEst: boolean
}

const DetailInfoEstTokens = ({ tokens, amounts, showEst }: Props) => {
  const haveEstReceived = useMemo(() => amounts.reduce((prev, curr) => prev + Number(curr), 0), [amounts])
  const showEstReceived = haveEstReceived && !!tokens.length && showEst

  return (
    <DetailInfo label={<Trans>Estimated Received:</Trans>}>
      {showEstReceived && (
        <Items>
          {tokens.map((t, idx) => (
            <Item key={t}>
              {t} <strong>{amounts[idx] || '0.00'}</strong>
            </Item>
          ))}
        </Items>
      )}
    </DetailInfo>
  )
}

const Items = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`

const Item = styled.li`
  strong {
    margin-left: var(--spacing-2);
  }
`

export default DetailInfoEstTokens
