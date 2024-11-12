import { t } from '@lingui/macro'
import styled from 'styled-components'

import { copyToClipboard } from '@/lib/utils'
import { getChainPoolIdActiveKey } from '@/utils'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import usePoolTokensLinksMapper from '@/hooks/usePoolTokensLinksMapper'
import useStore from '@/store/useStore'
import { Chip } from '@/ui/Typography'
import { StyledStats } from '@/components/PagePool/PoolDetails/PoolStats/styles'
import CurrencyReservesContent from '@/components/PagePool/PoolDetails/CurrencyReserves/CurrencyReservesContent'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'

interface Props {
  rChainId: ChainId
  rPoolId: string
  tokensMapper: TokensMapper
  tvl: Tvl
}

const CurrencyReserves = ({ rChainId, rPoolId, tokensMapper, tvl }: Props) => {
  const network = useStore((state) => state.networks.networks[rChainId])
  const poolDataMapperCached = useStore((state) => state.storeCache.poolsMapper[rChainId]?.[rPoolId])
  const poolData = useStore((state) => state.pools.poolsMapper[rChainId]?.[rPoolId])
  const currencyReserves = useStore((state) => state.pools.currencyReserves[getChainPoolIdActiveKey(rChainId, rPoolId)])

  const poolDataCachedOrApi = poolData ?? poolDataMapperCached
  const poolTokensLinks = usePoolTokensLinksMapper(rChainId, poolDataCachedOrApi)

  const handleCopyClick = (address: string) => {
    copyToClipboard(address)
    console.log(`Copied ${address}`)
  }

  return (
    <article>
      <StyledTitle>{t`Currency reserves`}</StyledTitle>
      {poolDataCachedOrApi?.tokens.map((token, idx) => {
        const tokenAddress = poolDataCachedOrApi.tokenAddresses[idx]
        return (
          <CurrencyReservesContent
            key={`${token}-${idx}`}
            cr={currencyReserves?.tokens.find((t) => t.token === token)}
            haveSameTokenName={poolDataCachedOrApi.tokensCountBy[token] > 1}
            network={network}
            rChainId={rChainId}
            tokensMapper={tokensMapper}
            token={token}
            tokenAddress={tokenAddress}
            tokenLink={poolTokensLinks?.[tokenAddress]}
            handleCopyClick={handleCopyClick}
          />
        )
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
