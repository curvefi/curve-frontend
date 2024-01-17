import React from 'react'
import styled from 'styled-components'

import { shortenTokenAddress } from '@/utils'

import { Chip } from '@/ui/Typography'
import Box from '@/ui/Box'
import ComboBoxTokenUserBalance from '@/components/ComboBoxSelectToken/ComboBoxTokenUserBalance'
import TokenIcon from '@/components/TokenIcon'

const ComboBoxToken = ({
  haveSigner,
  imageBaseUrl,
  testId,
  ...item
}: Token & {
  haveSigner: boolean | undefined
  imageBaseUrl: string
  testId: string | undefined
}) => {
  return (
    <ItemWrapper>
      <TokenIcon imageBaseUrl={imageBaseUrl} token={item.symbol} address={item.ethAddress || item.address} />
      <LabelTextWrapper>
        <LabelText data-testid={`li-${testId}`}>{item.symbol}</LabelText>
        <Chip isMono opacity={0.5}>
          {shortenTokenAddress(item.address)}
        </Chip>
      </LabelTextWrapper>
      <ComboBoxTokenUserBalance haveSigner={haveSigner} tokenAddress={item.address} />
    </ItemWrapper>
  )
}

const ItemWrapper = styled.div`
  align-items: center;
  display: grid;
  grid-column-gap: var(--spacing-2);
  grid-template-columns: auto 1fr auto;
  width: 100%;
`

const LabelText = styled.div`
  overflow: hidden;

  font-size: var(--font-size-4);
  font-weight: var(--font-weight--bold);
  line-height: 1;
  text-overflow: ellipsis;
`

const LabelTextWrapper = styled(Box)`
  overflow: hidden;
  text-overflow: ellipsis;
`

export default ComboBoxToken
