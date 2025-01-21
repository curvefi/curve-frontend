import React from 'react'
import styled from 'styled-components'

import { formatNumber } from '@ui/utils'

import Box from '@ui/Box'
import Icon from '@ui/Icon'
import TextCaption from '@ui/TextCaption'
import TokenIcon from '@lend/components/TokenIcon'

const HopSteps = ({
  fromTokenAddress,
  imageBaseUrl,
  showNextArrow,
  steps,
}: {
  fromTokenAddress: string
  imageBaseUrl: string
  showNextArrow: boolean
  steps: { name: string; part: number; fromTokenAddress: string; toTokenAddress: string }[]
}) => (
  <>
    <Wrapper>
      <StyledTokenIcon imageBaseUrl={imageBaseUrl} token={fromTokenAddress} address={fromTokenAddress} />
      <StepsWrapper>
        {steps.map((l, idx) => (
          <StepsListItem key={`${l.name}${l.part}${idx}`} isBold>
            {l.name} <span>({formatNumber(l.part, { style: 'percent' })})</span>
          </StepsListItem>
        ))}
      </StepsWrapper>
    </Wrapper>
    {showNextArrow && <Icon name="ChevronDown" size={16} />}
  </>
)

const Wrapper = styled(Box)`
  display: grid;
  margin-bottom: var(--spacing-1);
`

const StepsWrapper = styled.div`
  text-align: left;
  display: grid;
`

const StepsListItem = styled(TextCaption)`
  white-space: nowrap;
  span {
    opacity: 0.8;
  }
`

const StyledTokenIcon = styled(TokenIcon)`
  margin-bottom: var(--spacing-1);
`

export default HopSteps
