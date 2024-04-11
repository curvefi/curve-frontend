import React from 'react'
import styled from 'styled-components'

interface ProgressBarProps {
  percentage: number
  yesVote: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, yesVote }) => {
  return (
    <ProgressBarContainer>
      {/* Removed direct props passing here */}
      <ProgressBarFill percentage={percentage} yesVote={yesVote} />
    </ProgressBarContainer>
  )
}

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 0.625rem;
  background-color: var(--gray-500a25);
  border-radius: 2px;
`

const ProgressBarFill = styled.div.attrs<ProgressBarProps>(({ percentage, yesVote }) => ({
  style: {
    backgroundColor: yesVote ? 'var(--chart-green)' : 'var(--chart-red)',
    width: `${percentage}%`,
  },
}))<ProgressBarProps>`
  height: 100%;
  border-radius: 2px;
`

export default ProgressBar
