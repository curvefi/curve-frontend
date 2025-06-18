'use client'
import '@/global-extensions'
import { useParams, usePathname } from 'next/navigation'
import { type ReactNode } from 'react'
import type { UrlParams as LendUrlParams } from '@/llamalend/lend/types/lend.types'
import type { UrlParams as LoanUrlParams } from '@/llamalend/loan/types/loan.types'
import lendNetworks, { networksIdMapper as lendNetworksIdMapper } from '@/llamalend/lend/networks'
import { networks as loanNetworks, networksIdMapper as loanNetworksIdMapper } from '@/llamalend/loan/networks'
import useLendStore from '@/llamalend/lend/store/useStore'
import useLoanStore from '@/llamalend/loan/store/useStore'
import LendPage from '@/llamalend/lend/layout'
import LoanPage from '@/llamalend/loan/layout'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useHydration } from '@ui-kit/hooks/useHydration'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

export const App = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const { network: networkId = 'ethereum' } = useParams() as Partial<LendUrlParams & LoanUrlParams>
  const { llamaApi: curve = null } = useConnection()
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)

  // Determine if we're in lend or loan mode based on route
  const isLendMode =
    pathname?.includes('/lend-markets') || pathname?.includes('/integrations') || pathname?.includes('/disclaimer')
  const isLoanMode =
    pathname?.includes('/mint-markets') ||
    pathname?.includes('/pegkeepers') ||
    pathname?.includes('/scrvUSD') ||
    pathname?.includes('/beta-markets') ||
    pathname?.includes('/crvusd-')

  // Use appropriate store and network config based on mode
  const chainId = isLoanMode ? loanNetworksIdMapper[networkId] : lendNetworksIdMapper[networkId]
  const networks = isLoanMode ? loanNetworks : lendNetworks

  // Loan-specific hooks
  const loanFetchAllStoredUsdRates = useLoanStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const loanFetchGasInfo = useLoanStore((state) => state.gas.fetchGasInfo)
  const loanHydrate = useLoanStore((s) => s.hydrate)

  // Lend-specific hooks
  const lendHydrate = useLendStore((s) => s.hydrate)

  // Hydrate appropriate store
  const hydrate = isLoanMode ? loanHydrate : lendHydrate
  const isHydrated = useHydration('llamaApi', hydrate, chainId)

  // Loan-specific interval updates
  usePageVisibleInterval(
    () => {
      if (isPageVisible && curve && isLoanMode) {
        void loanFetchAllStoredUsdRates(curve)
        void loanFetchGasInfo(curve)
      }
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible && (isLoanMode || false),
  )

  useRedirectToEth((networks as any)[chainId] || (networks as any)[1], networkId, isHydrated)

  // Use appropriate layout based on mode
  const Page = isLoanMode ? LoanPage : LendPage

  return <Page>{isHydrated && children}</Page>
}
