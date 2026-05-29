import { useEffect } from 'react'
import { notFalsy } from '@primitives/objects.utils'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

export const useBodyThemeClass = () => {
  const { document } = window
  const theme = useUserProfileStore(state => state.theme)
  const pageWidth = useLayoutStore(state => state.pageWidth)

  useEffect(() => {
    document.body.className = notFalsy(`theme-${theme}`, pageWidth).join(' ')
    document.body.setAttribute('data-theme', theme)
  }, [document, pageWidth, theme])
}
