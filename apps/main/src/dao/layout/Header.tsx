import { type RefObject, useRef } from 'react'
import useLayoutHeight from '@/dao/hooks/useLayoutHeight'
import { visibleNetworksList } from '@/dao/networks'
import useStore from '@/dao/store/useStore'
import { ChainId } from '@/dao/types/dao.types'
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
  useLayoutHeight(mainNavRef, 'mainNav')
  const bannerHeight = useStore((state) => state.layoutHeight.globalAlert)
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
