import React, { useEffect, useState } from 'react'

const DelayRender = ({ children, ms }: React.PropsWithChildren<{ ms?: number }>) => {
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

export default DelayRender
