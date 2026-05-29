import { MouseEvent, useState } from 'react'
import { styled } from 'styled-components'
import { useConnection } from 'wagmi'
import { GaugeWeightHistoryChart } from '@/dao/components/Charts/GaugeWeightHistoryChart'
import { ExternalLinkIconButton } from '@/dao/components/ExternalLinkIconButton'
import { InternalLinkButton } from '@/dao/components/InternalLinkButton'
import { GaugeDetails } from '@/dao/components/PageGauges/GaugeListItem/GaugeDetails'
import { GaugeListColumns } from '@/dao/components/PageGauges/GaugeListItem/GaugeListColumns'
import { GaugeWeightVotesColumns } from '@/dao/components/PageGauges/GaugeListItem/GaugeWeightVotesColumns'
import { TitleComp } from '@/dao/components/PageGauges/GaugeListItem/TitleComp'
import { VoteGaugeField } from '@/dao/components/PageGauges/GaugeVoting/VoteGaugeField'
import { useLockerVecrvUser } from '@/dao/entities/locker-vecrv-user'
import { useUserGaugeVoteNextTimeQuery } from '@/dao/entities/user-gauge-vote-next-time'
import { useGaugesLegacy } from '@/dao/queries/gauges-legacy.query'
import { GaugeFormattedData, UserGaugeVoteWeight } from '@/dao/types/dao.types'
import type { Address } from '@primitives/address.utils'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { Icon } from '@ui/Icon'
import { IconButton } from '@ui/IconButton'
import { useCurrentDate } from '@ui-kit/hooks/useCurrentDate'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { Chain } from '@ui-kit/utils/network'

interface Props {
  gaugeData: GaugeFormattedData
  gridTemplateColumns: string
  userGaugeWeightVoteData?: UserGaugeVoteWeight
  powerUsed?: number
  userGaugeVote?: boolean
  addUserVote?: boolean
}

export const GaugeListItem = ({
  gaugeData,
  gridTemplateColumns,
  userGaugeWeightVoteData,
  powerUsed,
  userGaugeVote = false,
  addUserVote = false,
}: Props) => {
  const { address: userAddress } = useConnection()
  const { data: userGaugeVoteNextTime } = useUserGaugeVoteNextTimeQuery({
    chainId: Chain.Ethereum,
    gaugeAddress: userGaugeWeightVoteData?.gaugeAddress,
    userAddress,
  })
  const { data: gaugesLegacy } = useGaugesLegacy({})

  const gaugeCurveApiData =
    gaugesLegacy?.[gaugeData.effective_address?.toLowerCase() ?? gaugeData.address.toLowerCase()]

  const { data: userVeCrv } = useLockerVecrvUser({ chainId: Chain.Ethereum, userAddress })
  const [open, setOpen] = useState(false)
  const currentDate = useCurrentDate()
  const canVote = !userGaugeVoteNextTime || currentDate.getTime() > userGaugeVoteNextTime

  const gaugeExternalLink = gaugeCurveApiData?.isPool
    ? gaugeCurveApiData.poolUrls.deposit[0]
    : gaugeCurveApiData?.lendingVaultUrls.deposit

  return (
    <GaugeBox onClick={() => setOpen(!open)} addUserVote={addUserVote} open={open}>
      <DataComp gridTemplateColumns={gridTemplateColumns}>
        <TitleComp gaugeData={gaugeData} />
        {userGaugeWeightVoteData ? (
          <GaugeWeightVotesColumns userGaugeWeightVoteData={userGaugeWeightVoteData} />
        ) : (
          <GaugeListColumns gaugeData={gaugeData} />
        )}
        <Box flex flexJustifyContent="flex-end" flexAlignItems="center" margin="0 0 0 auto">
          {userGaugeWeightVoteData && canVote && (
            <UpdateGaugeIndicator variant="select-flat">{t`Update`}</UpdateGaugeIndicator>
          )}
          <StyledIconButton size="small">
            {open ? <Icon name="ChevronUp" size={16} /> : <Icon name="ChevronDown" size={16} />}
          </StyledIconButton>
        </Box>
      </DataComp>
      {open && (
        <OpenContainer
          onClick={(e?: MouseEvent) => {
            e?.stopPropagation()
          }}
        >
          <ChartWrapper>
            {userGaugeVote && powerUsed && userGaugeWeightVoteData && (
              <VoteGaugeFieldWrapper>
                <VoteGaugeField
                  powerUsed={powerUsed}
                  userVeCrv={+(userVeCrv?.veCrv ?? 0)}
                  userGaugeVoteData={userGaugeWeightVoteData}
                />
              </VoteGaugeFieldWrapper>
            )}
            {}
            <GaugeWeightHistoryChart gaugeAddress={gaugeData.address as Address} />
          </ChartWrapper>
          <GaugeDetails gaugeData={gaugeData} />
          <Box
            flex
            flexGap={'var(--spacing-3)'}
            flexAlignItems={'center'}
            margin={'var(--spacing-2) 0 var(--spacing-2) auto'}
          >
            <ExternalLinkIconButton
              href={gaugeExternalLink}
              tooltip={t`Visit gauge ${gaugeCurveApiData?.isPool ? 'pool' : 'market'}`}
            >
              {t`VISIT ${gaugeCurveApiData?.isPool ? 'POOL' : 'MARKET'}`}
            </ExternalLinkIconButton>
            <InternalLinkButton to={`${DAO_ROUTES.PAGE_GAUGES}/${gaugeData.effective_address ?? gaugeData.address}`}>
              {t`VISIT GAUGE`}
            </InternalLinkButton>
          </Box>
        </OpenContainer>
      )}
    </GaugeBox>
  )
}

const GaugeBox = styled.div<{ addUserVote: boolean; open: boolean }>`
  display: grid;
  padding: calc(var(--spacing-2) + var(--spacing-1)) var(--spacing-3) calc(var(--spacing-2) + var(--spacing-1));
  gap: var(--spacing-1);
  border-bottom: 1px solid var(--gray-500a20);
  ${({ addUserVote }) => addUserVote && 'border: 1px solid inherit;'}
  &:hover {
    cursor: pointer;
    background-color: var(--table_row--hover--color);
    ${({ open }) => open && 'background-color: inherit;'}
  }
`

const DataComp = styled.div<{ gridTemplateColumns: string }>`
  display: grid;
  grid-template-columns: ${({ gridTemplateColumns }) => gridTemplateColumns};
`

const StyledIconButton = styled(IconButton)`
  margin-left: auto;
  margin-right: 0;
`

const OpenContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3) var(--spacing-1) 0;
  gap: var(--spacing-3);
  cursor: default;
`

const ChartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  width: 100%;
  @media (min-width: 45.625rem) {
    flex-direction: row;
  }
`

const VoteGaugeFieldWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  @media (min-width: 45.625rem) {
    width: 50%;
  }
`

const UpdateGaugeIndicator = styled(Button)`
  padding: var(--spacing-1) var(--spacing-2);
  /* background-color: var(--warning-400);
  color: var(--page--text-color); */
  font-weight: var(--bold);
  font-size: var(--font-size-1);
`
