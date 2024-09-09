import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { formatNumber } from '@/ui/utils'
import networks from '@/networks'

import Box from '@/ui/Box'
import MetricsComp, { MetricsRowData } from '@/components/MetricsComp'
import SmallLabel from '@/components/SmallLabel'
import CopyIconButton from '@/components/CopyIconButton'
import ExternalLinkIconButton from '@/components/ExternalLinkIconButton'

type GaugeVoteItemProps = {
  gauge: UserGaugeVoteWeight
}

const GaugeVoteItem = ({ gauge }: GaugeVoteItemProps) => {
  const gaugeMapperData = useStore((state) => state.gauges.gaugeMapper[gauge.gaugeAddress])

  return (
    <Wrapper key={gauge.gaugeAddress}>
      <Box flex flexJustifyContent="space-between" flexAlignItems="center">
        <BoxedDataComp>
          <h4>{gaugeMapperData?.title}</h4>
          {gaugeMapperData.is_killed && <SmallLabel description={t`Killed`} isKilled />}
          {gaugeMapperData.platform && <SmallLabel description={gaugeMapperData.platform} />}
          {gaugeMapperData.pool?.chain && <SmallLabel description={gaugeMapperData.pool.chain} isNetwork />}
          {gaugeMapperData.market?.chain && <SmallLabel description={gaugeMapperData.market.chain} isNetwork />}
        </BoxedDataComp>
        <Box flex flexGap="var(--spacing-1)">
          <GaugeAddress>{gauge.gaugeAddress}</GaugeAddress>
          <ButtonsWrapper>
            <ExternalLinkIconButton
              href={networks[1].scanAddressPath(gauge.gaugeAddress ?? '')}
              tooltip={t`View on explorer`}
            />
            <CopyIconButton copyContent={gauge.gaugeAddress ?? ''} tooltip={t`Copy address`} />
          </ButtonsWrapper>
        </Box>
      </Box>
      <Box flex flexGap="var(--spacing-3)">
        <MetricsComp
          loading={false}
          title="User Weight"
          row
          data={<MetricsRowData>{gauge.userPower}%</MetricsRowData>}
        />
        <MetricsComp
          loading={false}
          title="User veCRV used"
          row
          data={
            <MetricsRowData>
              {formatNumber(gauge.userVeCrv, { showDecimalIfSmallNumberOnly: true })} veCRV
            </MetricsRowData>
          }
        />
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3);
  width: 100%;
  flex-grow: 1;
  gap: var(--spacing-2);
`

const BoxedDataComp = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-1);
  margin-right: var(--spacing-2);
  h4 {
    margin-right: var(--spacing-1);
  }
`

const GaugeAddress = styled.p`
  font-size: var(--font-size-2);
`

const ButtonsWrapper = styled.div`
  display: flex;
  gap: var(--spacing-1);
`

export default GaugeVoteItem
