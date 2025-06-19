import { type RefObject, useRef } from 'react'
import { visibleNetworksList } from '@/dao/networks'
import { ChainId } from '@/dao/types/dao.types'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useLayoutHeight } from '@ui-kit/hooks/useResizeObserver'
import { APP_LINK } from '@ui-kit/shared/routes'
import { Header as NewHeader, useHeaderHeight } from '@ui-kit/widgets/Header'
import { NavigationSection } from '@ui-kit/widgets/Header/types'

export const Header = ({
  sections,
  chainId,
  globalAlertRef,
  networkId,
}: {
  sections: NavigationSection[]
  globalAlertRef: RefObject<HTMLDivElement | null>
  networkId: string
  chainId: ChainId
}) => {
  const mainNavRef = useRef<HTMLDivElement>(null)
  const setLayoutHeight = useLayoutStore((state) => state.setLayoutHeight)
  useLayoutHeight(mainNavRef, 'mainNav', setLayoutHeight)
  const bannerHeight = useLayoutStore((state) => state.height.globalAlert)
  return (
    <NewHeader
      chainId={chainId}
      networkId={networkId}
      mainNavRef={mainNavRef}
      currentMenu="dao"
      routes={APP_LINK.dao.routes}
      chains={visibleNetworksList}
      globalAlertRef={globalAlertRef}
      height={useHeaderHeight(bannerHeight)}
      sections={sections}
    />
  )
}
