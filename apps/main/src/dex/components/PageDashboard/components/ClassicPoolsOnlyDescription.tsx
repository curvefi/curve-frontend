import { Fragment } from 'react'
import styled from 'styled-components'
import { useDashboardContext } from '@/dex/components/PageDashboard/dashboardContext'
import useStore from '@/dex/store/useStore'
import { ExternalLink } from '@ui/Link'
import { t } from '@ui-kit/lib/i18n'

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
