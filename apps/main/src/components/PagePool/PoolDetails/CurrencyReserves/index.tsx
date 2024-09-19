import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { copyToClipboard } from '@/lib/utils'
import { usePoolUnderlyingCurrencyReserves, usePoolWrappedCurrencyReserves } from '@/entities/pool'
import { usePoolContext } from '@/components/PagePool/contextPool'
import networks from '@/networks'
import usePoolTokensLinksMapper from '@/hooks/usePoolTokensLinksMapper'

import { Chip } from '@/ui/Typography'
import { StyledStats } from '@/components/PagePool/PoolDetails/PoolStats/styles'
import CurrencyReservesContent from '@/components/PagePool/PoolDetails/CurrencyReserves/components/CurrencyReservesContent'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'

const CurrencyReserves: React.FC = () => {
  const { rChainId, rPoolId, isWrapped, poolBaseKeys, poolTvl, poolDataCacheOrApi, tokensMapper } = usePoolContext()

  const { data: currencyReservesUnderlying } = usePoolUnderlyingCurrencyReserves({ ...poolBaseKeys, poolId: rPoolId })

  const { data: currencyReservesWrapped = currencyReservesUnderlying } = usePoolWrappedCurrencyReserves({
    ...poolBaseKeys,
    isWrapped,
  })

  const poolTokensLinks = usePoolTokensLinksMapper(rChainId, poolDataCacheOrApi)

  const currencyReservesData = isWrapped ? currencyReservesWrapped : currencyReservesUnderlying

  return (
    <article>
      <StyledTitle>{t`Currency reserves`}</StyledTitle>
      {currencyReservesData?.tokens.map((crToken, idx) => {
        const tokenObj = tokensMapper[crToken.tokenAddress]
        return (
          <CurrencyReservesContent
            key={`${crToken.token}-${idx}`}
            rChainId={rChainId}
            cr={crToken}
            tokenObj={tokenObj}
            network={networks[rChainId]}
            tokenLink={poolTokensLinks?.[crToken.tokenAddress]}
            handleCopyClick={copyToClipboard}
          />
        )
      })}

      <StyledStats flex flexJustifyContent="space-between">
        {t`USD total`}
        <StyledChip size="md">
          {formatNumber(poolTvl, FORMAT_OPTIONS.USD)}{' '}
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
