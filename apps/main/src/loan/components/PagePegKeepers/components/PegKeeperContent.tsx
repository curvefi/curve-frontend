import React from 'react'
import { t } from '@ui-kit/lib/i18n'
import styled from 'styled-components'

import { breakpoints, formatNumber, type NumberFormatOptions } from '@ui/utils'
import useStore from '@/loan/store/useStore'

import Box from '@ui/Box'
import ExternalLink from '@ui/Link/ExternalLink'
import ListInfoItem, { ListInfoItems } from '@ui/ListInfo'
import PegKeeperLabel from '@/loan/components/PagePegKeepers/components/PegKeeperLabel'
import PegKeeperForm from '@/loan/components/PagePegKeepers/components/PegKeeperForm'
import TextCaption from '@ui/TextCaption'
import { ChainId } from '@/loan/types/loan.types'
import { APP_LINK } from '@ui-kit/shared/routes'

type Props = {
  rChainId: ChainId
  pegKeeperAddress: string
  pool: {
    id: string
    underlyingCoins: string[]
    underlyingCoinAddresses: string[]
  }
}

const PegKeeperContent = ({ rChainId, pegKeeperAddress, pool }: Props) => {
  const detailsMapper = useStore((state) => state.pegKeepers.detailsMapper)

  const { debt, debtCeiling } = detailsMapper[pegKeeperAddress] ?? {}

  const poolName = `${pool.underlyingCoins[0]}/${pool.underlyingCoins[1]}`
  const formatOptions: NumberFormatOptions = { notation: 'compact', defaultValue: '-' }

  return (
    <Wrapper>
      <StyledContent>
        <StyledPegKeeperLabel {...pool} poolName={poolName} rChainId={rChainId} />

        <StyledInnerContent grid gridGap={3}>
          <StyledListInfoItems>
            <ListInfoItem title={t`Debt`}>{formatNumber(debt, formatOptions)}</ListInfoItem>
            <ListInfoItem title={t`Debt Ceiling`}>{formatNumber(debtCeiling, formatOptions)}</ListInfoItem>
          </StyledListInfoItems>
          <PegKeeperForm rChainId={rChainId} poolName={poolName} pegKeeperAddress={pegKeeperAddress} />
          <StyledLinks>
            <TextCaption isBold isCaps>{t`View:`}</TextCaption>
            <StyledExternalLink href={`${APP_LINK.dex.root}/ethereum/pools/${pool.id}/deposit`}>
              Pool
            </StyledExternalLink>
            <StyledExternalLink href={`https://etherscan.io/address/${pegKeeperAddress}`}>Contract</StyledExternalLink>
          </StyledLinks>
        </StyledInnerContent>
      </StyledContent>
    </Wrapper>
  )
}

const Wrapper = styled.li`
  display: grid;
  align-content: flex-start;

  @media (min-width: ${breakpoints.sm}rem) {
    flex-grow: 1;
    flex-basis: 0;
    min-width: 40%;
  }

  @media (min-width: ${breakpoints.md}rem) {
    min-width: auto;
  }
`

const StyledContent = styled.div`
  border: 1px solid var(--border-400);
`

const StyledInnerContent = styled(Box)`
  padding: var(--spacing-narrow);
`

const StyledPegKeeperLabel = styled(PegKeeperLabel)`
  border-bottom: 1px solid var(--border-400);
`

const StyledListInfoItems = styled(ListInfoItems)`
  margin-bottom: var(--spacing-narrow);
`

const StyledLinks = styled.div`
  opacity: 0.6;
`

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  font-size: var(--font-size-2);
  font-weight: bold;
  margin-left: var(--spacing-narrow);
  text-transform: initial;
`

export default PegKeeperContent
