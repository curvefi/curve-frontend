import type { Theme } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'

const isDesktopUp = (theme: Theme) => theme.breakpoints.up('desktop')
const isTabletDown = (theme: Theme) => theme.breakpoints.down('tablet')

export const useIsTiny = () => useMediaQuery('(max-width:400px)', { defaultMatches: false })
export const useIsMobile = () => useMediaQuery(isTabletDown, { defaultMatches: false })
export const useIsDesktop = () => useMediaQuery(isDesktopUp, { defaultMatches: true })
export const useIsTablet = () => ![useIsDesktop(), useIsMobile()].includes(true)
