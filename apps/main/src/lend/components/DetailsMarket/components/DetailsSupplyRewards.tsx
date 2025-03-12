import styled, { css } from 'styled-components'
import ChipInactive from '@/lend/components/ChipInactive'
import useSupplyTotalApr from '@/lend/hooks/useSupplyTotalApr'
import networks from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { shortenTokenName } from '@/lend/utils/helpers'
import Box from '@ui/Box'
import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton'
import ExternalLink from '@ui/Link/ExternalLink'
import ListInfoItem from '@ui/ListInfo'
import TextCaption from '@ui/TextCaption'
import Chip from '@ui/Typography/Chip'
import { breakpoints, FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { copyToClipboard } from '@ui-kit/utils'

// TODO: refactor to UI
const DetailsSupplyRewards = ({ rChainId, rOwmId }: { rChainId: ChainId; rOwmId: string }) => {
  const { invalidGaugeAddress, totalApr, tooltipValues } = useSupplyTotalApr(rChainId, rOwmId)

  return (
    <RewardsWrapper>
      <RewardsTitle>
        <ListInfoItem as="div" title={t`Total APR`}>
          {totalApr.minMax}
        </ListInfoItem>
      </RewardsTitle>

      {/* BASE */}
      <RewardsItem $marginBottom={2}>
        <span>{t`LEND APR`}</span>
        <span>
          {tooltipValues?.lendApr} {tooltipValues?.lendApy && <TextCaption>({tooltipValues.lendApy})</TextCaption>}
        </span>
      </RewardsItem>

      {/* CRV */}
      {tooltipValues?.crv && (
        <RewardsItem $marginBottom={1}>
          <span>{t`CRV APR (unboosted)`}</span>
          {tooltipValues.crv}
        </RewardsItem>
      )}
      {tooltipValues?.crvBoosted && (
        <RewardsItem $marginBottom={2}>
          <span>{t`CRV APR (max boosted x2.50)`}</span>
          {tooltipValues.crvBoosted}
        </RewardsItem>
      )}

      {/* INCENTIVES */}
      {invalidGaugeAddress ? (
        <RewardsItem>
          <span>{t`Incentives APR`}</span>
          <ChipInactive>No gauge</ChipInactive>
        </RewardsItem>
      ) : tooltipValues?.incentivesObj && (tooltipValues.incentivesObj || []).length > 0 ? (
        <>
          <RewardsItem>
            <span>{t`Incentives APR`}</span>
          </RewardsItem>
          {tooltipValues.incentivesObj.map(({ apy, symbol, tokenAddress }) => (
            <Box
              key={symbol}
              flex
              flexAlignItems="baseline"
              flexJustifyContent="space-between"
              padding="0 0 0 var(--spacing-1)"
            >
              <Box flex flexAlignItems="center">
                <StyledExternalLink href={networks[rChainId].scanTokenPath(tokenAddress)}>
                  <TokenWrapper flex flexAlignItems="center" padding="var(--spacing-1) 0">
                    {shortenTokenName(symbol)} <Icon name="Launch" size={16} />
                  </TokenWrapper>
                </StyledExternalLink>

                <StyledIconButton size="small" onClick={() => copyToClipboard(tokenAddress)}>
                  <Icon name="Copy" size={16} />
                </StyledIconButton>
              </Box>
              <Chip size="md">{formatNumber(apy, FORMAT_OPTIONS.PERCENT)} </Chip>
            </Box>
          ))}
        </>
      ) : null}

      <BoostingLink $noStyles href="https://resources.curve.fi/reward-gauges/boosting-your-crv-rewards">
        {t`Learn more about Boosting your CRV rewards`}
      </BoostingLink>
    </RewardsWrapper>
  )
}

const RewardsItem = styled.div<{ $marginBottom?: number }>`
  align-items: flex-end;
  display: flex;
  flex-direction: row;
  font-size: var(--font-size-3);
  justify-content: space-between;
  ${({ $marginBottom }) => $marginBottom && `margin-bottom: var(--spacing-${$marginBottom})`};

  > span:first-of-type {
    font-weight: 500;
    font-size: var(--font-size-2);
  }

  @media (min-width: ${breakpoints.sm}rem) {
    align-items: flex-end;
    flex-direction: row;
    justify-content: space-between;
  }
`

const actionStyles = css`
  align-items: center;
  display: inline-flex;

  color: inherit;
  background-color: transparent;
  border: 1px solid transparent;
  opacity: 0.5;

  &:hover {
    color: var(--button_icon--hover--color);
    background-color: var(--button_icon--hover--background-color);
  }
`
const StyledIconButton = styled(IconButton)`
  ${actionStyles}
`

const RewardsWrapper = styled.div`
  border: 1px solid var(--border-600);
  padding: var(--spacing-narrow);
  padding-top: var(--spacing-2);
  margin-top: var(--spacing-normal);

  @media (min-width: ${breakpoints.sm}rem) {
    padding: var(--spacing-normal);
  }
`

const RewardsTitle = styled.h3`
  margin-bottom: var(--spacing-3);
`

const TokenWrapper = styled(Box)`
  text-transform: initial;

  svg {
    padding-top: 0.3125rem;
  }
`

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  font-weight: 500;
  text-decoration: underline;
`

const BoostingLink = styled(ExternalLink)`
  color: inherit;
  display: block;
  font-weight: 500;
  text-transform: initial;
  font-size: var(--font-size-2);
  margin-top: var(--spacing-3);
`

export default DetailsSupplyRewards
