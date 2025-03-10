import type { Theme } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { DESKTOP_HEADER_HEIGHT, DesktopHeader } from './DesktopHeader'
import { calcMobileHeaderHeight, MobileHeader } from './MobileHeader'
import { HeaderProps } from './types'

const isDesktopQuery = (theme: Theme) => theme.breakpoints.up('desktop')

export const Header = <TChainId extends number>({ isMdUp, ...props }: HeaderProps<TChainId>) =>
  useMediaQuery(isDesktopQuery, { noSsr: true }) ? <DesktopHeader {...props} /> : <MobileHeader {...props} />

/**
 * Helper function to calculate the header height based on the banner height and the current screen size
 */
export const useHeaderHeight = (bannerHeight: number | undefined) => {
  const isDesktop = useMediaQuery(isDesktopQuery, { noSsr: true })
  const theme = useTheme()
  const headerHeight = isDesktop ? DESKTOP_HEADER_HEIGHT : calcMobileHeaderHeight(theme)
  return `calc(${headerHeight} + ${bannerHeight ?? 0}px)`
}
