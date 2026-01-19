import { styled } from 'styled-components'
import { CurrencyReservesContent } from '@/dex/components/PagePool/PoolDetails/CurrencyReserves/CurrencyReservesContent'
import { StyledStats } from '@/dex/components/PagePool/PoolDetails/PoolStats/styles'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolTokensLinksMapper } from '@/dex/hooks/usePoolTokensLinksMapper'
import { useStore } from '@/dex/store/useStore'
import { ChainId, TokensMapper, Tvl } from '@/dex/types/main.types'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import { TooltipIcon as IconTooltip } from '@ui/Tooltip/TooltipIcon'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { copyToClipboard } from '@ui-kit/utils'

interface Props {
  rChainId: ChainId
  rPoolId: string
  tokensMapper: TokensMapper
  tvl: Tvl
}

export const CurrencyReserves = ({ rChainId, rPoolId, tokensMapper, tvl }: Props) => {
  const { data: network } = useNetworkByChain({ chainId: rChainId })
  const poolDataMapperCached = useStore((state) => state.storeCache.poolsMapper[rChainId]?.[rPoolId])
  const poolData = useStore((state) => state.pools.poolsMapper[rChainId]?.[rPoolId])
  const currencyReserves = useStore((state) => state.pools.currencyReserves[getChainPoolIdActiveKey(rChainId, rPoolId)])

  const poolDataCachedOrApi = poolData ?? poolDataMapperCached
  const poolTokensLinks = usePoolTokensLinksMapper(rChainId, poolDataCachedOrApi)

  return (
    <article>
      <StyledTitle>{t`Currency reserves`}</StyledTitle>
      {poolDataCachedOrApi?.tokens.map((token, idx) => {
        const tokenAddress = poolDataCachedOrApi.tokenAddresses[idx]
        return (
          <CurrencyReservesContent
            key={`${token}-${idx}`}
            cr={currencyReserves?.tokens.find((t) => t.tokenAddress === tokenAddress)}
            haveSameTokenName={poolDataCachedOrApi.tokensCountBy[token] > 1}
            network={network}
            rChainId={rChainId}
            tokensMapper={tokensMapper}
            token={token}
            tokenAddress={tokenAddress}
            tokenLink={poolTokensLinks?.[tokenAddress]}
            handleCopyClick={copyToClipboard}
          />
        )
      })}

      <StyledStats flex flexJustifyContent="space-between">
        {t`USD total`}
        <StyledChip size="md">
          {formatNumber(tvl?.value, FORMAT_OPTIONS.USD)}{' '}
          <IconTooltip placement="bottom-end">{t`USD total balance updates every ~5 minute`}</IconTooltip>
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
