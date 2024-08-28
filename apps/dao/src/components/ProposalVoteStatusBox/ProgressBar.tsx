import React from 'react'
import styled from 'styled-components'

interface ProgressBarProps {
  minSupport: number
  support: number
  active: boolean
  statusPercentage?: number
  quorum?: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({ support, minSupport, quorum, active }) => {
  return (
    <ProgressBarContainer active={active} quorum={quorum}>
      {quorum && <SupportLine quorum={quorum} minSupport={minSupport} active={active} />}
      <ProgressBarFill quorum={quorum} support={support} />
      {!quorum && <SupportLine quorum={false} minSupport={minSupport} active={active} />}
    </ProgressBarContainer>
  )
}

const ProgressBarContainer = styled.div<{ quorum?: boolean; active: boolean }>`
  position: relative;
  width: 100%;
  height: 1rem;
  box-sizing: border-box;
  background-color: ${({ quorum, active }) => (quorum || !active ? 'inherit' : 'var(--chart-red)')};
  ${({ active }) => (!active ? 'border: 1px solid var(--gray-500a25);' : 'border: none')};
  ${({ quorum, active }) => quorum && active && 'border: 1px solid var(--primary-400);'};
`

const ProgressBarFill = styled.div<{ quorum?: boolean; support: number }>`
  background-color: ${({ quorum }) => (quorum ? 'var(--primary-400)' : 'var(--chart-green)')};
  width: ${({ support }) => `${support ?? 0}%`};
  height: 100%;
`

const SupportLine = styled.div<{ quorum: boolean; minSupport: number; active: boolean }>`
  position: absolute;
  top: 50%;
  left: ${({ minSupport }) => `${minSupport}%`};
  width: 2px;
  height: 50%;
  background-color: var(--primary-400);
  ${({ quorum, active }) =>
    quorum
      ? 'transform: translateY(calc(-200% - 1px));'
      : active
      ? 'transform: translateY(100%);'
      : 'transform: translateY(calc(100% + 1px));'};
`

export default ProgressBar
