import { HeaderProps } from './types'
import { DesktopHeader } from './DesktopHeader'
import { MobileHeader } from './MobileHeader'
import type { Theme } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { DEFAULT_BAR_SIZE } from 'curve-ui-kit/src/themes/components'
import { useTheme } from '@mui/material/styles'

const isDesktopQuery = (theme: Theme) => theme.breakpoints.up('desktop')

export const Header = <TChainId extends number>({ isMdUp, ...props }: HeaderProps<TChainId>) =>
  useMediaQuery(isDesktopQuery, { noSsr: true }) ? <DesktopHeader {...props} /> : <MobileHeader {...props} />

/**
 * Helper function to calculate the header height based on the banner height and the current screen size
 */
export const useHeaderHeight = (bannerHeight: number | undefined) => {
  const isDesktop = useMediaQuery(isDesktopQuery, { noSsr: true })
  const theme = useTheme()
  return isDesktop
    ? `calc(96px + ${bannerHeight ?? 0}px)` // note: hardcoded height is tested in cypress
    : `calc(2 * ${theme.spacing(3)} + ${DEFAULT_BAR_SIZE} + ${bannerHeight}px)`
}
