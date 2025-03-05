import { useEffect, useState } from 'react'
import styled from 'styled-components'

interface VoteCountdownProps {
  startDate: number
  className?: string
}

const VoteCountdown = ({ startDate, className }: VoteCountdownProps) => {
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000)
      const endDate = startDate + 604800 // 7 days in seconds
      const remainingSeconds = endDate - now

      if (remainingSeconds <= 0) {
        setTimeRemaining('Voting has ended')
      } else {
        const days = Math.floor(remainingSeconds / 86400)
        const hours = Math.floor((remainingSeconds % 86400) / 3600)
        const minutes = Math.floor((remainingSeconds % 3600) / 60)
        const seconds = remainingSeconds % 60

        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`)
      }
    }

    updateTimeRemaining()
    const timer = setInterval(updateTimeRemaining, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [startDate])

  return (
    <VoteCountdownContainer className={className}>
      <p>{timeRemaining}</p>
    </VoteCountdownContainer>
  )
}

const VoteCountdownContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  font-variant-numeric: tabular-nums;
`

export default VoteCountdown
