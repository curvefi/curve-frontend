import { Fragment } from 'react'
import { styled } from 'styled-components'
import { useDashboardContext } from '@/dex/components/PageDashboard/dashboardContext'
import { useNetworkByChain } from '@/dex/entities/networks'
import { ExternalLink } from '@ui/Link'
import { t } from '@ui-kit/lib/i18n'

export const ClassicPoolsOnlyDescription = () => {
  const { rChainId, signerAddress } = useDashboardContext()
  const {
    data: { missingPools, orgUIPath },
  } = useNetworkByChain({ chainId: rChainId })

  return (
    !!signerAddress &&
    missingPools?.length > 0 && (
      <MissingPoolDescription>
        {t`*This UI does not support the following pools:`}{' '}
        {missingPools.map((pool, idx) => (
          <Fragment key={pool.name}>
            {idx === 0 ? '' : ', '}
            <ExternalLink $noStyles href={pool.url}>
              {pool.name}
            </ExternalLink>
          </Fragment>
        ))}
        {t`. Please click on the pool name to view them on`} {orgUIPath}{' '}
      </MissingPoolDescription>
    )
  )
}

const MissingPoolDescription = styled.p`
  padding: 1rem;
`
