import type { Theme } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'

const isDesktopUp = (theme: Theme) => theme.breakpoints.up('desktop')
const isTabletDown = (theme: Theme) => theme.breakpoints.down('tablet')

export const useIsTiny = () => useMediaQuery('(max-width:400px)')
export const useIsMobile = () => useMediaQuery(isTabletDown)
export const useIsDesktop = () => useMediaQuery(isDesktopUp)
export const useIsTablet = () => ![useIsDesktop(), useIsMobile()].includes(true)
