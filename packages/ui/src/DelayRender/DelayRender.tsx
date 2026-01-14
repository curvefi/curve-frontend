import { ReactNode, useEffect, useState } from 'react'

export const DelayRender = ({ children, ms }: { ms?: number; children: ReactNode }) => {
  const [showComponent, setShowComponent] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowComponent(true)
    }, ms || 100)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{showComponent ? children : null}</>
}
