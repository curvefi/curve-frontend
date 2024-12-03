// import type { AppLogoProps } from '@/ui/Brand/AppLogo'
// import type { AppPage } from '@/ui/AppNav/types'
// import type { ThemeType } from '@/ui/Select/SelectThemes'

// import React, { useRef } from 'react'
// import { t } from '@lingui/macro'
// import { useNavigate, useParams } from 'react-router-dom'

// import { CONNECT_STAGE, ROUTE } from '@/constants'
// import { DEFAULT_LOCALES } from '@/lib/i18n'
// import { isLoading } from '@/ui/utils'
// import { getNetworkFromUrl, getParamsFromUrl, getRestFullPathname } from '@/utils/utilsRouter'
// import { getWalletSignerAddress } from '@/store/createWalletSlice'
// import { useConnectWallet } from '@/common/features/connect-wallet'
// import networks, { visibleNetworksList } from '@/networks'
// import useLayoutHeight from '@/hooks/useLayoutHeight'
// import useStore from '@/store/useStore'

// import {
//   APP_LINK,
//   APPS_LINKS,
//   AppNavMobile,
//   AppNavBarContent,
//   AppNavBar,
//   AppNavMenuSection,
//   AppSelectNetwork,
// } from '@/ui/AppNav'
// import { CommunitySection, ResourcesSection } from '@/layout/Footer'
// import AppLogo from '@/ui/Brand'
// import AppNavPages from '@/ui/AppNav/AppNavPages'
// import ConnectWallet from '@/ui/Button/ConnectWallet'
// import HeaderSecondary from '@/layout/HeaderSecondary'

// const Header = () => {
//   const [{ wallet }] = useConnectWallet()
//   const mainNavRef = useRef<HTMLDivElement>(null)
//   const navigate = useNavigate()
//   const params = useParams()
//   useLayoutHeight(mainNavRef, 'mainNav')

//   const connectState = useStore((state) => state.connectState)
//   const isMdUp = useStore((state) => state.isMdUp)
//   const locale = useStore((state) => state.locale)
//   const pageWidth = useStore((state) => state.pageWidth)
//   const routerProps = useStore((state) => state.routerProps)
//   const themeType = useStore((state) => state.themeType)
//   const setThemeType = useStore((state) => state.setThemeType)
//   const updateConnectState = useStore((state) => state.updateConnectState)

//   const { rChainId, rNetwork, rNetworkIdx, rLocalePathname } = getParamsFromUrl()

//   const ethereumLogoSrc = `https://cdn.jsdelivr.net/gh/curvefi/curve-assets/chains/ethereum.png`

//   const appLogoProps: AppLogoProps = {
//     appName: 'Dao',
//   }

//   const p: AppPage[] = [
//     { route: ROUTE.PAGE_VECRV_CREATE, label: t`Lock CRV`, groupedTitle: 'Lock CRV' },
//     { route: ROUTE.PAGE_PROPOSALS, label: t`Proposals`, groupedTitle: 'Proposals' },
//     { route: ROUTE.PAGE_GAUGES, label: t`Gauges`, groupedTitle: 'Gauges' },
//     { route: ROUTE.PAGE_ANALYTICS, label: t`Analytics`, groupedTitle: 'Analytics' },
//     { ...APP_LINK.main, isDivider: true },
//     APP_LINK.lend,
//   ]

//   const pages = p.map(({ route, ...rest }) => {
//     const parsedRoute = route.startsWith('http') ? route : `#${rLocalePathname}/${rNetwork}${route}`
//     return { route: parsedRoute, isActive: false, ...rest }
//   })

//   const desktopPages = pages.map(({ route, ...rest }) => {
//     const routerPathname = routerProps?.location?.pathname.split('?')[0] ?? ''
//     const routePathname = route.split('?')[0] ?? ''
//     return {
//       ...rest,
//       route,
//       isActive: routerPathname && routePathname ? routePathname.endsWith(routerPathname) : false,
//     }
//   })

//   const getPath = (route: string) => {
//     const networkName = networks[rChainId || '1'].id
//     return `#${rLocalePathname}/${networkName}${route}`
//   }

//   const appNavConnect = {
//     connectState,
//     walletSignerAddress: getWalletSignerAddress(wallet),
//     handleClick: () => {
//       if (wallet) {
//         updateConnectState('loading', CONNECT_STAGE.DISCONNECT_WALLET)
//       } else {
//         updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, [''])
//       }
//     },
//   }

//   const SelectNetworkComp = (
//     <AppSelectNetwork
//       connectState={connectState}
//       buttonStyles={{ textTransform: 'uppercase' }}
//       items={visibleNetworksList}
//       loading={isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK)}
//       minWidth="9rem"
//       mobileRightAlign
//       selectedKey={(rNetworkIdx === -1 ? '' : rChainId).toString()}
//       onSelectionChange={() => {}}
//     />
//   )

//   const appNavLocale = {
//     locale,
//     locales: DEFAULT_LOCALES,
//     handleChange: (selectedLocale: React.Key) => {
//       const locale = selectedLocale !== 'en' ? `/${selectedLocale}` : ''
//       const { rNetwork } = getNetworkFromUrl()
//       navigate(`${locale}/${rNetwork}/${getRestFullPathname()}`)
//     },
//   }

//   const appNavTheme = {
//     themeType,
//     handleClick: (selectedThemeType: ThemeType) => setThemeType(selectedThemeType),
//   }

//   const appsLinks = [APP_LINK.classicMain, ...APPS_LINKS]

//   return (
//     <>
//       {isMdUp && <HeaderSecondary appsLinks={appsLinks} appStats={[]} locale={appNavLocale} theme={appNavTheme} />}
//       <AppNavBar ref={mainNavRef} aria-label="Main menu" isMdUp={isMdUp}>
//         <AppNavBarContent pageWidth={pageWidth} className="nav-content">
//           {isMdUp ? (
//             <>
//               <AppNavMenuSection>
//                 <AppLogo {...appLogoProps} />
//                 <AppNavPages pages={desktopPages} navigate={navigate} />
//               </AppNavMenuSection>

//               <AppNavMenuSection>
//                 {SelectNetworkComp}
//                 <ConnectWallet {...appNavConnect} />
//               </AppNavMenuSection>
//             </>
//           ) : (
//             <AppNavMobile
//               appLogoProps={appLogoProps}
//               connect={appNavConnect}
//               locale={appNavLocale}
//               pageWidth={pageWidth}
//               pages={{
//                 pages,
//                 getPath,
//                 handleClick: (route: string) => {
//                   if (navigate && params) {
//                     let parsedRoute = route.charAt(0) === '#' ? route.substring(2) : route
//                     navigate(parsedRoute)
//                   }
//                 },
//               }}
//               sections={[
//                 { id: 'apps', title: t`Apps`, links: appsLinks },
//                 { id: 'community', title: t`Community`, comp: <CommunitySection locale={locale} columnCount={1} /> },
//                 { id: 'resources', title: t`Resources`, comp: <ResourcesSection chainId={rChainId} columnCount={1} /> },
//               ]}
//               selectNetwork={SelectNetworkComp}
//               stats={[]}
//               theme={appNavTheme}
//             />
//           )}
//         </AppNavBarContent>
//       </AppNavBar>
//     </>
//   )
// }

// export default Header
