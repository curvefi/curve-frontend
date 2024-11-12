import { Fragment } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'
import { useDashboardContext } from '@/components/PageDashboard/dashboardContext'
import { ExternalLink } from '@/ui/Link'
import useStore from '@/store/useStore'

const ClassicPoolsOnlyDescription = () => {
  const { rChainId, signerAddress } = useDashboardContext()
  const { missingPools, orgUIPath } = useStore((state) => state.networks.networks[rChainId])

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

export default ClassicPoolsOnlyDescription
