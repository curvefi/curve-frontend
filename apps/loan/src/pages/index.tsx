import { useEffect } from 'react'
import { getAppRoot } from '@ui-kit/shared/routes'

export default function Index() {
  useEffect(() => {
    location.href = `${getAppRoot('loan')}${location.search}${location.hash}`
  }, [])
  return null
}
