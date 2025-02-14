import styled from 'styled-components'
import { t } from '@ui-kit/lib/i18n'
import { useMemo } from 'react'

import networks from '@/dao/networks'

import Box from '@ui/Box'
import Loader from '@ui/Loader'
import SmallLabel from '@/dao/components/SmallLabel'
import TokenIcons from '@/dao/components/TokenIcons'
import { GaugeFormattedData } from '@/dao/types/dao.types'

interface GaugeHeaderProps {
  gaugeData: GaugeFormattedData | undefined
  dataLoading: boolean
}

const GaugeHeader = ({ gaugeData, dataLoading }: GaugeHeaderProps) => {
  const imageBaseUrlFormatted = useMemo(() => {
    const imageBaseUrl = networks[1].imageBaseUrl

    if (!gaugeData) return imageBaseUrl

    if (gaugeData.pool) {
      if (gaugeData.pool.chain === 'ethereum') {
        return imageBaseUrl
      }
      // Insert chain before the last slash in imageBaseUrl
      const baseUrlWithoutTrailingSlash = imageBaseUrl.replace(/\/$/, '')
      return `${baseUrlWithoutTrailingSlash}-${gaugeData.pool.chain}/`
    }
    if (gaugeData.market) {
      if (gaugeData.market.chain === 'ethereum') {
        return imageBaseUrl
      }
      const baseUrlWithoutTrailingSlash = imageBaseUrl.replace(/\/$/, '')
      return `${baseUrlWithoutTrailingSlash}-${gaugeData.market.chain}/`
    }
    return imageBaseUrl
  }, [gaugeData])

  return (
    <Wrapper variant="secondary">
      <BoxedDataComp>
        {gaugeData?.tokens && <TokenIcons imageBaseUrl={imageBaseUrlFormatted} tokens={gaugeData?.tokens} />}
        {dataLoading ? (
          <>
            <Loader isLightBg skeleton={[65, 28]} />
            <Loader isLightBg skeleton={[35, 28]} />
          </>
        ) : (
          <>
            <h3>{gaugeData?.title}</h3>
            {gaugeData?.is_killed && <SmallLabel description={t`Killed`} isKilled />}
            {gaugeData?.platform && <SmallLabel description={gaugeData?.platform} />}
            {gaugeData?.pool?.chain && <SmallLabel description={gaugeData?.pool.chain} isNetwork />}
            {gaugeData?.market?.chain && <SmallLabel description={gaugeData?.market.chain} isNetwork />}
          </>
        )}
      </BoxedDataComp>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  padding: var(--spacing-3);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3);
  background-color: var(--box_header--secondary--background-color);
`

const BoxedDataComp = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-1);
  grid-row: 1 / 2;
  margin-right: var(--spacing-2);
  @media (min-width: 33.125rem) {
    display: flex;
    flex-direction: row;
    margin-left: 0;
  }
  h3 {
    margin-right: var(--spacing-1);
  }
`

export default GaugeHeader
