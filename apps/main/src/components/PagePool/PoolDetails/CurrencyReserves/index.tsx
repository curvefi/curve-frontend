import type { CurrencyReservesProps } from '@/components/PagePool/PoolDetails/CurrencyReserves/types'

import { t } from '@lingui/macro'
import styled from 'styled-components'

import { copyToClipboard } from '@/lib/utils'
import { getChainPoolIdActiveKey } from '@/utils'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'
import { StyledStats } from '@/components/PagePool/PoolDetails/PoolStats/styles'
import CrMobile from '@/components/PagePool/PoolDetails/CurrencyReserves/CrMobile'
import CrDesktop from '@/components/PagePool/PoolDetails/CurrencyReserves/CrDesktop'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'

interface Props {
  rChainId: ChainId
  rPoolId: string
  tokensMapper: TokensMapper
  tvl: Tvl
}

const CurrencyReserves = ({ rChainId, rPoolId, tokensMapper, tvl }: Props) => {
  const isXSmDown = useStore((state) => state.isXSmDown)
  const poolDataMapperCached = useStore((state) => state.storeCache.poolsMapper[rChainId]?.[rPoolId])
  const poolData = useStore((state) => state.pools.poolsMapper[rChainId]?.[rPoolId])
  const currencyReserves = useStore((state) => state.pools.currencyReserves[getChainPoolIdActiveKey(rChainId, rPoolId)])

  const poolDataCachedOrApi = poolData ?? poolDataMapperCached

  const handleCopyClick = (address: string) => {
    copyToClipboard(address)
  }

  return (
    <article>
      <StyledTitle>{t`Currency reserves`}</StyledTitle>
      {poolDataCachedOrApi?.tokens.map((token, idx) => {
        const tokenAddress = poolDataCachedOrApi.tokenAddresses[idx]
        const haveSameTokenName = poolDataCachedOrApi.tokensCountBy[token] > 1
        const cr = currencyReserves?.tokens.find((t) => t.token === token)
        const key = `${token}-${idx}`
        const crProps: CurrencyReservesProps = {
          cr,
          haveSameTokenName,
          network: networks[rChainId],
          rChainId,
          tokensMapper,
          token,
          tokenAddress,
          handleCopyClick,
        }
        return isXSmDown ? <CrMobile key={key} {...crProps} /> : <CrDesktop key={key} {...crProps} />
      })}

      <StyledStats flex flexJustifyContent="space-between">
        {t`USD total`}
        <StyledChip size="md">
          {formatNumber(tvl?.value, FORMAT_OPTIONS.USD)}{' '}
          <IconTooltip placement="bottom end">{t`USD total balance updates every ~5 minute`}</IconTooltip>
        </StyledChip>
      </StyledStats>
    </article>
  )
}

const StyledTitle = styled.h3`
  margin-bottom: var(--spacing-2);
`

const StyledChip = styled(Chip)`
  padding: var(--spacing-2) 0;
`

export default CurrencyReserves
