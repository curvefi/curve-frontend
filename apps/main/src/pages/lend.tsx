import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { Navigate, Route, Routes } from 'react-router'
import { ROUTE } from '@/lend/constants'
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { OverlayProvider } from '@react-aria/overlays'
import delay from 'lodash/delay'
import { useCallback, useEffect, useState } from 'react'
import 'focus-visible'
import { HashRouter } from 'react-router-dom'
import { persister, queryClient } from '@ui-kit/lib/api/query-client'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import GlobalStyle from '@/lend/globalStyle'
import Page from '@/lend/layout'
import { dynamicActivate, initTranslation } from '@ui-kit/lib/i18n'
import { messages as messagesEn } from '@/locales/en/messages.js'
import networks from '@/lend/networks'
import { getPageWidthClassName } from '@/lend/store/createLayoutSlice'
import useStore from '@/lend/store/useStore'
import { QueryProvider } from '@ui/QueryProvider'
import { isMobile, removeExtraSpaces } from '@/lend/utils/helpers'
import { getLocaleFromUrl } from '@/lend/utils/utilsRouter'
import { ChadCssProperties } from '@ui-kit/themes/typography'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useWallet } from '@ui-kit/features/connect-wallet'

i18n.load({ en: messagesEn })
i18n.activate('en')

const PageLlammasList = dynamic(() => import('@/lend/components/PageMarketList/Page'), { ssr: false })
const PageLoanCreate = dynamic(() => import('@/lend/components/PageLoanCreate/Page'), { ssr: false })
const PageLoanManage = dynamic(() => import('@/lend/components/PageLoanManage/Page'), { ssr: false })
const PageVault = dynamic(() => import('@/lend/components/PageVault/Page'), { ssr: false })
const PageDisclaimer = dynamic(() => import('@/lend/components/PageDisclaimer/Page'), { ssr: false })
const Page404 = dynamic(() => import('@/lend/components/Page404/Page'), { ssr: false })
const PageIntegrations = dynamic(() => import('@/lend/components/PageIntegrations/Page'), { ssr: false })

const App: NextPage = () => {
  const pageWidth = useStore((state) => state.layout.pageWidth)
  const setLayoutWidth = useStore((state) => state.layout.setLayoutWidth)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const theme = useUserProfileStore((state) => state.theme)
  const locale = useUserProfileStore((state) => state.locale)

  const [appLoaded, setAppLoaded] = useState(false)

  const handleResizeListener = useCallback(() => {
    updateGlobalStoreByKey('isMobile', isMobile())
    if (window.innerWidth) setLayoutWidth(getPageWidthClassName(window.innerWidth))
  }, [setLayoutWidth, updateGlobalStoreByKey])

  // update on every state change
  useEffect(() => {
    if (!pageWidth) return

    document.body.className = removeExtraSpaces(`theme-${theme} ${pageWidth} ${isMobile() ? '' : 'scrollSmooth'}`)
    document.documentElement.lang = locale
  })

  // init app
  useEffect(() => {
    const handleScrollListener = () => {
      updateGlobalStoreByKey('scrollY', window.scrollY)
    }

    // init locale
    const { rLocale } = getLocaleFromUrl()
    const parsedLocale = rLocale?.value ?? 'en'
    initTranslation(i18n, parsedLocale)
    ;(async () => {
      let data = await import(`@/locales/${parsedLocale}/messages`)
      dynamicActivate(parsedLocale, data)
    })()

    // init onboard
    useWallet.initialize(locale, theme, networks)

    const handleVisibilityChange = () => {
      updateGlobalStoreByKey('isPageVisible', !document.hidden)
    }

    setAppLoaded(true)
    handleResizeListener()
    handleVisibilityChange()

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('resize', () => handleResizeListener())
    window.addEventListener('scroll', () => delay(handleScrollListener, 200))

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('resize', () => handleResizeListener())
      window.removeEventListener('scroll', () => handleScrollListener())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const SubRoutes = (
    <>
      <Route path=":network" element={<PageLlammasList />} />
      <Route path=":network/disclaimer" element={<PageDisclaimer />} />
      <Route path=":network/integrations" element={<PageIntegrations />} />
      <Route path=":network/markets" element={<PageLlammasList />} />
      <Route path=":network/markets/:owmId" element={<Navigate to="create" />} />
      <Route path=":network/markets/:owmId/create" element={<PageLoanCreate />} />
      <Route path=":network/markets/:owmId/create/:formType" element={<PageLoanCreate />} />
      <Route path=":network/markets/:owmId/manage" element={<PageLoanManage />} />
      <Route path=":network/markets/:owmId/manage/:formType" element={<PageLoanManage />} />
      <Route path=":network/markets/:owmId/vault" element={<PageVault />} />
      <Route path=":network/markets/:owmId/vault/:formType" element={<PageVault />} />
    </>
  )

  return (
    <div suppressHydrationWarning style={{ ...(theme === 'chad' && ChadCssProperties) }}>
      <ThemeProvider theme={theme}>
        {typeof window === 'undefined' || !appLoaded ? null : (
          <HashRouter>
            <I18nProvider i18n={i18n}>
              <QueryProvider persister={persister} queryClient={queryClient}>
                <OverlayProvider>
                  <Page>
                    <Routes>
                      {SubRoutes}
                      <Route path=":locale">{SubRoutes}</Route>
                      <Route path="/markets/*" element={<Navigate to={`/ethereum${ROUTE.PAGE_MARKETS}`} replace />} />
                      <Route
                        path="/disclaimer"
                        element={<Navigate to={`/ethereum${ROUTE.PAGE_DISCLAIMER}`} replace />}
                      />
                      <Route
                        path="/integrations"
                        element={<Navigate to={`/ethereum${ROUTE.PAGE_INTEGRATIONS}`} replace />}
                      />
                      <Route path="/" element={<Navigate to={`/ethereum/markets`} replace />} />
                      <Route path="404" element={<Page404 />} />
                      <Route path="*" element={<Page404 />} />
                    </Routes>
                  </Page>
                  <GlobalStyle />
                </OverlayProvider>
              </QueryProvider>
            </I18nProvider>
          </HashRouter>
        )}
      </ThemeProvider>
    </div>
  )
}

export default App
