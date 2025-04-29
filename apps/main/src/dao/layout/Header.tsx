import { useRouter } from 'next/navigation'
import { type RefObject, useCallback, useRef } from 'react'
import useLayoutHeight from '@/dao/hooks/useLayoutHeight'
import networks, { visibleNetworksList } from '@/dao/networks'
import useStore from '@/dao/store/useStore'
import { ChainId, type CurveApi } from '@/dao/types/dao.types'
import { getPath, getRestFullPathname } from '@/dao/utils/utilsRouter'
import { CONNECT_STAGE, getWalletSignerAddress, isLoading, useConnection } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
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
  const { push } = useRouter()
  useLayoutHeight(mainNavRef, 'mainNav')
  const { connectState } = useConnection<CurveApi>()
  const bannerHeight = useStore((state) => state.layoutHeight.globalAlert)
  return (
    <NewHeader<ChainId>
      networkId={networkId}
      mainNavRef={mainNavRef}
      currentMenu="dao"
      routes={APP_LINK.dao.routes}
      ChainProps={{
        options: visibleNetworksList,
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        chainId,
        onChange: useCallback(
          (selectedChainId: ChainId) => {
            if (chainId !== selectedChainId) {
              const network = networks[selectedChainId as ChainId].id
              push(getPath({ network }, `/${getRestFullPathname()}`))
            }
          },
          [chainId, push],
        ),
      }}
      globalAlertRef={globalAlertRef}
      height={useHeaderHeight(bannerHeight)}
      sections={sections}
    />
  )
}
