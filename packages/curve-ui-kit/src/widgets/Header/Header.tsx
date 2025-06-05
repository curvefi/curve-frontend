import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
import { WalletToast } from '@ui-kit/features/connect-wallet'
import { WagmiConnectModal } from '@ui-kit/features/connect-wallet/ui/WagmiConnectModal'
import { useIsDesktop } from '@ui-kit/hooks/useBreakpoints'
import { useBetaFlag } from '@ui-kit/hooks/useLocalStorage'
import { routeToPage } from '@ui-kit/shared/routes'
import { DESKTOP_HEADER_HEIGHT, DesktopHeader } from './DesktopHeader'
import { calcMobileHeaderHeight, MobileHeader } from './MobileHeader'
import { HeaderProps } from './types'

export const Header = <TChainId extends number>({ routes, ...props }: HeaderProps<TChainId>) => {
  const isDesktop = useIsDesktop()
  const [isBeta] = useBetaFlag()
  const pathname = usePathname()
  const { networkId, height } = props
  const pages = useMemo(
    () =>
      routes
        .filter((props) => !props.betaFeature || isBeta)
        .map((props) => routeToPage(props, { networkId, pathname })),
    [isBeta, networkId, pathname, routes],
  )
  return (
    <>
      {isDesktop ? <DesktopHeader pages={pages} {...props} /> : <MobileHeader pages={pages} {...props} />}
      <WagmiConnectModal />
      <WalletToast headerHeight={height} />
    </>
  )
}

/**
 * Helper function to calculate the header height based on the banner height and the current screen size
 */
export const useHeaderHeight = (bannerHeight: number | undefined) => {
  const isDesktop = useIsDesktop()
  const theme = useTheme()
  const headerHeight = isDesktop ? DESKTOP_HEADER_HEIGHT : calcMobileHeaderHeight(theme)
  return `calc(${headerHeight} + ${bannerHeight ?? 0}px)`
}
