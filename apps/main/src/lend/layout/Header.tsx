import { type RefObject } from 'react'
import { useTvl } from '@/lend/entities/chain'
import { visibleNetworksList } from '@/lend/networks'
import { ChainId, type NetworkEnum } from '@/lend/types/lend.types'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { useLayoutStore } from '@ui-kit/features/layout'
import { APP_LINK } from '@ui-kit/shared/routes'
import { Header as NewHeader, useHeaderHeight } from '@ui-kit/widgets/Header'
import type { NavigationSection } from '@ui-kit/widgets/Header/types'

export const Header = ({
  chainId,
  sections,
  globalAlertRef,
  networkId,
}: {
  chainId: ChainId
  sections: NavigationSection[]
  globalAlertRef: RefObject<HTMLDivElement | null>
  networkId: NetworkEnum
}) => {
  const bannerHeight = useLayoutStore((state) => state.height.globalAlert)
  const { data: tvl } = useTvl(chainId)
  return (
    <NewHeader<ChainId>
      networkId={networkId}
      chainId={chainId}
      mainNavRef={{ current: null }} // not used in lend
      currentMenu="llamalend"
      routes={APP_LINK.llamalend.routes}
      chains={visibleNetworksList}
      appStats={[
        {
          label: 'TVL',
          value: (tvl && formatNumber(tvl, { ...FORMAT_OPTIONS.USD, notation: 'compact' })) || '',
        },
      ]}
      height={useHeaderHeight(bannerHeight)}
      globalAlertRef={globalAlertRef}
      sections={sections}
    />
  )
}
