import { useState } from 'react'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model/time'

export const useCurrentDate = (granularity: keyof typeof REFRESH_INTERVAL = '1m') => {
  const [currentDate, setCurrentDate] = useState(() => new Date())

  usePageVisibleInterval(() => setCurrentDate(new Date()), REFRESH_INTERVAL[granularity])

  return currentDate
}
