import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useEffect, useMemo } from 'react'

import useStore from '@/store/useStore'
import networks from '@/networks'
import { copyToClipboard } from '@/utils'
import { shortenTokenAddress, formatNumber, formatDateFromTimestamp, convertToLocaleTimestamp } from '@/ui/utils'

import Button from '@/ui/Button'
import IconButton from '@/ui/IconButton'
import Tooltip from '@/ui/Tooltip'
import Box, { BoxHeader } from '@/ui/Box'
import Icon from '@/ui/Icon'
import { ExternalLink } from '@/ui/Link'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import Loader from 'ui/src/Loader/Loader'
import ErrorMessage from '@/components/ErrorMessage'

const VeCrv = () => {
  const { getVeCrvFees, veCrvFetchStatus, veCrvFees } = useStore((state) => state.vecrv)

  const feesLoading = veCrvFetchStatus === 'LOADING'
  const feesError = veCrvFetchStatus === 'ERROR'
  const feesReady = veCrvFetchStatus === 'SUCCESS'

  const totalFees = useMemo(() => {
    return veCrvFees.reduce((acc, item) => acc + item.fees_usd, 0)
  }, [veCrvFees])

  useEffect(() => {
    if (veCrvFees.length === 0 && veCrvFetchStatus !== 'ERROR') {
      getVeCrvFees()
    }
  }, [getVeCrvFees, veCrvFees.length, veCrvFetchStatus])

  return (
    <Wrapper>
      <PageTitle>veCRV</PageTitle>
      <Content>
        <FeesBox variant="secondary" flex flexColumn>
          <BoxTitle>Weekly veCRV Fees</BoxTitle>
          <FeesTitlesRow>
            <FeesSubtitle>Distribution Date</FeesSubtitle>
            <FeesSubtitle>Fees</FeesSubtitle>
          </FeesTitlesRow>
          {feesLoading && (
            <StyledSpinnerWrapper>
              <Spinner />
            </StyledSpinnerWrapper>
          )}
          {feesError && <ErrorMessage message="Error fetching veCRV historical fees" onClick={getVeCrvFees} />}
          {feesReady && (
            <>
              <FeesContainer>
                {veCrvFees.map((item) => {
                  return (
                    <FeeRow key={item.timestamp}>
                      <FeeDate>
                        {formatDateFromTimestamp(convertToLocaleTimestamp(new Date(item.timestamp).getTime() / 1000))}
                      </FeeDate>
                      <FeeData>
                        $
                        {formatNumber(item.fees_usd, {
                          showDecimalIfSmallNumberOnly: true,
                        })}
                      </FeeData>
                    </FeeRow>
                  )
                })}
              </FeesContainer>
              <TotalFees>
                <FeeDate>Total Fees:</FeeDate>
                <FeeData>${formatNumber(totalFees, { showDecimalIfSmallNumberOnly: true })}</FeeData>
              </TotalFees>
            </>
          )}
        </FeesBox>
      </Content>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-4) auto var(--spacing-6);
  width: 65rem;
  max-width: 100%;
  flex-grow: 1;
  min-height: 100%;
  @media (min-width: 34.375rem) {
    max-width: 95%;
  }
`

const PageTitle = styled.h2`
  margin: var(--spacing-2) auto var(--spacing-1) var(--spacing-3);
  background-color: black;
  color: var(--nav--page--color);
  font-size: var(--font-size-5);
  font-weight: bold;
  line-height: 1;
  padding: 0 2px;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  display: flex;
  width: 100%;
  margin-bottom: var(--spacing-4);
`

const BoxTitle = styled.h2`
  font-size: var(--font-size-3);
  font-weight: bold;
  padding: var(--spacing-3);
`

const FeesBox = styled(Box)`
  margin: 0 auto;
`

const FeesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  max-height: 31.25rem;
  overflow-y: auto;
  padding: 0 var(--spacing-3);
`

const FeesTitlesRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-5);
  justify-content: space-between;
  padding: var(--spacing-2) var(--spacing-3) var(--spacing-2);
`

const FeesSubtitle = styled.h4`
  font-size: var(--font-size-1);
  font-weight: bold;
  opacity: 0.5;
`

const FeeRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-5);
  justify-content: space-between;
  border-bottom: 1px solid var(--gray-500a20);
  padding-bottom: var(--spacing-2);
  &:last-child {
    border-bottom: none;
  }
`

const FeeData = styled.p`
  font-size: var(--font-size-2);
  font-weight: bold;
  font-variant-numeric: tabular-nums;
  text-align: right;
`

const FeeDate = styled(FeeData)`
  text-align: left;
  font-weight: var(--semi-bold);
`

const TotalFees = styled.div`
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--gray-500a20);
  padding: var(--spacing-3);
  margin-top: var(--spacing-3);
`

export default VeCrv
