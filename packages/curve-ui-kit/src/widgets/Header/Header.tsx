import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import type { Theme } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { WagmiConnectModal } from '@ui-kit/features/connect-wallet/ui/WagmiConnectModal'
import { useBetaFlag } from '@ui-kit/hooks/useLocalStorage'
import { routeToPage } from '@ui-kit/shared/routes'
import { DESKTOP_HEADER_HEIGHT, DesktopHeader } from './DesktopHeader'
import { calcMobileHeaderHeight, MobileHeader } from './MobileHeader'
import { HeaderProps } from './types'

const isDesktopQuery = (theme: Theme) => theme.breakpoints.up('desktop')

export const Header = <TChainId extends number>({ routes, ...props }: HeaderProps<TChainId>) => {
  const isDesktop = useMediaQuery(isDesktopQuery, { noSsr: true })
  const [isBeta] = useBetaFlag()
  const pathname = usePathname()
  const { networkName } = props
  const pages = useMemo(
    () =>
      routes
        .filter((props) => !props.betaFeature || isBeta)
        .map((props) => routeToPage(props, { networkName, pathname })),
    [isBeta, networkName, pathname, routes],
  )
  return (
    <>
      {isDesktop ? <DesktopHeader pages={pages} {...props} /> : <MobileHeader pages={pages} {...props} />}
      <WagmiConnectModal />
    </>
  )
}

/**
 * Helper function to calculate the header height based on the banner height and the current screen size
 */
export const useHeaderHeight = (bannerHeight: number | undefined) => {
  const isDesktop = useMediaQuery(isDesktopQuery, { noSsr: true })
  const theme = useTheme()
  const headerHeight = isDesktop ? DESKTOP_HEADER_HEIGHT : calcMobileHeaderHeight(theme)
  return `calc(${headerHeight} + ${bannerHeight ?? 0}px)`
}
