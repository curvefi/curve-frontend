import React from 'react'
import styled from 'styled-components'

interface ProgressBarProps {
  percentage: number
  yesVote: boolean
  quorum?: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, yesVote, quorum }) => {
  return (
    <ProgressBarContainer>
      <ProgressBarFill percentage={percentage} yesVote={yesVote} quorum={quorum} />
      {quorum && <QuorumLine />}
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

const ProgressBarFill = styled.div.attrs<ProgressBarProps>(({ percentage, yesVote, quorum }) => ({
  style: {
    backgroundColor: quorum ? 'var(--primary-400a50)' : yesVote ? 'var(--chart-green)' : 'var(--chart-red)',
    width: `${percentage}%`,
  },
}))<ProgressBarProps>`
  height: 100%;
  border-radius: 2px;
`

const QuorumLine = styled.div`
  position: absolute;
  top: 50%;
  left: 30%;
  width: 2px;
  height: 140%;
  background-color: var(--page--text-color);
  transform: translateY(-50%);
`

export default ProgressBar
