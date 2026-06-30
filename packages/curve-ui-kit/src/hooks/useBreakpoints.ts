import type { Breakpoint, Theme } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'

const isDesktopUp = (theme: Theme) => theme.breakpoints.up('desktop')
const isTabletDown = (theme: Theme) => theme.breakpoints.down('tablet')

export const useIsTiny = () => useMediaQuery('(max-width:400px)')
export const useIsMobile = () => useMediaQuery(isTabletDown)
export const useIsDesktop = () => useMediaQuery(isDesktopUp)
export const useIsTablet = () => ![useIsDesktop(), useIsMobile()].includes(true)

// Returns the current app breakpoint bucket for responsive category lookups.
export const useBreakpoint = (): Breakpoint => {
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()

  return isMobile ? 'mobile' : isDesktop ? 'desktop' : 'tablet'
}
