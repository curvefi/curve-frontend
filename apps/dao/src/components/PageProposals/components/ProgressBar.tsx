import React from 'react'
import styled from 'styled-components'

interface ProgressBarProps {
  percentage: number
  yesVote: boolean
  status?: boolean
  statusPercentage?: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, yesVote, status, statusPercentage }) => {
  return (
    <ProgressBarContainer>
      <ProgressBarFill percentage={percentage} statusPercentage={statusPercentage} yesVote={yesVote} status={status} />
      {status && statusPercentage && <QuorumLine statusPercentage={statusPercentage} />}
    </ProgressBarContainer>
  )
}

const ProgressBarContainer = styled.div`
  position: relative;
  width: 100%;
  height: 0.625rem;
  background-color: var(--gray-500a25);
  border-radius: 2px;
`

const ProgressBarFill = styled.div.attrs<ProgressBarProps>(({ percentage, statusPercentage, yesVote, status }) => ({
  style: {
    backgroundColor:
      status && statusPercentage
        ? percentage >= statusPercentage
          ? 'var(--chart-green)'
          : 'var(--chart-red)'
        : yesVote
        ? 'var(--chart-green)'
        : 'var(--chart-red)',
    width: `${percentage}%`,
  },
}))<ProgressBarProps>`
  height: 100%;
  border-radius: 2px;
`

const QuorumLine = styled.div<{ statusPercentage: number }>`
  position: absolute;
  top: 50%;
  left: ${({ statusPercentage }) => `${statusPercentage}%`};
  width: 2px;
  height: 140%;
  background-color: var(--page--text-color);
  transform: translateY(-50%);
`

export default ProgressBar
