import { useEffect, useState } from 'react'
import { styled } from 'styled-components'
import { setTimeoutInterval } from '@ui-kit/utils/timers'

interface CountdownProps {
  /** startDate adds 7 days to the current date to mimic a DAO proposal voting period */
  startDate?: number | null
  /** endDate is the specific date to count down to. Takes precedence over startDate. */
  endDate?: number | null
  className?: string
}

export const Countdown = ({ startDate, endDate, className }: CountdownProps) => {
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    const updateTimeRemaining = () => {
      let effectiveEndDate: number | null = null

      if (endDate) {
        effectiveEndDate = endDate
      } else if (startDate) {
        effectiveEndDate = startDate + 604800 // 7 days in seconds
      }

      if (!effectiveEndDate) {
        setTimeRemaining('')
        return
      }

      const now = Math.floor(Date.now() / 1000)
      const remainingSeconds = effectiveEndDate - now

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
    return setTimeoutInterval(updateTimeRemaining, 1000)
  }, [startDate, endDate])

  return (
    <CountdownContainer className={className}>
      <p>{timeRemaining || '-'}</p>
    </CountdownContainer>
  )
}

const CountdownContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  font-variant-numeric: tabular-nums;
`
