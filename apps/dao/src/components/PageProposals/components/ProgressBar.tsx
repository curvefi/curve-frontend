import React from 'react'
import styled from 'styled-components'

interface ProgressBarProps {
  percentage: number
  yesVote: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, yesVote }) => {
  return (
    <ProgressBarContainer>
      <ProgressBarFill percentage={percentage} yesVote={yesVote} />
    </ProgressBarContainer>
  )
}

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
`

const ProgressBarFill = styled.div<ProgressBarProps>`
  height: 100%;
  background-color: ${({ yesVote }) => (yesVote ? 'var(--chart-green)' : 'var(--chart-red)')};
  border-radius: 5px;
  width: ${({ percentage }) => percentage}%;
`

export default ProgressBar
